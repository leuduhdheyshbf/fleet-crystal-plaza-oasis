import type { ColumnDef, Row } from "@/types/workspace";
import { Checkbox } from "@/components/ui/checkbox";
import { CellDisplay } from "@/components/table/CellDisplay";
import { cn } from "@/lib/utils";

export function ListView({
  columns,
  rows,
  selected,
  onToggle,
  onOpen,
}: {
  columns: ColumnDef[];
  rows: Row[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onOpen: (row: Row) => void;
}) {
  const primary = columns[0];
  const rest = columns.slice(1, 4);

  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const on = selected.has(row.id);
        return (
          <button
            key={row.id}
            type="button"
            onClick={() => onOpen(row)}
            className={cn(
              "flex w-full items-start gap-3 rounded-xl bg-card p-4 text-left shadow-card",
              "transition-[box-shadow,background-color] duration-150 hover:shadow-card-hover",
              on && "bg-primary/5",
            )}
          >
            <span
              onClick={(e) => {
                e.stopPropagation();
                onToggle(row.id);
              }}
            >
              <Checkbox checked={on} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {primary ? (
                  <CellDisplay column={primary} value={row.cells[primary.id] ?? null} />
                ) : (
                  row.id
                )}
              </span>
              <span className="mt-2 grid gap-1 sm:grid-cols-3">
                {rest.map((col) => (
                  <span key={col.id} className="min-w-0">
                    <span className="block text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                      {col.name}
                    </span>
                    <span className="block truncate text-xs">
                      <CellDisplay column={col} value={row.cells[col.id] ?? null} compact />
                    </span>
                  </span>
                ))}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
