import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { computeAndPersistSnapshotsForUser } from "@/lib/metrics/compute";

/**
 * Rota de cron diário — chamada por um agendador externo (ex: Vercel Cron).
 * Recalcula snapshots diários para todos os usuários com ao menos um sync concluído.
 * Protegida por CRON_SECRET no header Authorization.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const users = await db.user.findMany({
    where: { lastSyncAt: { not: null } },
    select: { id: true },
  });

  const results = await Promise.allSettled(
    users.map((user) => computeAndPersistSnapshotsForUser(user.id)),
  );

  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({
    processed: users.length,
    failed,
    ok: failed === 0,
  });
}
