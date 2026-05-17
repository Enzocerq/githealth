import { syncGitHubForUser } from "./orchestrator";

/**
 * Executa sincronização incremental (apenas delta desde lastSyncAt).
 * Wrapper semântico sobre o orquestrador.
 */
export async function runIncrementalSync(userId: string): Promise<void> {
  await syncGitHubForUser(userId, "incremental");
}
