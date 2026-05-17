/**
 * Dados mockados para preview das telas sem banco nem GitHub.
 * Acesse em: /preview/dashboard, /preview/atividade, etc.
 */

// ─── Visão Geral ──────────────────────────────────────────────────────────────

export const mockSnapshot = {
  id: "mock-1",
  userId: "mock-user",
  repoId: null,
  periodStart: new Date("2025-02-15"),
  periodEnd: new Date("2025-05-15"),
  granularity: "monthly" as const,
  wolterScore: 74.2,
  componentC: 82.1,
  componentP: 71.4,
  componentQ: 68.9,
  componentR: 60.0,
  componentB: 88.3,
  commitCount: 87,
  activeDays: 51,
  prOpenedCount: 14,
  prMergedCount: 11,
  acceptanceRate: 78.6,
  avgCycleTimeHours: 36.4,
  avgLeadTimeHours: 41.2,
  avgReviewTimeHours: 22.5,
  bugFixTimeHours: 18.0,
  totalDevTimeHours: 110.0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockScoreSeries = Array.from({ length: 45 }, (_, i) => {
  const date = new Date("2025-04-01");
  date.setDate(date.getDate() + i * 2);
  return {
    date: date.toISOString(),
    score: 55 + Math.round(Math.sin(i / 5) * 12 + i * 0.4),
    repositoryAverage: 62 + Math.round(Math.cos(i / 7) * 8),
  };
});

export const mockUser = {
  id: "mock-user",
  name: "Enzo Cerqueira",
  email: "enzo@dev.com",
  image: "https://avatars.githubusercontent.com/u/1?v=4",
  githubLogin: "enzocerqueira",
  lastSyncAt: new Date("2025-05-15T10:30:00"),
};

export const mockLastJob = {
  id: "job-1",
  userId: "mock-user",
  type: "initial" as const,
  status: "done" as const,
  startedAt: new Date("2025-05-15T10:00:00"),
  finishedAt: new Date("2025-05-15T10:05:00"),
  error: null,
  itemsProcessed: 312,
};

// ─── Atividade ────────────────────────────────────────────────────────────────

export const mockTimeline = [
  { id: "1", type: "PR" as const, title: "#42 feat: adicionar autenticação OAuth", repository: "enzocerqueira/githealth", date: new Date("2025-05-14T14:23:00"), meta: "merged" },
  { id: "2", type: "Commit" as const, title: "fix: corrigir calculo do cycle time", repository: "enzocerqueira/githealth", date: new Date("2025-05-14T11:10:00"), meta: "38 linhas" },
  { id: "3", type: "Commit" as const, title: "feat: wolter score card component", repository: "enzocerqueira/githealth", date: new Date("2025-05-13T17:55:00"), meta: "124 linhas" },
  { id: "4", type: "PR" as const, title: "#41 chore: atualizar dependencias", repository: "enzocerqueira/api-core", date: new Date("2025-05-13T09:30:00"), meta: "merged" },
  { id: "5", type: "Commit" as const, title: "refactor: extrair hook useMetrics", repository: "enzocerqueira/githealth", date: new Date("2025-05-12T16:22:00"), meta: "88 linhas" },
  { id: "6", type: "Commit" as const, title: "test: adicionar testes do score wolter", repository: "enzocerqueira/githealth", date: new Date("2025-05-12T10:05:00"), meta: "65 linhas" },
  { id: "7", type: "PR" as const, title: "#40 fix: timeout no sync incremental", repository: "enzocerqueira/api-core", date: new Date("2025-05-11T14:10:00"), meta: "closed" },
  { id: "8", type: "Commit" as const, title: "docs: atualizar README com setup", repository: "enzocerqueira/githealth", date: new Date("2025-05-11T09:47:00"), meta: "22 linhas" },
];

export const mockReviewChart = [
  { name: "#42", value: 18.5 },
  { name: "#41", value: 6.2 },
  { name: "#40", value: 31.0 },
  { name: "#39", value: 12.8 },
  { name: "#38", value: 8.1 },
  { name: "#37", value: 24.3 },
  { name: "#36", value: 5.5 },
];

// ─── Repositórios ─────────────────────────────────────────────────────────────

export const mockRepositories = [
  { id: "repo-1", fullName: "enzocerqueira/githealth", private: false, defaultBranch: "main", commits: 87, prs: 14, mergedPRs: 11, participation: 94.3, productionRate: 0.3, score: 74.2 },
  { id: "repo-2", fullName: "enzocerqueira/api-core", private: false, defaultBranch: "main", commits: 43, prs: 8, mergedPRs: 6, participation: 61.4, productionRate: 0.18, score: 61.8 },
  { id: "repo-3", fullName: "enzocerqueira/design-system", private: false, defaultBranch: "main", commits: 28, prs: 5, mergedPRs: 5, participation: 78.9, productionRate: 0.22, score: 68.5 },
  { id: "repo-4", fullName: "enzocerqueira/mobile-app", private: true, defaultBranch: "develop", commits: 15, prs: 3, mergedPRs: 2, participation: 42.0, productionRate: 0.11, score: 52.3 },
  { id: "repo-5", fullName: "my-org/platform", private: true, defaultBranch: "main", commits: 9, prs: 2, mergedPRs: 2, participation: 12.5, productionRate: 0.08, score: null },
];

// ─── Colaboração ──────────────────────────────────────────────────────────────

export const mockDistribution = [
  { name: "enzocerqueira", value: 24 },
  { name: "mariasouza", value: 19 },
  { name: "pedrolima", value: 16 },
  { name: "anafernandes", value: 12 },
  { name: "carlosdev", value: 9 },
  { name: "joanareis", value: 6 },
  { name: "rafaeltech", value: 4 },
];

export const mockComparison = [
  { metric: "Commits", voce: 87, time: 54 },
  { metric: "Reviews", voce: 24, time: 13 },
  { metric: "Cycle (h)", voce: 36, time: 48 },
];

// ─── Insights ─────────────────────────────────────────────────────────────────

export const mockHeatmap = [
  ...Array.from({ length: 12 }, () => ({ day: 2, hour: 10 })), // Terças manhã
  ...Array.from({ length: 10 }, () => ({ day: 2, hour: 14 })), // Terças tarde
  ...Array.from({ length: 9 }, () => ({ day: 4, hour: 10 })),  // Quintas manhã
  ...Array.from({ length: 7 }, () => ({ day: 3, hour: 14 })),  // Quartas tarde
  ...Array.from({ length: 6 }, () => ({ day: 1, hour: 10 })),  // Segundas manhã
  ...Array.from({ length: 5 }, () => ({ day: 5, hour: 14 })),  // Sextas tarde
  ...Array.from({ length: 4 }, () => ({ day: 1, hour: 18 })),  // Segundas noite
  ...Array.from({ length: 3 }, () => ({ day: 4, hour: 18 })),  // Quintas noite
  ...Array.from({ length: 2 }, () => ({ day: 6, hour: 10 })),  // Sábados manhã
];

export const mockInsights = [
  "Sua taxa de aceitacao de PRs cresceu 12,4% no periodo recente.",
  "Sua janela de maior atividade aparece nas tercas a manha.",
  "16,4% do seu esforco em PRs mergeadas esta concentrado em correcoes.",
];

export const mockSnapshots = Array.from({ length: 20 }, (_, i) => ({
  ...mockSnapshot,
  id: `mock-snap-${i}`,
  periodStart: new Date(Date.now() - (20 - i) * 4 * 24 * 60 * 60 * 1000),
  periodEnd: new Date(Date.now() - (20 - i - 1) * 4 * 24 * 60 * 60 * 1000),
  granularity: "daily" as const,
  avgReviewTimeHours: 20 + i * 0.5,
  acceptanceRate: 72 + Math.sin(i) * 8,
}));
