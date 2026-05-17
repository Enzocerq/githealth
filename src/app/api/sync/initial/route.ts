import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { syncGitHubForUser } from "@/lib/sync/orchestrator";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    await syncGitHubForUser(session.user.id, "initial");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[sync/initial]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao sincronizar" },
      { status: 500 },
    );
  }
}
