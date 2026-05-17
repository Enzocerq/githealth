"use server";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { syncGitHubForUser } from "@/lib/sync/orchestrator";

export async function runInitialSync() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await syncGitHubForUser(session.user.id, "initial");
}

export async function runIncrementalSync() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await syncGitHubForUser(session.user.id, "incremental");
}
