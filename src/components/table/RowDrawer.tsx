import { Pencil, Trash2, X } from "lucide-react";
import type { ColumnDef, Row } from "@/types/workspace";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CellDisplay } from "@/components/table/CellDisplay";
import { formatRelative } from "@/lib/data/format";

export function RowDrawer({
  open,
  onOpenChange,
  columns,
  row,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  columns: ColumnDef[];
  row: Row | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const title = row
    ? String(row.cells[columns[0]?.id] ?? "Registro")
    : "Registro";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="truncate">{title}</SheetTitle>
          <SheetDescription>
            {row ? `Atualizado ${formatRelative(row.updatedAt)}` : "Detalhes do registro"}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-3 overflow-y-auto px-6">
          {row &&
            columns.map((col) => (
              <div key={col.id} className="rounded-lg bg-secondary/70 p-3">
                <p className="text-xs font-medium text-muted-foreground">{col.name}</p>
                <div className="mt-1 text-sm">
                  <CellDisplay column={col} value={row.cells[col.id] ?? null} />
                </div>
              </div>
            ))}
        </div>
        <SheetFooter className="justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X /> Fechar
          </Button>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 /> Excluir
            </Button>
            <Button onClick={onEdit}>
              <Pencil /> Editar
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
