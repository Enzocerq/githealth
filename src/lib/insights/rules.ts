import type { Commit, MetricSnapshot, PullRequest } from "@prisma/client";

const weekDays = [
  "domingos",
  "segundas",
  "tercas",
  "quartas",
  "quintas",
  "sextas",
  "sabados",
];

function periodLabel(hour: number): string {
  if (hour < 6) return "madrugada";
  if (hour < 12) return "manha";
  if (hour < 18) return "tarde";
  return "noite";
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Retorna insight se a taxa de aceitação de PRs cresceu ou caiu >= 10%
 * comparando a primeira metade dos snapshots com a segunda.
 */
export function acceptanceTrendRule(snapshots: MetricSnapshot[]): string | null {
  const valid = snapshots.filter((s) => s.acceptanceRate != null);
  if (valid.length < 6) return null;

  const mid = Math.floor(valid.length / 2);
  const previous = average(valid.slice(0, mid).map((s) => s.acceptanceRate ?? 0));
  const current = average(valid.slice(mid).map((s) => s.acceptanceRate ?? 0));

  if (previous == null || current == null) return null;

  const delta = current - previous;

  if (delta >= 10) {
    return `Sua taxa de aceitacao de PRs cresceu ${delta.toFixed(1).replace(".", ",")}% no periodo recente.`;
  }
  if (delta <= -10) {
    return `Sua taxa de aceitacao de PRs caiu ${Math.abs(delta).toFixed(1).replace(".", ",")}%; vale revisar tamanho e contexto das PRs.`;
  }

  return null;
}

/**
 * Retorna insight se o tempo médio de review superar 48 horas.
 */
export function reviewWaitRule(snapshots: MetricSnapshot[]): string | null {
  const avgReviewTime = average(
    snapshots
      .map((s) => s.avgReviewTimeHours)
      .filter((v): v is number => v != null),
  );

  if (avgReviewTime == null || avgReviewTime <= 48) return null;

  return `Seu codigo aguarda em media ${(avgReviewTime / 24).toFixed(1).replace(".", ",")} dias por revisao externa.`;
}

/**
 * Retorna insight sobre o dia da semana e período do dia com mais commits.
 */
export function productivityWindowRule(commits: Commit[]): string | null {
  if (commits.length < 3) return null;

  const buckets = new Map<string, { day: number; hour: number; count: number }>();

  for (const commit of commits) {
    const day = commit.committedAt.getDay();
    const bucketHour = Math.floor(commit.committedAt.getHours() / 6) * 6;
    const key = `${day}-${bucketHour}`;
    const current = buckets.get(key);
    buckets.set(key, { day, hour: bucketHour, count: (current?.count ?? 0) + 1 });
  }

  const top = [...buckets.values()].sort((a, b) => b.count - a.count)[0];
  if (!top) return null;

  return `Sua janela de maior atividade aparece nas ${weekDays[top.day]} a ${periodLabel(top.hour)}.`;
}

/**
 * Retorna insight se o tempo em bug fixes superar 30% do total.
 */
export function bugFixRatioRule(pullRequests: PullRequest[]): string | null {
  const finished = pullRequests.filter((pr) => pr.cycleTimeMs != null);
  if (finished.length === 0) return null;

  const total = finished.reduce(
    (sum, pr) => sum + Number(pr.cycleTimeMs ?? BigInt(0)),
    0,
  );
  const bugFix = finished
    .filter((pr) => pr.isBugFix)
    .reduce((sum, pr) => sum + Number(pr.cycleTimeMs ?? BigInt(0)), 0);

  if (total <= 0) return null;

  const ratio = (bugFix / total) * 100;

  if (ratio > 30) {
    return `${ratio.toFixed(1).replace(".", ",")}% do seu esforco em PRs mergeadas esta concentrado em correcoes.`;
  }

  return null;
}
