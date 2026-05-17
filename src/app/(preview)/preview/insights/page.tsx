import { Bug, Lightbulb, Timer } from "lucide-react";

import { ProductivityHeatmap } from "@/components/charts/productivity-heatmap";
import { KpiCard } from "@/components/metrics/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours, formatPercent } from "@/lib/utils/format";
import { mockSnapshot, mockHeatmap, mockInsights } from "@/lib/mock-data";

const bugRatio =
  mockSnapshot.totalDevTimeHours > 0
    ? (mockSnapshot.bugFixTimeHours / mockSnapshot.totalDevTimeHours) * 100
    : null;

export default function PreviewInsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Diagnosticos por regras, janelas temporais e esforco em correcao.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Bug fix time" value={formatPercent(bugRatio)} icon={Bug} tone="amber" />
        <KpiCard label="Tempo em review" value={formatHours(mockSnapshot.avgReviewTimeHours)} icon={Timer} tone="blue" />
        <KpiCard label="Insights gerados" value={mockInsights.length.toString()} icon={Lightbulb} tone="green" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <Card>
          <CardHeader>
            <CardTitle>Janelas de produtividade</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductivityHeatmap data={mockHeatmap} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diagnosticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockInsights.map((insight) => (
                <div key={insight} className="rounded-md border p-3 text-sm leading-6">
                  {insight}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
