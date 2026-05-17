import type { GitHubClient } from "./client";

export type GitHubReviewMetric = {
  id: string;
  prGithubId: number;
  prNumber: number;
  reviewerLogin: string | null;
  state: string;
  submittedAt: Date;
};

export async function fetchReviewsForPullRequest({
  client,
  owner,
  repo,
  prNumber,
  prGithubId,
}: {
  client: GitHubClient;
  owner: string;
  repo: string;
  prNumber: number;
  prGithubId: number;
}): Promise<GitHubReviewMetric[]> {
  try {
    const reviews = await client.paginate(client.rest.pulls.listReviews, {
      owner,
      repo,
      pull_number: prNumber,
      per_page: 100,
    });

    return reviews
      .filter((review) => review.submitted_at)
      .map((review) => ({
        id: String(review.id),
        prGithubId,
        prNumber,
        reviewerLogin: review.user?.login ?? null,
        state: review.state,
        submittedAt: new Date(review.submitted_at!),
      }));
  } catch {
    return [];
  }
}
