import type { WorkspaceSnapshot } from "@/types/workspace";

/**
 * Persistence boundary. Swap LocalStorageAdapter for an HTTP/API adapter
 * when a real backend exists — the zustand store only talks to this interface.
 */
export interface DataAdapter {
  load(): Promise<WorkspaceSnapshot | null>;
  save(data: WorkspaceSnapshot): Promise<void>;
}

const KEY = "nexora.workspace.v1";

export class LocalStorageAdapter implements DataAdapter {
  constructor(private readonly key = KEY) {}

  async load(): Promise<WorkspaceSnapshot | null> {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(this.key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as WorkspaceSnapshot;
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.tables)) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  async save(data: WorkspaceSnapshot): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(this.key, JSON.stringify(data));
    } catch {
      // Quota / private mode — keep working in-memory.
    }
  }
}

export const workspaceAdapter: DataAdapter = new LocalStorageAdapter();
