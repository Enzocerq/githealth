import type { GitHubClient } from "./client";
import { isBugFix } from "./classify";
import { msBetween } from "@/lib/utils/date";

export type GitHubPRMetric = {
  githubId: number;
  number: number;
  authorLogin: string | null;
  title: string;
  state: string;
  additions: number;
  deletions: number;
  isBugFix: boolean;
  createdAt: Date;
  updatedAt: Date;
  mergedAt: Date | null;
  closedAt: Date | null;
  cycleTimeMs: bigint | null;
  leadTimeMs: bigint | null;
  timeInReviewMs: bigint | null;
  branch: string;
};

export async function fetchPullRequestsForRepository({
  client,
  owner,
  repo,
  since,
  maxPRs = 50,
}: {
  client: GitHubClient;
  owner: string;
  repo: string;
  since: Date;
  maxPRs?: number;
}): Promise<GitHubPRMetric[]> {
  const prs = await client.paginate(client.rest.pulls.list, {
    owner,
    repo,
    state: "all",
    sort: "updated",
    direction: "desc",
    per_page: 100,
  });

  const selected = prs
    .filter((pr) => new Date(pr.updated_at) >= since)
    .slice(0, maxPRs);

  const metrics: GitHubPRMetric[] = [];

  for (const pr of selected) {
    let additions = 0;
    let deletions = 0;

    try {
      const { data } = await client.rest.pulls.get({
        owner,
        repo,
        pull_number: pr.number,
      });
      additions = data.additions;
      deletions = data.deletions;
    } catch {
      // ignora erro ao buscar detalhes
    }

    const createdAt = new Date(pr.created_at);
    const mergedAt = pr.merged_at ? new Date(pr.merged_at) : null;
    const closedAt = pr.closed_at ? new Date(pr.closed_at) : null;
    const endDate = mergedAt ?? closedAt;

    const labelNames = pr.labels
      .map((l) => (typeof l === "string" ? l : l.name))
      .filter((n): n is string => Boolean(n));

    metrics.push({
      githubId: pr.id,
      number: pr.number,
      authorLogin: pr.user?.login ?? null,
      title: pr.title,
      state: mergedAt ? "merged" : pr.state,
      additions,
      deletions,
      isBugFix: isBugFix({
        title: pr.title,
        labels: labelNames,
        branch: pr.head.ref,
      }),
      createdAt,
      updatedAt: new Date(pr.updated_at),
      mergedAt,
      closedAt,
      cycleTimeMs: endDate ? msBetween(createdAt, endDate) : null,
      leadTimeMs: endDate ? msBetween(createdAt, endDate) : null,
      timeInReviewMs: null, // calculado a partir das reviews
      branch: pr.head.ref,
    });
  }

  return metrics;
}
