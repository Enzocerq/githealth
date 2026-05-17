import type { Commit, MetricSnapshot, PullRequest } from "@prisma/client";

import {
  acceptanceTrendRule,
  reviewWaitRule,
  productivityWindowRule,
  bugFixRatioRule,
} from "./rules";

/**
 * Gera uma lista de diagnósticos em português com base nos dados do usuário.
 * Cada insight é uma string descritiva gerada por regras determinísticas — sem LLM.
 */
export function generateInsights({
  snapshots,
  commits,
  pullRequests,
}: {
  snapshots: MetricSnapshot[];
  commits: Commit[];
  pullRequests: PullRequest[];
}): string[] {
  const insights: string[] = [];

  const rules = [
    () => acceptanceTrendRule(snapshots),
    () => reviewWaitRule(snapshots),
    () => productivityWindowRule(commits),
    () => bugFixRatioRule(pullRequests),
  ];

  for (const rule of rules) {
    try {
      const result = rule();
      if (result) insights.push(result);
    } catch {
      // Regra falhou silenciosamente — não bloqueia as demais
    }
  }

  return insights;
}
