import type { WorkspaceSnapshot } from "@/types/workspace";

export interface DataAdapter {
  load(): Promise<WorkspaceSnapshot | null>;
  save(data: WorkspaceSnapshot): Promise<void>;
}

const STORAGE_KEY = "nexora.workspace.v1";

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

/**
 * Browser localStorage persistence.
 *
 * The deployed Cloudflare Worker has no DATABASE_URL and PGLite is not reliable
 * in the Workers runtime. Using localStorage keeps the app fully client-side and
 * avoids the previous unhandled HTTP 500 on every page load.
 *
 * Important: this module must NOT import server-only code (`@/lib/data/server`,
 * `@/lib/db`, auth middleware). Those pull `pg` / PGLite into the SSR graph and
 * crash the Worker at request time.
 */
export class LocalStorageAdapter implements DataAdapter {
  async load(): Promise<WorkspaceSnapshot | null> {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      return isWorkspaceSnapshot(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  async save(data: WorkspaceSnapshot): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("[nexora] failed to persist workspace", err);
    }
  }
}

export const workspaceAdapter: DataAdapter = new LocalStorageAdapter();
