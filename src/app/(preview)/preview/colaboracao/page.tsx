import { GitPullRequestArrow, Users, UserCheck } from "lucide-react";

import { ComparisonBarChart } from "@/components/charts/comparison-bar-chart";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";
import { KpiCard } from "@/components/metrics/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils/format";
import { mockDistribution, mockComparison } from "@/lib/mock-data";

const activeContributors = 7;
const userReviewCount = 24;
const teamAverage = 12.9;

export default function PreviewColaboracaoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Colaboracao</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reviews, suporte ao time e comparacao com a media dos contribuidores.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Contribuidores ativos" value={formatNumber(activeContributors)} icon={Users} tone="blue" />
        <KpiCard label="Reviews feitas" value={formatNumber(userReviewCount)} icon={UserCheck} tone="green" />
        <KpiCard label="Media do time" value={teamAverage.toFixed(1).replace(".", ",")} icon={GitPullRequestArrow} tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Individual vs time</CardTitle>
          </CardHeader>
          <CardContent>
            <ComparisonBarChart data={mockComparison} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuicao de reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={mockDistribution} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
