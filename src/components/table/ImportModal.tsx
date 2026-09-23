import { useState } from "react";
import type { Delimiter } from "@/lib/data/csv";
import {
  mapHeadersToColumns,
  parseDelimited,
  previewImport,
  rowsFromImport,
  type ImportPreview,
} from "@/lib/data/csv";
import type { ColumnDef as Col, Row } from "@/types/workspace";
import { COLUMN_TYPE_LABELS } from "@/types/workspace";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

const DELIM_LABEL: Record<string, string> = {
  ",": "Vírgula",
  ";": "Ponto e vírgula",
  "\t": "TAB",
  "|": "Pipe |",
};

export function ImportModal({
  open,
  onOpenChange,
  columns,
  tableId,
  onImport,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  columns: Col[];
  tableId: string;
  onImport: (rows: Row[]) => void;
}) {
  const [fileName, setFileName] = useState("");
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [error, setError] = useState("");

  function reset() {
    setFileName("");
    setText("");
    setPreview(null);
    setError("");
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    const raw = await file.text();
    setFileName(file.name);
    setText(raw);
    if (!raw.trim()) {
      setError("Arquivo vazio.");
      setPreview(null);
      return;
    }
    setError("");
    setPreview(previewImport(raw, columns));
  }

  function setDelimiter(d: Delimiter) {
    if (!text) return;
    const table = parseDelimited(text, d);
    const headers = (table[0] ?? []).map((h) => h.trim());
    const body = table.slice(1);
    setPreview({
      delimiter: d,
      headers,
      mapping: mapHeadersToColumns(headers, columns),
      sample: body.slice(0, 8),
      total: body.length,
    });
  }

  function setMap(index: number, colId: string | null) {
    if (!preview) return;
    const mapping = [...preview.mapping];
    mapping[index] = colId;
    setPreview({ ...preview, mapping });
  }

  function confirm() {
    if (!preview || !text) return;
    const rows = rowsFromImport(
      text,
      preview.delimiter,
      columns,
      preview.mapping,
      tableId,
    );
    if (!rows.length) {
      setError("Nenhuma linha válida para importar.");
      return;
    }
    onImport(rows);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-hidden p-0 sm:max-w-2xl">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle>Importar CSV / TXT</DialogTitle>
            <DialogDescription>
              Detectamos vírgula, ponto e vírgula, TAB ou pipe. Confira o mapeamento antes de importar.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="space-y-4 px-6 py-4">
          <label className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border bg-secondary/50 text-sm text-muted-foreground transition-[border-color,background-color] duration-150 hover:bg-secondary">
            <input
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              className="hidden"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
            {fileName ? fileName : "Selecionar arquivo CSV ou TXT"}
          </label>
          {error && <p className="text-xs text-destructive">{error}</p>}
          {preview && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>Delimitador</Label>
                  <Select
                    value={preview.delimiter === "\t" ? "tab" : preview.delimiter}
                    onValueChange={(v) =>
                      setDelimiter((v === "tab" ? "\t" : v) as Delimiter)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DELIM_LABEL).map(([k, label]) => (
                        <SelectItem key={k} value={k === "\t" ? "tab" : k}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="self-end text-sm text-muted-foreground">
                  {preview.total} linha{preview.total === 1 ? "" : "s"} detectada{preview.total === 1 ? "" : "s"}
                </p>
              </div>
              <div className="grid gap-2">
                <Label>Mapear colunas</Label>
                <div className="grid gap-2">
                  {preview.headers.map((h, i) => (
                    <div key={`${h}-${i}`} className="grid grid-cols-2 items-center gap-2">
                      <p className="truncate text-sm">{h || `Coluna ${i + 1}`}</p>
                      <Select
                        value={preview.mapping[i] ?? "__skip"}
                        onValueChange={(v) => setMap(i, v === "__skip" ? null : v)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Ignorar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__skip">Ignorar</SelectItem>
                          {columns.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name} ({COLUMN_TYPE_LABELS[c.type]})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Prévia</Label>
                <ScrollArea className="mt-2 max-h-48 rounded-lg bg-secondary/60">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr>
                        {preview.headers.map((h, i) => (
                          <th key={i} className="px-2 py-1.5 font-medium text-muted-foreground">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.sample.map((line, ri) => (
                        <tr key={ri} className="border-t border-border">
                          {preview.headers.map((_, ci) => (
                            <td key={ci} className="max-w-32 truncate px-2 py-1.5">
                              {line[ci] ?? ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>
            </>
          )}
        </div>
        <DialogFooter className="border-t border-border p-4">
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            Cancelar
          </Button>
          <Button onClick={confirm} disabled={!preview}>
            Importar {preview ? preview.total : 0} linha{preview?.total === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
