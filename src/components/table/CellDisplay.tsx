import { Check, Minus } from "lucide-react";
import type { CellValue, ColumnDef } from "@/types/workspace";
import { Badge } from "@/components/ui/badge";
import { formatCell, formatPhone, selectTone, whatsappHref } from "@/lib/data/format";
import { cn } from "@/lib/utils";

export function CellDisplay({
  column,
  value,
  compact,
}: {
  column: ColumnDef;
  value: CellValue;
  compact?: boolean;
}) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }

  if (column.type === "boolean") {
    return value ? (
      <span className="inline-flex items-center gap-1 text-success">
        <Check className="size-3.5" /> Sim
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        <Minus className="size-3.5" /> Não
      </span>
    );
  }

  if (column.type === "select") {
    const opt = String(value);
    return (
      <Badge tone={selectTone(opt, column.options)}>
        {opt}
      </Badge>
    );
  }

  if (column.type === "phone") {
    const raw = String(value);
    return (
      <a
        href={whatsappHref(raw)}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="font-mono text-xs text-primary hover:underline"
      >
        {formatPhone(raw)}
      </a>
    );
  }

  if (column.id === "identidade" || column.id === "nick" || column.type === "number") {
    return (
      <span
        className={cn(
          "font-mono text-xs tabular-nums",
          compact ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {formatCell(column, value)}
      </span>
    );
  }

  return <span className="truncate">{formatCell(column, value)}</span>;
}
