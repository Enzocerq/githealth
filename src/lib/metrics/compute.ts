import { revalidateTag } from "next/cache";
import { subDays, eachDayOfInterval, startOfDay, endOfDay } from "date-fns";
import { Granularity } from "@prisma/client";

import { db } from "@/lib/db";
import { HOUR_MS } from "@/lib/utils/date";
import {
  computeWolterScore,
  defaultWolterConfig,
  type WolterInput,
} from "./wolter";

// ─── Helper ───────────────────────────────────────────────────────────────────

function toHours(ms: bigint | number | null | undefined): number {
  if (ms == null) return 0;
  return Number(ms) / HOUR_MS;
}

function safeAvg(values: number[]): number | null {
  const valid = values.filter((v) => isFinite(v) && v > 0);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

// ─── Cálculo de snapshot para um período ─────────────────────────────────────

export async function computeMetricsForUserPeriod({
  userId,
  repoId,
  periodStart,
  periodEnd,
  granularity,
}: {
  userId: string;
  repoId?: string;
  periodStart: Date;
  periodEnd: Date;
  granularity: Granularity;
}) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { githubLogin: true },
  });

  const githubLogin = user?.githubLogin ?? "";

  const repoFilter = repoId ? { repoId } : {};
  const authorFilter = githubLogin
    ? { OR: [{ authorUserId: userId }, { authorLogin: githubLogin }] }
    : { authorUserId: userId };

  const [commits, pullRequests, issues, allReviews] = await Promise.all([
    db.commit.findMany({
      where: {
        ...repoFilter,
        ...authorFilter,
        committedAt: { gte: periodStart, lte: periodEnd },
      },
    }),
    db.pullRequest.findMany({
      where: {
        ...repoFilter,
        ...authorFilter,
        createdAt: { gte: periodStart, lte: periodEnd },
      },
      include: { reviews: true },
    }),
    db.issue.findMany({
      where: {
        ...repoFilter,
        openedAt: { gte: periodStart, lte: periodEnd },
      },
    }),
    // Reviews feitas por OUTROS usuários em repos do usuário (para team avg)
    db.pRReview.findMany({
      where: {
        submittedAt: { gte: periodStart, lte: periodEnd },
        pullRequest: repoId ? { repoId } : undefined,
      },
    }),
  ]);

  // ── Componente C ─────────────────────────────────────────────────────────
  const totalDays = Math.max(
    1,
    Math.round((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)),
  );

  const activeDaysSet = new Set(
    commits.map((c) => startOfDay(c.committedAt).toISOString()),
  );
  const activeDays = activeDaysSet.size;

  const totalLines = commits.reduce(
    (sum, c) => sum + c.additions + c.deletions,
    0,
  );
  const avgLinesPerCommit =
    commits.length > 0 ? totalLines / commits.length : 0;

  // ── Componente P ─────────────────────────────────────────────────────────
  const prOpened = pullRequests.length;
  const prMerged = pullRequests.filter((pr) => pr.state === "merged").length;
  const cycleTimes = pullRequests
    .filter((pr) => pr.cycleTimeMs != null)
    .map((pr) => toHours(pr.cycleTimeMs));
  const avgCycleTimeHours = safeAvg(cycleTimes);
  const acceptanceRate = prOpened > 0 ? (prMerged / prOpened) * 100 : null;

  // ── Componente Q ─────────────────────────────────────────────────────────
  const reopenedIssues = issues.filter((i) => i.reopened).length;
  const totalIssues = issues.length;

  // ── Componente R ─────────────────────────────────────────────────────────
  const reviewsByUser = allReviews.filter(
    (rv) =>
      rv.reviewerUserId === userId ||
      (githubLogin && rv.reviewerLogin === githubLogin),
  ).length;

  const reviewerCounts = new Map<string, number>();
  for (const rv of allReviews) {
    const key = rv.reviewerLogin ?? rv.reviewerUserId ?? "unknown";
    reviewerCounts.set(key, (reviewerCounts.get(key) ?? 0) + 1);
  }
  const allCounts = [...reviewerCounts.values()];
  const teamAvgReviews =
    allCounts.length > 0
      ? allCounts.reduce((a, b) => a + b, 0) / allCounts.length
      : reviewsByUser > 0
        ? reviewsByUser
        : 1;

  // Tempo em review: diferença entre primeira review e abertura do PR
  const reviewTimes = pullRequests.flatMap((pr) => {
    if (pr.reviews.length === 0) return [];
    const firstReview = pr.reviews.reduce((earliest, rv) =>
      rv.submittedAt < earliest.submittedAt ? rv : earliest,
    );
    return [toHours(firstReview.submittedAt.getTime() - pr.createdAt.getTime())];
  });
  const avgReviewTimeHours = safeAvg(reviewTimes);

  // ── Componente B ─────────────────────────────────────────────────────────
  const bugFixPRs = pullRequests.filter((pr) => pr.isBugFix);
  const bugFixTimeHours = bugFixPRs.reduce(
    (sum, pr) => sum + toHours(pr.cycleTimeMs),
    0,
  );
  const totalDevTimeHours = pullRequests.reduce(
    (sum, pr) => sum + toHours(pr.cycleTimeMs),
    0,
  );

  // ── Score Wolter ──────────────────────────────────────────────────────────
  const wolterInput: WolterInput = {
    commitCount: commits.length,
    activeDays,
    totalDays,
    avgLinesPerCommit,
    prOpened,
    prMerged,
    avgCycleTimeHours,
    reopenedIssues,
    totalIssues,
    reviewsPerformed: reviewsByUser,
    teamAvgReviews,
    bugFixTimeHours,
    totalDevTimeHours,
  };

  const wolterResult = computeWolterScore(wolterInput, defaultWolterConfig);

  return {
    periodStart,
    periodEnd,
    granularity,
    userId,
    repoId: repoId ?? null,
    wolterScore: wolterResult.score,
    componentC: wolterResult.c,
    componentP: wolterResult.p,
    componentQ: wolterResult.q,
    componentR: wolterResult.r,
    componentB: wolterResult.b,
    commitCount: commits.length,
    activeDays,
    prOpenedCount: prOpened,
    prMergedCount: prMerged,
    acceptanceRate,
    avgCycleTimeHours,
    avgLeadTimeHours: avgCycleTimeHours,
    avgReviewTimeHours,
    bugFixTimeHours,
    totalDevTimeHours,
  };
}

