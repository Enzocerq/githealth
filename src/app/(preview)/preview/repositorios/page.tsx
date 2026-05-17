import { Lock, Unlock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPercent, formatScore } from "@/lib/utils/format";
import { mockRepositories } from "@/lib/mock-data";

export default function PreviewRepositoriosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Repositorios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumo de atividade e saude por repositorio.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seus repositorios ({mockRepositories.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Repositorio</th>
                  <th className="px-4 py-3 font-medium text-right">Commits</th>
                  <th className="px-4 py-3 font-medium text-right">PRs</th>
                  <th className="px-4 py-3 font-medium text-right">Mergeadas</th>
                  <th className="px-4 py-3 font-medium text-right">Participacao</th>
                  <th className="px-4 py-3 font-medium text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockRepositories.map((repo) => (
                  <tr key={repo.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {repo.private ? (
                          <Lock className="size-3.5 text-muted-foreground" />
                        ) : (
                          <Unlock className="size-3.5 text-muted-foreground" />
                        )}
                        <span className="font-medium">{repo.fullName}</span>
                        <Badge variant="outline" className="text-xs">{repo.defaultBranch}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatNumber(repo.commits)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatNumber(repo.prs)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatNumber(repo.mergedPRs)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatPercent(repo.participation)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">
                      {repo.score != null ? formatScore(repo.score) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
