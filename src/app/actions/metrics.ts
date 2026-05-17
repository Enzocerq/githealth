"use server";

import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { subDays } from "date-fns";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { HOUR_MS, lastNDaysRange } from "@/lib/utils/date";
import { generateInsights } from "@/lib/insights/generator";

// ─── Contexto ─────────────────────────────────────────────────────────────────

async function getUserContext() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, githubLogin: true, lastSyncAt: true, name: true, image: true, email: true },
  });

  if (!user) redirect("/login");
  return user;
}

function toHours(value?: bigint | null): number | null {
  if (value == null) return null;
  return Number(value) / HOUR_MS;
}

// ─── Tela 1: Visao Geral ──────────────────────────────────────────────────────

async function loadOverviewData(userId: string) {
  const [snapshot, dailySeries, repoSnapshots, repositories, lastJob] = await Promise.all([
    db.metricSnapshot.findFirst({
      where: { userId, repoId: null, granularity: "monthly" },
      orderBy: { periodEnd: "desc" },
    }),
    db.metricSnapshot.findMany({
      where: { userId, repoId: null, granularity: "daily" },
      orderBy: { periodStart: "asc" },
      take: 90,
    }),
    db.metricSnapshot.findMany({
      where: { userId, granularity: "monthly", repoId: { not: null } },
    }),
    db.userRepository.count({ where: { userId, active: true } }),
    db.syncJob.findFirst({ where: { userId }, orderBy: { startedAt: "desc" } }),
  ]);

  const repoAvg =
    repoSnapshots.length > 0
      ? repoSnapshots.reduce((s, r) => s + (r.wolterScore ?? 0), 0) / repoSnapshots.length
      : null;

  return {
    snapshot,
    repositories,
    lastJob,
    scoreSeries: dailySeries.map((item) => ({
      date: item.periodStart.toISOString(),
      score: item.wolterScore ?? 0,
      repositoryAverage: repoAvg ?? item.wolterScore ?? 0,
    })),
  };
}

export async function getOverviewData() {
  const user = await getUserContext();

  const data = await unstable_cache(
    () => loadOverviewData(user.id),
    ["overview", user.id],
    { tags: [`user-${user.id}-metrics`], revalidate: 60 },
  )();

  return { user, ...data };
}

// ─── Tela 2: Atividade ────────────────────────────────────────────────────────

