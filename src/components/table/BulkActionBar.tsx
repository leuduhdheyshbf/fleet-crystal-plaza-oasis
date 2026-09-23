import { Copy, Download, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BulkActionBar({
  count,
  onClear,
  onDelete,
  onExport,
  onDuplicate,
  onEdit,
}: {
  count: number;
  onClear: () => void;
  onDelete: () => void;
  onExport: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-xl bg-card/95 px-3 py-2 shadow-overlay backdrop-blur-md">
        <span className="px-2 text-sm font-medium tabular-nums">
          {count} selecionado{count > 1 ? "s" : ""}
        </span>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil /> Editar
        </Button>
        <Button variant="ghost" size="sm" onClick={onDuplicate}>
          <Copy /> Duplicar
        </Button>
        <Button variant="ghost" size="sm" onClick={onExport}>
          <Download /> Exportar
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
          <Trash2 /> Excluir
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Limpar seleção" onClick={onClear}>
          <X />
        </Button>
      </div>
    </div>
  );
}
