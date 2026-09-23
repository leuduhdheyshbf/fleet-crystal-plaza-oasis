import type { WorkspaceSnapshot } from "@/types/workspace";
import { loadWorkspace, saveWorkspace } from "@/lib/data/server";

export interface DataAdapter {
  load(): Promise<WorkspaceSnapshot | null>;
  save(data: WorkspaceSnapshot): Promise<void>;
}

/**
 * Database-backed workspace persistence.
 *
 * The server functions authenticate the caller and scope every read/write to
 * that user's id. Neon is used when DATABASE_URL exists; otherwise the same
 * schema runs on the local PGLite fallback.
 */
export class DatabaseAdapter implements DataAdapter {
  async load(): Promise<WorkspaceSnapshot | null> {
    return loadWorkspace();
  }

  async save(data: WorkspaceSnapshot): Promise<void> {
    await saveWorkspace({ data });
  }
}

export const workspaceAdapter: DataAdapter = new DatabaseAdapter();
