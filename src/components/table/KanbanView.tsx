import { useMemo } from "react";
import type { ColumnDef, Row } from "@/types/workspace";
import { CellDisplay } from "@/components/table/CellDisplay";
import { Badge } from "@/components/ui/badge";
import { selectTone } from "@/lib/data/format";
import { cn } from "@/lib/utils";

export function KanbanView({
  columns,
  rows,
  groupColumnId,
  onOpen,
  onMove,
}: {
  columns: ColumnDef[];
  rows: Row[];
  groupColumnId: string;
  onOpen: (row: Row) => void;
  onMove: (rowId: string, value: string) => void;
}) {
  const group = columns.find((c) => c.id === groupColumnId);
  const options = group?.options ?? [];
  const primary = columns[0];
  const extras = columns.filter((c) => c.id !== groupColumnId).slice(1, 3);

  const buckets = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const opt of options) map.set(opt, []);
    map.set("__none", []);
    for (const row of rows) {
      const v = String(row.cells[groupColumnId] ?? "");
      if (map.has(v)) map.get(v)!.push(row);
      else map.get("__none")!.push(row);
    }
    return map;
  }, [rows, options, groupColumnId]);

  if (!group || group.type !== "select" || options.length === 0) {
    return (
      <div className="rounded-xl bg-card p-8 text-center shadow-card">
        <p className="text-sm font-medium">Kanban precisa de uma coluna de seleção</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Adicione uma coluna do tipo Seleção (Status, Gravidade, etc.) para agrupar os cards.
        </p>
      </div>
    );
  }

  const cols = [...options, ...(buckets.get("__none")?.length ? ["__none"] : [])];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {cols.map((opt) => {
        const list = buckets.get(opt) ?? [];
        const label = opt === "__none" ? "Sem status" : opt;
        return (
          <div
            key={opt}
            className="flex w-72 shrink-0 flex-col rounded-xl bg-card p-3 shadow-card"
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/row-id");
              if (id && opt !== "__none") onMove(id, opt);
            }}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              {opt === "__none" ? (
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
              ) : (
                <Badge tone={selectTone(opt, options)}>{label}</Badge>
              )}
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {list.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {list.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/row-id", row.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onClick={() => onOpen(row)}
                  className={cn(
                    "rounded-lg bg-secondary p-3 text-left shadow-card",
                    "transition-[box-shadow,transform] duration-150 hover:shadow-card-hover active:scale-[0.99]",
                  )}
                >
                  <p className="truncate text-sm font-medium">
                    {primary ? String(row.cells[primary.id] ?? "—") : row.id}
                  </p>
                  {extras.map((col) => (
                    <p key={col.id} className="mt-1 truncate text-xs text-muted-foreground">
                      {col.name}:{" "}
                      <CellDisplay column={col} value={row.cells[col.id] ?? null} compact />
                    </p>
                  ))}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
