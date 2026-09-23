import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import type { WorkspaceSnapshot } from "@/types/workspace";

function isWorkspaceSnapshot(value: unknown): value is WorkspaceSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<WorkspaceSnapshot>;
  return (
    snapshot.version === 1 &&
    Array.isArray(snapshot.tables) &&
    typeof snapshot.rows === "object" &&
    snapshot.rows !== null &&
    Array.isArray(snapshot.activity) &&
    typeof snapshot.profile === "object" &&
    snapshot.profile !== null &&
    typeof snapshot.views === "object" &&
    snapshot.views !== null &&
    typeof snapshot.locked === "boolean"
  );
}

export const loadWorkspace = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql.query<{ snapshot: unknown }>(
      "SELECT snapshot FROM workspace_snapshots WHERE user_id = $1 LIMIT 1",
      [context.userId],
    );

    if (!rows[0]?.snapshot || !isWorkspaceSnapshot(rows[0].snapshot)) {
      return null;
    }

    return rows[0].snapshot;
  });

export const saveWorkspace = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    if (!isWorkspaceSnapshot(data)) {
      throw new Error("Invalid workspace snapshot");
    }

    const sql = await getSql();
    await sql.query(
      `INSERT INTO workspace_snapshots (user_id, snapshot, updated_at)
       VALUES ($1, $2::jsonb, now())
       ON CONFLICT (user_id)
       DO UPDATE SET snapshot = EXCLUDED.snapshot, updated_at = now()`,
      [context.userId, JSON.stringify(data)],
    );

    return { ok: true };
  });
