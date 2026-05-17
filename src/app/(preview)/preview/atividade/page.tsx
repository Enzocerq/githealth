import { Clock, GitCommitHorizontal, GitPullRequest, CalendarDays } from "lucide-react";

import { KpiCard } from "@/components/metrics/kpi-card";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatHours, formatNumber, formatDays } from "@/lib/utils/format";
import { mockSnapshot, mockTimeline, mockReviewChart } from "@/lib/mock-data";

export default function PreviewAtividadePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Atividade & Fluxo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cycle time, tempo em review e linha do tempo de contribuicoes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Cycle time medio" value={formatDays(mockSnapshot.avgCycleTimeHours)} icon={Clock} tone="purple" />
        <KpiCard label="Tempo em review" value={formatHours(mockSnapshot.avgReviewTimeHours)} icon={Clock} tone="amber" />
        <KpiCard label="Dias ativos" value={formatNumber(mockSnapshot.activeDays)} icon={CalendarDays} tone="green" />
        <KpiCard label="Commits" value={formatNumber(mockSnapshot.commitCount)} icon={GitCommitHorizontal} tone="blue" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tempo em review por PR</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={mockReviewChart} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Linha do tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {mockTimeline.map((item) => (
                <div key={item.id} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 shrink-0">
                    {item.type === "Commit" ? (
                      <GitCommitHorizontal className="size-4 text-blue-500" />
                    ) : (
                      <GitPullRequest className="size-4 text-purple-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.repository} ·{" "}
                      {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(item.date)}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">{item.meta}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
