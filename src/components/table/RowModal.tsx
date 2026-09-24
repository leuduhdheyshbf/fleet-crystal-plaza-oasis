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
import { Label } from "@/components/ui/label";

/** Quebra o texto colado em partes (linhas ou espaços). */
function splitPasteParts(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return [];

  const byLine = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (byLine.length >= 2) return byLine;

  const single = byLine[0] ?? normalized;
  const bySpace = single.split(/\s+/).filter(Boolean);
  if (bySpace.length >= 2) return bySpace;

  return [single];
}

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
  const [bulkPaste, setBulkPaste] = useState("");

  useEffect(() => {
    if (!open) return;
    const next: Record<string, CellValue> = {};
    for (const c of columns) {
      next[c.id] = row?.cells[c.id] ?? null;
    }
    setValues(next);
    setErrors({});
    setBulkPaste("");
  }, [open, row, columns]);

  function fillFromParts(parts: string[]) {
    if (parts.length < 2) return false;
    const fillable = columns.filter(
      (c) => c.type !== "boolean" && c.type !== "select",
    );
    const targets = fillable.length ? fillable : columns;
    setValues((prev) => {
      const next = { ...prev };
      targets.forEach((col, i) => {
        if (i >= parts.length) return;
        const raw = parts[i];
        if (col.type === "number") {
          const n = Number(raw.replace(",", "."));
          next[col.id] = Number.isFinite(n) ? n : raw;
        } else {
          next[col.id] = raw;
        }
      });
      return next;
    });
    setErrors({});
    return true;
  }

  function handlePasteText(text: string): boolean {
    const parts = splitPasteParts(text);
    return fillFromParts(parts);
  }

  function applyBulkPaste() {
    const parts = splitPasteParts(bulkPaste);
    if (!fillFromParts(parts)) {
      setErrors({
        _form: "Cole pelo menos 2 valores (um por linha ou separados por espaço).",
      });
      return;
    }
    setBulkPaste("");
  }

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
              Cole vários valores de uma vez (um por linha). Campos obrigatórios estão marcados.
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

            <div className="grid gap-1.5 rounded-lg border border-border/60 bg-muted/20 p-3">
              <Label htmlFor="bulk-paste">Colar tudo de uma vez</Label>
              <textarea
                id="bulk-paste"
                className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                placeholder={"marcos\n15\nsouzazx\n838485724\n229948284756"}
                value={bulkPaste}
                onChange={(e) => setBulkPaste(e.target.value)}
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text/plain");
                  if (text && splitPasteParts(text).length >= 2) {
                    window.setTimeout(() => fillFromParts(splitPasteParts(text)), 0);
                  }
                }}
              />
              <Button type="button" variant="secondary" size="sm" onClick={applyBulkPaste}>
                Preencher campos
              </Button>
              <p className="text-[11px] text-muted-foreground">
                Um valor por linha (ou separados por espaço). Vai na ordem das colunas.
              </p>
            </div>

            {columns.map((col, i) => (
              <FieldInput
                key={col.id}
                column={col}
                value={values[col.id] ?? null}
                error={errors[col.id]}
                autoFocus={i === 0}
                onPasteText={handlePasteText}
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
