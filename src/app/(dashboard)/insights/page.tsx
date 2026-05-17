import { Bug, Lightbulb, Timer } from "lucide-react";

import { getInsightsData } from "@/app/actions/metrics";
import { ProductivityHeatmap } from "@/components/charts/productivity-heatmap";
import { KpiCard } from "@/components/metrics/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours, formatPercent } from "@/lib/utils/format";

export default async function InsightsPage() {
  const { insights, heatmap, snapshots } = await getInsightsData();
  const latest = snapshots.at(-1);

  const bugRatio =
    latest?.totalDevTimeHours && latest.totalDevTimeHours > 0
      ? ((latest.bugFixTimeHours ?? 0) / latest.totalDevTimeHours) * 100
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Diagnosticos por regras, janelas temporais e esforco em correcao.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Bug fix time"
          value={formatPercent(bugRatio)}
          icon={Bug}
          tone="amber"
        />
        <KpiCard
          label="Tempo em review"
          value={formatHours(latest?.avgReviewTimeHours)}
          icon={Timer}
          tone="blue"
        />
        <KpiCard
          label="Insights gerados"
          value={insights.length.toString()}
          icon={Lightbulb}
          tone="green"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <Card>
          <CardHeader>
            <CardTitle>Janelas de produtividade</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductivityHeatmap data={heatmap} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diagnosticos</CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sem diagnosticos por enquanto. Continue codando para gerar insights!
              </p>
            ) : (
              <div className="space-y-3">
                {insights.map((insight) => (
                  <div key={insight} className="rounded-md border p-3 text-sm leading-6">
                    {insight}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
