import { GitCommitHorizontal, GitPullRequest, CheckCircle2, TrendingUp } from "lucide-react";

import { WolterScoreCard } from "@/components/metrics/wolter-score-card";
import { KpiCard } from "@/components/metrics/kpi-card";
import { ScoreLineChart } from "@/components/charts/score-line-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPercent } from "@/lib/utils/format";
import { mockSnapshot, mockScoreSeries, mockUser } from "@/lib/mock-data";

export default function PreviewDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">
          Ola, {mockUser.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aqui esta um resumo da sua saude de engenharia nos ultimos 90 dias.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <WolterScoreCard snapshot={mockSnapshot} />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Commits"
            value={formatNumber(mockSnapshot.commitCount)}
            icon={GitCommitHorizontal}
            tone="blue"
          />
          <KpiCard
            label="PRs abertas"
            value={formatNumber(mockSnapshot.prOpenedCount)}
            icon={GitPullRequest}
            tone="purple"
          />
          <KpiCard
            label="PRs mergeadas"
            value={formatNumber(mockSnapshot.prMergedCount)}
            icon={CheckCircle2}
            tone="green"
          />
          <KpiCard
            label="Taxa de aceitacao"
            value={formatPercent(mockSnapshot.acceptanceRate)}
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
          <ScoreLineChart data={mockScoreSeries} />
        </CardContent>
      </Card>
    </div>
  );
}
