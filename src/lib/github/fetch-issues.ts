import type { GitHubClient } from "./client";
import { isBugFix } from "./classify";
import { msBetween } from "@/lib/utils/date";

export type GitHubIssueMetric = {
  githubNodeId: string | null;
  number: number;
  authorLogin: string | null;
  assigneeLogin: string | null;
  title: string;
  state: string;
  isBug: boolean;
  openedAt: Date;
  closedAt: Date | null;
  resolutionTimeMs: bigint | null;
  reopened: boolean;
};

export async function fetchIssuesForRepository({
  client,
  owner,
  repo,
  since,
  maxIssues = 80,
}: {
  client: GitHubClient;
  owner: string;
  repo: string;
  since: Date;
  maxIssues?: number;
}): Promise<GitHubIssueMetric[]> {
  const issues = await client.paginate(client.rest.issues.listForRepo, {
    owner,
    repo,
    state: "all",
    since: since.toISOString(),
    per_page: 100,
  });

  // A API do GitHub retorna PRs no endpoint de issues — filtramos aqui
  const selectedIssues = issues
    .filter((issue) => !("pull_request" in issue))
    .slice(0, maxIssues);

  const metrics: GitHubIssueMetric[] = [];

  for (const issue of selectedIssues) {
    const events = await client.paginate(client.rest.issues.listEvents, {
      owner,
      repo,
      issue_number: issue.number,
      per_page: 100,
    });

    const openedAt = new Date(issue.created_at);
    const closedAt = issue.closed_at ? new Date(issue.closed_at) : null;
    const labelNames = issue.labels
      .map((label) => (typeof label === "string" ? label : label.name))
      .filter((name): name is string => Boolean(name));

    metrics.push({
      githubNodeId: issue.node_id ?? null,
      number: issue.number,
      authorLogin: issue.user?.login ?? null,
      assigneeLogin: issue.assignee?.login ?? null,
      title: issue.title,
      state: issue.state,
      isBug: isBugFix({ title: issue.title, labels: labelNames }),
      openedAt,
      closedAt,
      resolutionTimeMs: closedAt ? msBetween(openedAt, closedAt) : null,
      reopened: events.some((event) => event.event === "reopened"),
    });
  }

  return metrics;
}
