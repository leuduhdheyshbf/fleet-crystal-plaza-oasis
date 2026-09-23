import { ArrowDown, ArrowUp, ArrowUpDown, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { ColumnDef as TableCol, Row } from "@/types/workspace";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CellDisplay } from "@/components/table/CellDisplay";
import { compareCells } from "@/lib/data/filters";
import { cn } from "@/lib/utils";

export function DataTable({
  columns,
  rows,
  selected,
  onToggle,
  onToggleAll,
  sortKey,
  sortDir,
  onSort,
  onOpen,
  onEdit,
  onDelete,
}: {
  columns: TableCol[];
  rows: Row[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  sortKey: string | null;
  sortDir: "asc" | "desc";
  onSort: (id: string) => void;
  onOpen: (row: Row) => void;
  onEdit: (row: Row) => void;
  onDelete: (row: Row) => void;
}) {
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someSelected = rows.some((r) => selected.has(r.id)) && !allSelected;

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="w-10 px-3 py-3">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={onToggleAll}
                  aria-label="Selecionar todos"
                />
              </th>
              {columns.map((col) => {
                const active = sortKey === col.id;
                return (
                  <th key={col.id} className="px-3 py-3 font-medium text-muted-foreground">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 transition-[color] duration-150 hover:text-foreground"
                      onClick={() => onSort(col.id)}
                    >
                      {col.name}
                      {active ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="size-3.5 text-primary" />
                        ) : (
                          <ArrowDown className="size-3.5 text-primary" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3.5 opacity-40" />
                      )}
                    </button>
                  </th>
                );
              })}
              <th className="w-12 px-3 py-3 text-right font-medium text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isOn = selected.has(row.id);
              return (
                <tr
                  key={row.id}
                  onClick={() => onOpen(row)}
                  className={cn(
                    "cursor-pointer border-b border-border/70 last:border-0",
                    "transition-[background-color] duration-150 hover:bg-accent/60",
                    isOn && "bg-primary/5",
                  )}
                >
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isOn}
                      onCheckedChange={() => onToggle(row.id)}
                      aria-label="Selecionar linha"
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={col.id} className="max-w-48 truncate px-3 py-2.5">
                      <CellDisplay column={col} value={row.cells[col.id] ?? null} />
                    </td>
                  ))}
                  <td className="px-2 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label="Ações">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onOpen(row)}>
                          <Eye className="size-4" /> Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onEdit(row)}>
                          <Pencil className="size-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(row)}>
                          <Trash2 className="size-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function sortRows(
  rows: Row[],
  columns: TableCol[],
  sortKey: string | null,
  sortDir: "asc" | "desc",
): Row[] {
  if (!sortKey) return rows;
  const col = columns.find((c) => c.id === sortKey);
  if (!col) return rows;
  const copy = [...rows];
  copy.sort((a, b) => {
    const r = compareCells(a.cells[sortKey] ?? null, b.cells[sortKey] ?? null, col.type);
    return sortDir === "asc" ? r : -r;
  });
  return copy;
}
