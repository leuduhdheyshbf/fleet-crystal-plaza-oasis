import { create } from "zustand";
import type {
  Activity,
  ActivityType,
  CellValue,
  ColumnDef,
  Profile,
  Row,
  TableDef,
  TableIconName,
  ViewMode,
  WorkspaceSnapshot,
} from "@/types/workspace";
import { MEMBERS_TABLE_ID } from "@/types/workspace";
import { workspaceAdapter } from "@/lib/data/adapter";
import { createSeedSnapshot } from "@/lib/data/seed";
import { uid } from "@/lib/utils";
import { cellsFromUnknown } from "@/lib/data/validation";

interface WorkspaceState extends WorkspaceSnapshot {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  persistNow: () => void;

  setLocked: (locked: boolean) => void;
  setProfile: (profile: Partial<Profile>) => void;
  setView: (tableId: string, view: ViewMode) => void;

  addRow: (tableId: string, cells: Record<string, CellValue>) => Row | null;
  updateRow: (tableId: string, rowId: string, cells: Record<string, CellValue>) => void;
  deleteRows: (tableId: string, rowIds: string[]) => void;
  duplicateRows: (tableId: string, rowIds: string[]) => void;
  bulkPatch: (tableId: string, rowIds: string[], columnId: string, value: CellValue) => void;
  importRows: (tableId: string, rows: Row[]) => void;

  addTable: (input: {
    name: string;
    description: string;
    icon: TableIconName;
    columns: ColumnDef[];
  }) => TableDef;
  updateTable: (tableId: string, patch: Partial<Pick<TableDef, "name" | "description" | "icon" | "kanbanColumnId" | "columns">>) => void;
  deleteTable: (tableId: string) => void;

  log: (type: ActivityType, message: string, tableId?: string) => void;
  resetWorkspace: () => void;
  restoreMembersTable: () => void;
}

function snapshotOf(s: WorkspaceState): WorkspaceSnapshot {
  return {
    version: 1,
    tables: s.tables,
    rows: s.rows,
    activity: s.activity.slice(0, 80),
    profile: s.profile,
    views: s.views,
    locked: s.locked,
  };
}

function pushActivity(
  list: Activity[],
  type: ActivityType,
  message: string,
  tableId?: string,
): Activity[] {
  return [
    { id: uid("act"), type, message, tableId, at: Date.now() },
    ...list,
  ].slice(0, 80);
}

const seed = createSeedSnapshot();

