import { clamp } from "@/lib/utils/clamp";

// ─── Configuração ─────────────────────────────────────────────────────────────

export interface WolterConfig {
  /** Meta de commits por semana (padrão 20). */
  commitGoal: number;
  /** Tamanho máximo aceitável de commit em linhas (padrão 400). */
  commitSizeLimit: number;
  /** Cycle time ideal em horas (padrão 48). */
  cycleTimeGoalHours: number;
  /** Pesos dos componentes — devem somar 1. */
  weights: {
    c: number;
    p: number;
    q: number;
    r: number;
    b: number;
  };
}

export const defaultWolterConfig: WolterConfig = {
  commitGoal: 20,
  commitSizeLimit: 400,
  cycleTimeGoalHours: 48,
  weights: { c: 0.30, p: 0.25, q: 0.20, r: 0.15, b: 0.10 },
};

// ─── Inputs ───────────────────────────────────────────────────────────────────

export interface WolterInput {
  /** Total de commits no período. */
  commitCount: number;
  /** Dias com pelo menos 1 commit. */
  activeDays: number;
  /** Total de dias do período. */
  totalDays: number;
  /** Média de linhas alteradas por commit (additions + deletions). */
  avgLinesPerCommit: number;

  /** PRs abertas no período. */
  prOpened: number;
  /** PRs mergeadas no período. */
  prMerged: number;
  /** Cycle time médio em horas. */
  avgCycleTimeHours: number | null;

  /** Issues reabertas no período. */
  reopenedIssues: number;
  /** Total de issues fechadas no período. */
  totalIssues: number;

  /** Reviews realizadas pelo usuário. */
  reviewsPerformed: number;
  /** Média de reviews do time no mesmo período. */
  teamAvgReviews: number;

  /** Tempo em PRs de bug fix (horas). */
  bugFixTimeHours: number;
  /** Tempo total em desenvolvimento (horas). */
  totalDevTimeHours: number;
}

// ─── Componentes individuais ──────────────────────────────────────────────────

/**
 * C — Componente de Commit Quality & Frequency (0–100)
 * C = 0.5·commitFreq + 0.3·activityFreq + 0.2·commitSize
 */
export function computeCommitScore(
  input: Pick<WolterInput, "commitCount" | "activeDays" | "totalDays" | "avgLinesPerCommit">,
  config: WolterConfig = defaultWolterConfig,
): number | null {
  if (input.totalDays <= 0) return null;

  const weeksInPeriod = input.totalDays / 7;
  const commitGoalForPeriod = config.commitGoal * weeksInPeriod;

  const commitFreq = clamp(
    (input.commitCount / commitGoalForPeriod) * 100,
    0,
    100,
  );
  const activityFreq = (input.activeDays / input.totalDays) * 100;
  const commitSize = clamp(
    Math.max(0, 1 - input.avgLinesPerCommit / config.commitSizeLimit) * 100,
    0,
    100,
  );

  return 0.5 * commitFreq + 0.3 * activityFreq + 0.2 * commitSize;
}

/**
 * P — Componente de Pull Request (0–100)
 * P = 0.6·acceptanceRate + 0.4·cycleTimeScore
 */
export function computePullRequestScore(
  input: Pick<WolterInput, "prOpened" | "prMerged" | "avgCycleTimeHours">,
  config: WolterConfig = defaultWolterConfig,
): number | null {
  if (input.prOpened <= 0) return null;

  const acceptanceRate = (input.prMerged / input.prOpened) * 100;
  const cycleTimeScore =
    input.avgCycleTimeHours != null
      ? clamp(
          Math.max(0, 1 - input.avgCycleTimeHours / config.cycleTimeGoalHours) * 100,
          0,
          100,
        )
      : null;

  if (cycleTimeScore == null) {
    return acceptanceRate;
  }

  return 0.6 * acceptanceRate + 0.4 * cycleTimeScore;
}

/**
 * Q — Componente de Qualidade (0–100)
 * Q = 0.7·acceptanceRate + 0.3·reopenScore
 */
export function computeQualityScore(
  input: Pick<WolterInput, "prOpened" | "prMerged" | "reopenedIssues" | "totalIssues">,
): number | null {
  if (input.prOpened <= 0 && input.totalIssues <= 0) return null;

  const acceptanceRate =
    input.prOpened > 0 ? (input.prMerged / input.prOpened) * 100 : 50;

  const reopenScore =
    input.totalIssues > 0
      ? clamp(
          Math.max(0, 1 - input.reopenedIssues / input.totalIssues) * 100,
          0,
          100,
        )
      : 100;

  return 0.7 * acceptanceRate + 0.3 * reopenScore;
}

/**
 * R — Componente de Reviews (0–100)
 * R = min((reviewsPerformed / teamAvg) × 100, 100)
 */
export function computeReviewScore(
  input: Pick<WolterInput, "reviewsPerformed" | "teamAvgReviews">,
): number | null {
  if (input.teamAvgReviews <= 0) return null;
  return clamp((input.reviewsPerformed / input.teamAvgReviews) * 100, 0, 100);
}

/**
 * B — Componente de Bug Fix (0–100, quanto menor o ratio melhor)
 * B = max(0, 1 − bugFixTime/totalDevTime) × 100
 */
export function computeBugFixScore(
  input: Pick<WolterInput, "bugFixTimeHours" | "totalDevTimeHours">,
): number | null {
  if (input.totalDevTimeHours <= 0) return null;
  return clamp(
    Math.max(0, 1 - input.bugFixTimeHours / input.totalDevTimeHours) * 100,
    0,
    100,
  );
}

// ─── Score final ─────────────────────────────────────────────────────────────

export interface WolterResult {
  score: number;
  c: number | null;
  p: number | null;
  q: number | null;
  r: number | null;
  b: number | null;
}

/**
 * Calcula o Score Wolter (0–100).
 * Quando um componente é null (dados insuficientes), seu peso é
 * redistribuído proporcionalmente entre os componentes disponíveis.
 */
export function computeWolterScore(
  input: WolterInput,
  config: WolterConfig = defaultWolterConfig,
): WolterResult {
  const c = computeCommitScore(input, config);
  const p = computePullRequestScore(input, config);
  const q = computeQualityScore(input);
  const r = computeReviewScore(input);
  const b = computeBugFixScore(input);

  const components: { key: keyof typeof config.weights; value: number | null }[] = [
    { key: "c", value: c },
    { key: "p", value: p },
    { key: "q", value: q },
    { key: "r", value: r },
    { key: "b", value: b },
  ];

  const available = components.filter((comp) => comp.value != null);

  if (available.length === 0) {
    return { score: 0, c, p, q, r, b };
  }

  const totalWeight = available.reduce(
    (sum, comp) => sum + config.weights[comp.key],
    0,
  );

  const score = clamp(
    available.reduce(
      (sum, comp) =>
        sum + (comp.value! * config.weights[comp.key]) / totalWeight,
      0,
    ),
    0,
    100,
  );

  return { score, c, p, q, r, b };
}

// ─── Classificação ────────────────────────────────────────────────────────────

export type ScoreClassification = "Baixa" | "Moderada" | "Boa" | "Alta";

export function scoreClassification(score: number): ScoreClassification {
  if (score >= 80) return "Alta";
  if (score >= 60) return "Boa";
  if (score >= 40) return "Moderada";
  return "Baixa";
}
