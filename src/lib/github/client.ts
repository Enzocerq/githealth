import { Octokit } from "@octokit/rest";
import { throttling } from "@octokit/plugin-throttling";
import { retry } from "@octokit/plugin-retry";

const OctokitWithPlugins = Octokit.plugin(throttling, retry);

export type GitHubClient = InstanceType<typeof OctokitWithPlugins>;

/**
 * Cria um cliente Octokit autenticado com throttling e retry automáticos.
 * @param accessToken Token OAuth do usuário (da sessão JWT).
 */
export function createGitHubClient(accessToken: string): GitHubClient {
  return new OctokitWithPlugins({
    auth: accessToken,
    throttle: {
      onRateLimit(
        retryAfter: number,
        options: { method: string; url: string },
        _octokit: unknown,
        retryCount: number,
      ) {
        if (retryCount < 2) {
          console.warn(
            `[GitHub] Rate limit atingido para ${options.method} ${options.url}. Tentando novamente em ${retryAfter}s.`,
          );
          return true;
        }
        return false;
      },
      onSecondaryRateLimit(
        _retryAfter: number,
        options: { method: string; url: string },
      ) {
        console.warn(
          `[GitHub] Secondary rate limit para ${options.method} ${options.url}.`,
        );
        return false;
      },
    },
  });
}