export const useWorkspace = create<WorkspaceState>()((set, get) => ({
  ...seed,
  hydrated: true,

  hydrate: async () => {
    const loaded = await workspaceAdapter.load();
    if (loaded) {
      set({
        ...loaded,
        activity: loaded.activity ?? [],
        views: loaded.views ?? {},
        profile: loaded.profile ?? seed.profile,
        locked: Boolean(loaded.locked),
        hydrated: true,
      });
    } else {
      set({ hydrated: true });
      await workspaceAdapter.save(snapshotOf(get()));
    }
  },

  persistNow: () => {
    void workspaceAdapter.save(snapshotOf(get()));
  },

  setLocked: (locked) => {
    set({ locked });
    get().persistNow();
  },

  setProfile: (profile) => {
    set((s) => ({ profile: { ...s.profile, ...profile } }));
    get().persistNow();
  },

  setView: (tableId, view) => {
    set((s) => ({ views: { ...s.views, [tableId]: view } }));
    get().persistNow();
  },

  addRow: (tableId, cells) => {
    const table = get().tables.find((t) => t.id === tableId);
    if (!table) return null;
    const now = Date.now();
    const next: Row = {
      id: uid("row"),
      tableId,
      cells,
      createdAt: now,
      updatedAt: now,
    };
    const label = String(cells[table.columns[0]?.id] ?? "Registro");
    set((s) => ({
      rows: { ...s.rows, [tableId]: [next, ...(s.rows[tableId] ?? [])] },
      tables: s.tables.map((t) => (t.id === tableId ? { ...t, updatedAt: now } : t)),
      activity: pushActivity(s.activity, "create", `${label} adicionado em ${table.name}`, tableId),
    }));
    get().persistNow();
    return next;
  },

  updateRow: (tableId, rowId, cells) => {
    const table = get().tables.find((t) => t.id === tableId);
    const now = Date.now();
    set((s) => ({
      rows: {
        ...s.rows,
        [tableId]: (s.rows[tableId] ?? []).map((r) =>
          r.id === rowId ? { ...r, cells: { ...r.cells, ...cells }, updatedAt: now } : r,
        ),
      },
      tables: s.tables.map((t) => (t.id === tableId ? { ...t, updatedAt: now } : t)),
      activity: pushActivity(
        s.activity,
        "update",
        `Registro atualizado em ${table?.name ?? "tabela"}`,
        tableId,
      ),
    }));
    get().persistNow();
  },

  deleteRows: (tableId, rowIds) => {
    const table = get().tables.find((t) => t.id === tableId);
    const idSet = new Set(rowIds);
    const now = Date.now();
    set((s) => ({
      rows: {
        ...s.rows,
        [tableId]: (s.rows[tableId] ?? []).filter((r) => !idSet.has(r.id)),
      },
      tables: s.tables.map((t) => (t.id === tableId ? { ...t, updatedAt: now } : t)),
      activity: pushActivity(
        s.activity,
        "delete",
        `${rowIds.length} registro${rowIds.length > 1 ? "s" : ""} excluído${rowIds.length > 1 ? "s" : ""} de ${table?.name ?? "tabela"}`,
        tableId,
      ),
    }));
    get().persistNow();
  },

  duplicateRows: (tableId, rowIds) => {
    const table = get().tables.find((t) => t.id === tableId);
    const now = Date.now();
    const idSet = new Set(rowIds);
    set((s) => {
      const current = s.rows[tableId] ?? [];
      const copies = current
        .filter((r) => idSet.has(r.id))
        .map((r) => ({
          ...r,
          id: uid("row"),
          createdAt: now,
          updatedAt: now,
        }));
      return {
        rows: { ...s.rows, [tableId]: [...copies, ...current] },
        tables: s.tables.map((t) => (t.id === tableId ? { ...t, updatedAt: now } : t)),
        activity: pushActivity(
          s.activity,
          "duplicate",
          `${copies.length} registro${copies.length > 1 ? "s" : ""} duplicado${copies.length > 1 ? "s" : ""} em ${table?.name ?? "tabela"}`,
          tableId,
        ),
      };
    });
    get().persistNow();
  },

  bulkPatch: (tableId, rowIds, columnId, value) => {
    const idSet = new Set(rowIds);
    const now = Date.now();
    set((s) => ({
      rows: {
        ...s.rows,
        [tableId]: (s.rows[tableId] ?? []).map((r) =>
          idSet.has(r.id)
            ? { ...r, cells: { ...r.cells, [columnId]: value }, updatedAt: now }
            : r,
        ),
      },
      tables: s.tables.map((t) => (t.id === tableId ? { ...t, updatedAt: now } : t)),
      activity: pushActivity(s.activity, "update", `Edição em massa (${rowIds.length})`, tableId),
    }));
    get().persistNow();
  },

  importRows: (tableId, incoming) => {
    const table = get().tables.find((t) => t.id === tableId);
    const now = Date.now();
    set((s) => ({
      rows: { ...s.rows, [tableId]: [...incoming, ...(s.rows[tableId] ?? [])] },
      tables: s.tables.map((t) => (t.id === tableId ? { ...t, updatedAt: now } : t)),
      activity: pushActivity(
        s.activity,
        "import",
        `${incoming.length} registro${incoming.length > 1 ? "s" : ""} importado${incoming.length > 1 ? "s" : ""} em ${table?.name ?? "tabela"}`,
        tableId,
      ),
    }));
    get().persistNow();
  },

  addTable: (input) => {
    const now = Date.now();
    const table: TableDef = {
      id: uid("tbl"),
      name: input.name,
      description: input.description,
      icon: input.icon,
      columns: input.columns,
      createdAt: now,
      updatedAt: now,
      kanbanColumnId: input.columns.find((c) => c.type === "select")?.id,
    };
    set((s) => ({
      tables: [...s.tables, table],
      rows: { ...s.rows, [table.id]: [] },
      activity: pushActivity(s.activity, "table_create", `Tabela ${table.name} criada`, table.id),
    }));
    get().persistNow();
    return table;
  },

  updateTable: (tableId, patch) => {
    const now = Date.now();
    set((s) => ({
      tables: s.tables.map((t) => (t.id === tableId ? { ...t, ...patch, updatedAt: now } : t)),
      activity: pushActivity(s.activity, "table_update", "Estrutura da tabela atualizada", tableId),
    }));
    get().persistNow();
  },

  deleteTable: (tableId) => {
    const table = get().tables.find((t) => t.id === tableId);
    set((s) => {
      const rows = { ...s.rows };
      delete rows[tableId];
      const views = { ...s.views };
      delete views[tableId];
      return {
        tables: s.tables.filter((t) => t.id !== tableId),
        rows,
        views,
        activity: pushActivity(
          s.activity,
          "table_delete",
          `Tabela ${table?.name ?? ""} removida`,
          tableId,
        ),
      };
    });
    get().persistNow();
  },

  log: (type, message, tableId) => {
    set((s) => ({ activity: pushActivity(s.activity, type, message, tableId) }));
    get().persistNow();
  },

  resetWorkspace: () => {
    const fresh = createSeedSnapshot();
    set({ ...fresh, hydrated: true });
    get().persistNow();
  },

  restoreMembersTable: () => {
    const fresh = createSeedSnapshot();
    const members = fresh.tables.find((t) => t.id === MEMBERS_TABLE_ID);
    if (!members) return;
    set((s) => {
      if (s.tables.some((t) => t.id === MEMBERS_TABLE_ID)) return s;
      return {
        tables: [members, ...s.tables],
        rows: { ...s.rows, [MEMBERS_TABLE_ID]: fresh.rows[MEMBERS_TABLE_ID] ?? [] },
      };
    });
    get().persistNow();
  },
}));

export function useTable(tableId: string): TableDef | undefined {
  return useWorkspace((s) => s.tables.find((t) => t.id === tableId));
}

export function useTableRows(tableId: string): Row[] {
  return useWorkspace((s) => s.rows[tableId] ?? []);
}

export { cellsFromUnknown };
