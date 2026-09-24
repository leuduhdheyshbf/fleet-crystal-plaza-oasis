import type { ClipboardEvent } from "react";
import type { CellValue, ColumnDef } from "@/types/workspace";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function FieldInput({
  column,
  value,
  onChange,
  error,
  autoFocus,
  onPasteText,
}: {
  column: ColumnDef;
  value: CellValue;
  onChange: (v: CellValue) => void;
  error?: string;
  autoFocus?: boolean;
  /** Se retornar true, o paste padrão é cancelado (ex.: preenche vários campos). */
  onPasteText?: (text: string) => boolean;
}) {
  const str = value === null || value === undefined ? "" : String(value);
  const invalid = Boolean(error);

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    if (!onPasteText) return;
    const text = e.clipboardData.getData("text/plain");
    if (!text) return;
    if (onPasteText(text)) {
      e.preventDefault();
    }
  }

  if (column.type === "boolean") {
    return (
      <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2.5">
        <Label htmlFor={column.id}>{column.name}</Label>
        <Switch
          id={column.id}
          checked={Boolean(value)}
          onCheckedChange={(c) => onChange(c)}
        />
      </div>
    );
  }

  if (column.type === "select") {
    return (
      <div className="grid gap-1.5">
        <Label htmlFor={column.id}>
          {column.name}
          {column.required && <span className="text-destructive"> *</span>}
        </Label>
        <Select
          value={str || "__empty"}
          onValueChange={(v) => onChange(v === "__empty" ? null : v)}
        >
          <SelectTrigger id={column.id} aria-invalid={invalid} className={cn(invalid && "ring-2 ring-destructive/70")}>
            <SelectValue placeholder="Selecionar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__empty">—</SelectItem>
            {(column.options ?? []).map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  const typeAttr =
    column.type === "number"
      ? "number"
      : column.type === "date"
        ? "date"
        : column.type === "email"
          ? "email"
          : column.type === "phone"
            ? "tel"
            : "text";

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={column.id}>
        {column.name}
        {column.required && <span className="text-destructive"> *</span>}
      </Label>
      <Input
        id={column.id}
        type={typeAttr}
        autoFocus={autoFocus}
        value={str}
        aria-invalid={invalid}
        inputMode={column.type === "number" || column.type === "phone" ? "numeric" : undefined}
        onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
        onPaste={handlePaste}
        placeholder={placeholderFor(column)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function placeholderFor(column: ColumnDef): string {
  switch (column.type) {
    case "phone":
      return "559481046789";
    case "email":
      return "nome@email.com";
    case "number":
      return "0";
    default:
      return column.name;
  }
}
