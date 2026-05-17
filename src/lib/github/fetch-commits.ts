import type { GitHubClient } from "./client";
import { isBugFix } from "./classify";
import { msBetween } from "@/lib/utils/date";

export type GitHubCommitMetric = {
  sha: string;
  authorLogin: string | null;
  message: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  committedAt: Date;
  isBugFix: boolean;
};

export async function fetchCommitsForRepository({
  client,
  owner,
  repo,
  since,
  maxCommits = 100,
}: {
  client: GitHubClient;
  owner: string;
  repo: string;
  since: Date;
  maxCommits?: number;
}): Promise<GitHubCommitMetric[]> {
  const commits = await client.paginate(client.rest.repos.listCommits, {
    owner,
    repo,
    since: since.toISOString(),
    per_page: 100,
  });

  const selected = commits.slice(0, maxCommits);
  const metrics: GitHubCommitMetric[] = [];

  for (const commit of selected) {
    let additions = 0;
    let deletions = 0;
    let changedFiles = 0;

    try {
      const { data } = await client.rest.repos.getCommit({
        owner,
        repo,
        ref: commit.sha,
      });
      additions = data.stats?.additions ?? 0;
      deletions = data.stats?.deletions ?? 0;
      changedFiles = data.files?.length ?? 0;
    } catch {
      // Commit pode ter sido deletado ou repo ficou privado — ignora
    }

    const message = commit.commit.message ?? "";
    metrics.push({
      sha: commit.sha,
      authorLogin: commit.author?.login ?? commit.commit.author?.name ?? null,
      message,
      additions,
      deletions,
      changedFiles,
      committedAt: new Date(commit.commit.committer?.date ?? commit.commit.author?.date ?? Date.now()),
      isBugFix: isBugFix({ title: message }),
    });
  }

  return metrics;
}
