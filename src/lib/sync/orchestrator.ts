import { subDays } from "date-fns";

import { db } from "@/lib/db";
import { createGitHubClient } from "@/lib/github/client";
import { fetchCommitsForRepository } from "@/lib/github/fetch-commits";
import { fetchPullRequestsForRepository } from "@/lib/github/fetch-prs";
import { fetchReviewsForPullRequest } from "@/lib/github/fetch-reviews";
import { fetchIssuesForRepository } from "@/lib/github/fetch-issues";
import { computeAndPersistSnapshotsForUser } from "@/lib/metrics/compute";

const BOOTSTRAP_DAYS = 90;
const TOP_REPOS = 10;

/**
 * Sincroniza dados do GitHub para um usuário.
 * mode "initial" busca os últimos 90 dias.
 * mode "incremental" busca apenas o delta desde lastSyncAt.
 */
export async function syncGitHubForUser(
  userId: string,
  mode: "initial" | "incremental" = "initial",
) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      accounts: { where: { provider: "github" } },
    },
  });

  if (!user) throw new Error("Usuário não encontrado");

  const accessToken = user.accounts[0]?.access_token;
  if (!accessToken) throw new Error("Token GitHub não encontrado na sessão");

  const since =
    mode === "incremental" && user.lastSyncAt
      ? user.lastSyncAt
      : subDays(new Date(), BOOTSTRAP_DAYS);

  const client = createGitHubClient(accessToken);

  // Criar SyncJob
  const job = await db.syncJob.create({
    data: {
      userId,
      type: mode === "initial" ? "initial" : "incremental",
      status: "running",
    },
  });

  let itemsProcessed = 0;

  try {
    // Buscar repos do usuário autenticado
    const repos = await client.paginate(client.rest.repos.listForAuthenticatedUser, {
      sort: "pushed",
      direction: "desc",
      per_page: 100,
    });

    const topRepos = repos.slice(0, TOP_REPOS);

    for (const repo of topRepos) {
      const [owner, repoName] = repo.full_name.split("/");

      // Upsert repositório
      const dbRepo = await db.repository.upsert({
        where: { githubId: repo.id },
        create: {
          githubId: repo.id,
          fullName: repo.full_name,
          private: repo.private,
          defaultBranch: repo.default_branch ?? "main",
          ownerLogin: owner,
        },
        update: {
          fullName: repo.full_name,
          private: repo.private,
          defaultBranch: repo.default_branch ?? "main",
        },
      });

      // Associar usuário ao repositório
      await db.userRepository.upsert({
        where: { userId_repositoryId: { userId, repositoryId: dbRepo.id } },
        create: { userId, repositoryId: dbRepo.id, active: true },
        update: { active: true },
      });

      // Commits
      const commits = await fetchCommitsForRepository({
        client,
        owner,
        repo: repoName,
        since,
        maxCommits: mode === "initial" ? 200 : 50,
      });

      for (const commit of commits) {
        await db.commit.upsert({
          where: { sha_repoId: { sha: commit.sha, repoId: dbRepo.id } },
          create: {
            sha: commit.sha,
            repoId: dbRepo.id,
            authorLogin: commit.authorLogin,
            message: commit.message,
            additions: commit.additions,
            deletions: commit.deletions,
            changedFiles: commit.changedFiles,
            committedAt: commit.committedAt,
            isBugFix: commit.isBugFix,
          },
          update: {
            additions: commit.additions,
            deletions: commit.deletions,
            changedFiles: commit.changedFiles,
            isBugFix: commit.isBugFix,
          },
        });
        itemsProcessed++;
      }

      // Pull Requests
      const pullRequests = await fetchPullRequestsForRepository({
        client,
        owner,
        repo: repoName,
        since,
        maxPRs: mode === "initial" ? 100 : 30,
      });

      for (const pr of pullRequests) {
        const dbPR = await db.pullRequest.upsert({
          where: { githubId_repoId: { githubId: pr.githubId, repoId: dbRepo.id } },
          create: {
            githubId: pr.githubId,
            number: pr.number,
            repoId: dbRepo.id,
            authorLogin: pr.authorLogin,
            title: pr.title,
            state: pr.state,
            additions: pr.additions,
            deletions: pr.deletions,
            isBugFix: pr.isBugFix,
            createdAt: pr.createdAt,
            updatedAt: pr.updatedAt,
            mergedAt: pr.mergedAt,
            closedAt: pr.closedAt,
            cycleTimeMs: pr.cycleTimeMs,
            leadTimeMs: pr.leadTimeMs,
            timeInReviewMs: pr.timeInReviewMs,
          },
          update: {
            state: pr.state,
            mergedAt: pr.mergedAt,
            closedAt: pr.closedAt,
            cycleTimeMs: pr.cycleTimeMs,
            leadTimeMs: pr.leadTimeMs,
          },
        });

        // Reviews do PR
        const reviews = await fetchReviewsForPullRequest({
          client,
          owner,
          repo: repoName,
          prNumber: pr.number,
          prGithubId: pr.githubId,
        });

        for (const review of reviews) {
          await db.pRReview.upsert({
            where: { id: review.id },
            create: {
              id: review.id,
              prId: dbPR.id,
              reviewerLogin: review.reviewerLogin,
              state: review.state,
              submittedAt: review.submittedAt,
            },
            update: {
              state: review.state,
            },
          });
        }

        itemsProcessed++;
      }

      // Issues
      try {
        const issues = await fetchIssuesForRepository({
          client,
          owner,
          repo: repoName,
          since,
          maxIssues: 80,
        });

        for (const issue of issues) {
          await db.issue.upsert({
            where: { githubNodeId: issue.githubNodeId ?? `${dbRepo.id}-${issue.number}` },
            create: {
              githubNodeId: issue.githubNodeId,
              number: issue.number,
              repoId: dbRepo.id,
              authorLogin: issue.authorLogin,
              assigneeLogin: issue.assigneeLogin,
              title: issue.title,
              state: issue.state,
              isBug: issue.isBug,
              openedAt: issue.openedAt,
              closedAt: issue.closedAt,
              resolutionTimeMs: issue.resolutionTimeMs,
              reopened: issue.reopened,
            },
            update: {
              state: issue.state,
              closedAt: issue.closedAt,
              resolutionTimeMs: issue.resolutionTimeMs,
              reopened: issue.reopened,
            },
          });
          itemsProcessed++;
        }
      } catch {
        // Issues opcionais — repositórios podem ter issues desabilitadas
      }
    }

    // Calcular e persistir snapshots de métricas
    await computeAndPersistSnapshotsForUser(userId);

    // Atualizar lastSyncAt
    await db.user.update({
      where: { id: userId },
      data: { lastSyncAt: new Date() },
    });

    // Finalizar SyncJob
    await db.syncJob.update({
      where: { id: job.id },
      data: { status: "done", finishedAt: new Date(), itemsProcessed },
    });
  } catch (error) {
    await db.syncJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        finishedAt: new Date(),
        error: error instanceof Error ? error.message : String(error),
        itemsProcessed,
      },
    });
    throw error;
  }
}
