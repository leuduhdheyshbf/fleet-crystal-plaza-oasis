import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Command } from "cmdk";
import { Search, Table2, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkspace } from "@/lib/store";
import { MEMBERS_TABLE_ID } from "@/types/workspace";
import { formatCell } from "@/lib/data/format";

export function CommandSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const tables = useWorkspace((s) => s.tables);
  const rows = useWorkspace((s) => s.rows);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: { tableId: string; tableName: string; rowId: string; label: string }[] = [];
    for (const table of tables) {
      for (const row of rows[table.id] ?? []) {
        const blob = table.columns
          .map((c) => formatCell(c, row.cells[c.id]))
          .join(" ")
          .toLowerCase();
        if (blob.includes(q)) {
          const label = String(row.cells[table.columns[0]?.id] ?? row.id);
          out.push({ tableId: table.id, tableName: table.name, rowId: row.id, label });
        }
        if (out.length >= 12) return out;
      }
    }
    return out;
  }, [query, tables, rows]);

  function go(path: string) {
    onOpenChange(false);
    void navigate({ to: path });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">Busca global</DialogTitle>
        <DialogDescription className="sr-only">
          Pesquise membros, registros e tabelas
        </DialogDescription>
        <Command className="bg-transparent" shouldFilter={false}>
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 text-muted-foreground" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Pesquisar membros, tabelas, registros..."
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">
              Nenhum resultado.
            </Command.Empty>
            <Command.Group heading="Navegar" className="text-xs text-muted-foreground">
              <Command.Item
                onSelect={() => go("/members")}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground aria-selected:bg-accent"
              >
                <Users className="size-4 text-primary" /> Membros
              </Command.Item>
              <Command.Item
                onSelect={() => go("/tables")}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground aria-selected:bg-accent"
              >
                <Table2 className="size-4 text-primary" /> Tabelas
              </Command.Item>
            </Command.Group>
            {hits.length > 0 && (
              <Command.Group heading="Registros" className="mt-2 text-xs text-muted-foreground">
                {hits.map((hit) => (
                  <Command.Item
                    key={hit.rowId}
                    onSelect={() =>
                      go(
                        hit.tableId === MEMBERS_TABLE_ID
                          ? `/members?row=${hit.rowId}`
                          : `/tables/${hit.tableId}?row=${hit.rowId}`,
                      )
                    }
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-2 text-sm text-foreground aria-selected:bg-accent"
                  >
                    <span className="truncate">{hit.label}</span>
                    <span className="text-xs text-muted-foreground">{hit.tableName}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