export async function getActivityData() {
  const user = await getUserContext();
  const since = subDays(new Date(), 30);
  const githubLogin = user.githubLogin ?? "";

  const [commits, pullRequests, snapshot] = await Promise.all([
    db.commit.findMany({
      where: {
        committedAt: { gte: since },
        OR: [{ authorUserId: user.id }, { authorLogin: githubLogin }],
      },
      include: { repo: true },
      orderBy: { committedAt: "desc" },
      take: 20,
    }),
    db.pullRequest.findMany({
      where: { OR: [{ authorUserId: user.id }, { authorLogin: githubLogin }] },
      include: { repo: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.metricSnapshot.findFirst({
      where: { userId: user.id, repoId: null, granularity: "monthly" },
      orderBy: { periodEnd: "desc" },
    }),
  ]);

  const timeline = [
    ...commits.map((c) => ({
      id: c.id,
      type: "Commit" as const,
      title: c.message.split("\n")[0],
      repository: c.repo.fullName,
      date: c.committedAt,
      meta: `${c.additions + c.deletions} linhas`,
    })),
    ...pullRequests.map((pr) => ({
      id: pr.id,
      type: "PR" as const,
      title: `#${pr.number} ${pr.title}`,
      repository: pr.repo.fullName,
      date: pr.createdAt,
      meta: pr.state,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 24);

  return {
    user,
    snapshot,
    timeline,
    reviewChart: pullRequests
      .filter((pr) => pr.timeInReviewMs != null)
      .slice(0, 10)
      .map((pr) => ({
        name: `#${pr.number}`,
        value: toHours(pr.timeInReviewMs) ?? 0,
      })),
  };
}

// ─── Tela 3: Repositorios ─────────────────────────────────────────────────────

export async function getRepositoriesData() {
  const user = await getUserContext();

  const userRepos = await db.userRepository.findMany({
    where: { userId: user.id, active: true },
    include: {
      repository: {
        include: {
          commits: true,
          pullRequests: true,
          snapshots: {
            where: { userId: user.id, granularity: "monthly" },
            orderBy: { periodEnd: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { selectedAt: "desc" },
  });

  return {
    user,
    repositories: userRepos.map(({ repository }) => {
      const userCommits = repository.commits.filter(
        (c) => c.authorUserId === user.id || c.authorLogin === user.githubLogin,
      );
      const userPRs = repository.pullRequests.filter(
        (pr) => pr.authorUserId === user.id || pr.authorLogin === user.githubLogin,
      );
      const totalCycleHours = userPRs.reduce(
        (sum, pr) => sum + (toHours(pr.cycleTimeMs) ?? 0),
        0,
      );

      return {
        id: repository.id,
        fullName: repository.fullName,
        private: repository.private,
        defaultBranch: repository.defaultBranch,
        commits: userCommits.length,
        prs: userPRs.length,
        mergedPRs: userPRs.filter((pr) => pr.state === "merged").length,
        participation:
          repository.commits.length > 0
            ? (userCommits.length / repository.commits.length) * 100
            : null,
        productionRate:
          totalCycleHours > 0
            ? userPRs.filter((pr) => pr.state === "merged").length / totalCycleHours
            : null,
        score: repository.snapshots[0]?.wolterScore ?? null,
      };
    }),
  };
}

// ─── Tela 4: Colaboracao ──────────────────────────────────────────────────────

export async function getCollaborationData() {
  const user = await getUserContext();
  const { start, end } = lastNDaysRange(30);
  const githubLogin = user.githubLogin ?? "";

  const userRepos = await db.userRepository.findMany({
    where: { userId: user.id, active: true },
    select: { repositoryId: true },
  });
  const repoIds = userRepos.map((r) => r.repositoryId);
  const repoFilter = repoIds.length > 0 ? { in: repoIds } : { in: [""] };

  const [reviews, commits, snapshot] = await Promise.all([
    db.pRReview.findMany({
      where: {
        submittedAt: { gte: start, lte: end },
        pullRequest: { repoId: repoFilter },
      },
    }),
    db.commit.findMany({
      where: {
        committedAt: { gte: start, lte: end },
        repoId: repoFilter,
      },
    }),
    db.metricSnapshot.findFirst({
      where: { userId: user.id, repoId: null, granularity: "monthly" },
      orderBy: { periodEnd: "desc" },
    }),
  ]);

  const activeContributors = new Set([
    ...reviews.map((r) => r.reviewerLogin).filter(Boolean),
    ...commits.map((c) => c.authorLogin).filter(Boolean),
  ]).size;

  const reviewCounts = new Map<string, number>();
  for (const r of reviews) {
    const key = r.reviewerLogin ?? "desconhecido";
    reviewCounts.set(key, (reviewCounts.get(key) ?? 0) + 1);
  }

  const distribution = [...reviewCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  const userReviewCount = reviews.filter(
    (r) => r.reviewerLogin === githubLogin || r.reviewerUserId === user.id,
  ).length;

  const teamAverage =
    distribution.length > 0
      ? distribution.reduce((s, d) => s + d.value, 0) / distribution.length
      : 0;

  return {
    user,
    snapshot,
    activeContributors,
    userReviewCount,
    teamAverage,
    distribution,
    comparison: [
      { metric: "Commits", voce: snapshot?.commitCount ?? 0, time: 18 },
      { metric: "Reviews", voce: userReviewCount, time: Math.round(teamAverage) },
      { metric: "Cycle (h)", voce: snapshot?.avgCycleTimeHours ?? 0, time: 48 },
    ],
  };
}

// ─── Tela 5: Insights ─────────────────────────────────────────────────────────

export async function getInsightsData() {
  const user = await getUserContext();
  const { start, end } = lastNDaysRange(90);

  const [snapshots, commits, pullRequests] = await Promise.all([
    db.metricSnapshot.findMany({
      where: { userId: user.id, repoId: null, granularity: "daily" },
      orderBy: { periodStart: "asc" },
    }),
    db.commit.findMany({
      where: {
        committedAt: { gte: start, lte: end },
        OR: [{ authorUserId: user.id }, { authorLogin: user.githubLogin ?? "" }],
      },
    }),
    db.pullRequest.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        OR: [{ authorUserId: user.id }, { authorLogin: user.githubLogin ?? "" }],
      },
    }),
  ]);

  return {
    user,
    snapshots,
    heatmap: commits.map((c) => ({
      day: c.committedAt.getDay(),
      hour: c.committedAt.getHours(),
    })),
    insights: generateInsights({ snapshots, commits, pullRequests }),
  };
}
