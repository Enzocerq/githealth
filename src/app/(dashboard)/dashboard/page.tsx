import { GitCommitHorizontal, GitPullRequest, CheckCircle2, TrendingUp } from "lucide-react";

import { getOverviewData } from "@/app/actions/metrics";
import { InitialSyncPanel } from "@/components/dashboard/initial-sync-panel";
import { WolterScoreCard } from "@/components/metrics/wolter-score-card";
import { KpiCard } from "@/components/metrics/kpi-card";
import { ScoreLineChart } from "@/components/charts/score-line-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPercent } from "@/lib/utils/format";

export default async function DashboardPage() {
  const { user, snapshot, repositories, lastJob, scoreSeries } = await getOverviewData();

  // Usuário sem dados — nunca sincronizou
  const needsSync = !lastJob || (lastJob.status === "done" && !snapshot);
  const isSyncing = lastJob?.status === "running" || lastJob?.status === "pending";

  if (!lastJob || needsSync) {
    return <InitialSyncPanel />;
  }

  if (isSyncing) {
    return <InitialSyncPanel />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">
          Ola, {user.name?.split(" ")[0] ?? "dev"} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aqui esta um resumo da sua saude de engenharia nos ultimos 90 dias.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <WolterScoreCard snapshot={snapshot} />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Commits"
            value={formatNumber(snapshot?.commitCount ?? 0)}
            icon={GitCommitHorizontal}
            tone="blue"
          />
          <KpiCard
            label="PRs abertas"
            value={formatNumber(snapshot?.prOpenedCount ?? 0)}
            icon={GitPullRequest}
            tone="purple"
          />
          <KpiCard
            label="PRs mergeadas"
            value={formatNumber(snapshot?.prMergedCount ?? 0)}
            icon={CheckCircle2}
            tone="green"
          />
          <KpiCard
            label="Taxa de aceitacao"
            value={formatPercent(snapshot?.acceptanceRate)}
            icon={TrendingUp}
            tone="amber"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolucao do Score Wolter (90 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreLineChart data={scoreSeries} />
        </CardContent>
      </Card>
    </div>
  );
}