// ─── Orquestrador ─────────────────────────────────────────────────────────────

type SnapshotData = Awaited<ReturnType<typeof computeMetricsForUserPeriod>>;

/**
 * Persiste um snapshot usando findFirst + create/update.
 * Necessário porque Prisma não aceita `null` em chave composta de upsert.
 */
async function persistSnapshot(data: SnapshotData) {
  const existing = await db.metricSnapshot.findFirst({
    where: {
      userId: data.userId,
      repoId: data.repoId,
      periodStart: data.periodStart,
      granularity: data.granularity,
    },
    select: { id: true },
  });

  if (existing) {
    await db.metricSnapshot.update({ where: { id: existing.id }, data });
  } else {
    await db.metricSnapshot.create({ data });
  }
}

/**
 * Calcula e persiste snapshots diários e mensais para um usuário.
 * Invalida o cache da UI após persistir.
 */
export async function computeAndPersistSnapshotsForUser(userId: string) {
  const now = new Date();
  const since = subDays(now, 90);

  const userRepos = await db.userRepository.findMany({
    where: { userId, active: true },
    select: { repositoryId: true },
  });

  // Snapshot mensal global (sem repoId)
  const monthlyGlobal = await computeMetricsForUserPeriod({
    userId,
    periodStart: since,
    periodEnd: now,
    granularity: Granularity.monthly,
  });
  await persistSnapshot(monthlyGlobal);

  // Snapshot mensal por repo
  for (const { repositoryId } of userRepos) {
    const repoMonthly = await computeMetricsForUserPeriod({
      userId,
      repoId: repositoryId,
      periodStart: since,
      periodEnd: now,
      granularity: Granularity.monthly,
    });
    await persistSnapshot(repoMonthly);
  }

  // Snapshots diários globais (últimos 90 dias)
  const days = eachDayOfInterval({ start: since, end: now });

  for (const day of days) {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    const daily = await computeMetricsForUserPeriod({
      userId,
      periodStart: dayStart,
      periodEnd: dayEnd,
      granularity: Granularity.daily,
    });
    await persistSnapshot(daily);
  }

  revalidateTag(`user-${userId}-metrics`);
}
