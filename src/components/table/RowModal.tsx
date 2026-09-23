import { useEffect, useState } from "react";
import type { CellValue, ColumnDef, Row } from "@/types/workspace";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldInput } from "@/components/table/FieldInput";
import { cellsFromUnknown, validateCells } from "@/lib/data/validation";
import { ScrollArea } from "@/components/ui/scroll-area";

export function RowModal({
  open,
  onOpenChange,
  columns,
  row,
  title,
  submitLabel,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  columns: ColumnDef[];
  row?: Row | null;
  title: string;
  submitLabel: string;
  onSubmit: (cells: Record<string, CellValue>) => void;
}) {
  const [values, setValues] = useState<Record<string, CellValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const next: Record<string, CellValue> = {};
    for (const c of columns) {
      next[c.id] = row?.cells[c.id] ?? null;
    }
    setValues(next);
    setErrors({});
  }, [open, row, columns]);

  function handleSave() {
    const coerced = cellsFromUnknown(columns, values);
    const nextErrors = validateCells(columns, coerced);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSubmit(coerced);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-hidden p-0 sm:max-w-md">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Campos obrigatórios estão marcados. HTML e scripts são removidos automaticamente.
            </DialogDescription>
          </DialogHeader>
        </div>
        <ScrollArea className="max-h-[min(60dvh,28rem)] px-6">
          <div className="grid gap-4 py-4">
            {errors._form && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {errors._form}
              </p>
            )}
            {columns.map((col, i) => (
              <FieldInput
                key={col.id}
                column={col}
                value={values[col.id] ?? null}
                error={errors[col.id]}
                autoFocus={i === 0}
                onChange={(v) => {
                  setValues((s) => ({ ...s, [col.id]: v }));
                  setErrors((s) => {
                    const n = { ...s };
                    delete n[col.id];
                    delete n._form;
                    return n;
                  });
                }}
              />
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className="border-t border-border p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>{submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
