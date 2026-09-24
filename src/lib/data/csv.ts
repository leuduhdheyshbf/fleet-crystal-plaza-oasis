import type { ColumnDef, Row } from "@/types/workspace";
import { cellsFromUnknown } from "@/lib/data/validation";
import { uid } from "@/lib/utils";

export type Delimiter = "," | ";" | "\t" | "|";

export function detectDelimiter(text: string): Delimiter {
  const first = text.split(/\r?\n/).find((l) => l.trim()) ?? "";
  let best: Delimiter = ",";
  let bestCount = -1;
  for (const d of [",", ";", "\t", "|"] as Delimiter[]) {
    const count = splitCsvLine(first, d).length;
    if (count > bestCount) {
      bestCount = count;
      best = d;
    }
  }
  return best;
}

export function splitCsvLine(line: string, delimiter: Delimiter): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function parseDelimited(text: string, delimiter: Delimiter): string[][] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  const rows: string[][] = [];
  let buf = "";
  let inQuotes = false;
  for (const line of lines) {
    if (buf.length) buf += "\n";
    buf += line;
    const quotes = (buf.match(/"/g) || []).length;
    inQuotes = quotes % 2 === 1;
    if (!inQuotes) {
      if (buf.trim().length > 0) rows.push(splitCsvLine(buf, delimiter));
      buf = "";
    }
  }
  if (buf.trim()) rows.push(splitCsvLine(buf, delimiter));
  return rows;
}

function slug(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

export function mapHeadersToColumns(
  headers: string[],
  columns: ColumnDef[],
): (string | null)[] {
  return headers.map((h) => {
    const s = slug(h);
    const exact = columns.find((c) => slug(c.name) === s || c.id === h);
    if (exact) return exact.id;
    if (s === "id" || s === "identidade") {
      const idCol = columns.find((c) => c.id === "identidade" || slug(c.name) === "id");
      if (idCol) return idCol.id;
    }
    return null;
  });
}

export interface ImportPreview {
  delimiter: Delimiter;
  headers: string[];
  mapping: (string | null)[];
  sample: string[][];
  total: number;
  /** true quando cola linha a linha (um valor por linha) */
  vertical?: boolean;
}

/**
 * Cola vertical: uma linha = um campo.
 * Ex.:
 *   marcos
 *   15
 *   souzazx
 * vira uma linha com colunas na ordem da tabela.
 */
function isVerticalFieldPaste(text: string): boolean {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return false;
  const plain = lines.filter((l) => !/[\t,;|]/.test(l)).length;
  return plain >= lines.length * 0.8;
}

function verticalToTable(text: string, columns: ColumnDef[]): string[][] {
  const values = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const colCount = Math.max(columns.length, 1);
  const headers = columns.map((c) => c.name);
  const body: string[][] = [];
  for (let i = 0; i < values.length; i += colCount) {
    const chunk = values.slice(i, i + colCount);
    while (chunk.length < colCount) chunk.push("");
    body.push(chunk);
  }
  return [headers, ...body];
}

export function previewImport(text: string, columns: ColumnDef[]): ImportPreview {
  if (isVerticalFieldPaste(text) && columns.length > 0) {
    const table = verticalToTable(text, columns);
    const headers = (table[0] ?? []).map((h) => h.trim());
    const body = table.slice(1);
    return {
      delimiter: ",",
      headers,
      mapping: columns.map((c) => c.id),
      sample: body.slice(0, 8),
      total: body.length,
      vertical: true,
    };
  }

  const delimiter = detectDelimiter(text);
  const table = parseDelimited(text, delimiter);
  const headers = (table[0] ?? []).map((h) => h.trim());
  const body = table.slice(1);
  return {
    delimiter,
    headers,
    mapping: mapHeadersToColumns(headers, columns),
    sample: body.slice(0, 8),
    total: body.length,
  };
}

export function rowsFromImport(
  text: string,
  delimiter: Delimiter,
  columns: ColumnDef[],
  mapping: (string | null)[],
  tableId: string,
): Row[] {
  let body: string[][];
  if (isVerticalFieldPaste(text) && columns.length > 0) {
    body = verticalToTable(text, columns).slice(1);
  } else {
    const table = parseDelimited(text, delimiter);
    body = table.slice(1);
  }
  const now = Date.now();
  return body
    .map((line) => {
      const raw: Record<string, unknown> = {};
      mapping.forEach((colId, i) => {
        if (!colId) return;
        raw[colId] = line[i] ?? "";
      });
      return {
        id: uid("row"),
        tableId,
        cells: cellsFromUnknown(columns, raw),
        createdAt: now,
        updatedAt: now,
      } satisfies Row;
    })
    .filter((r) => Object.values(r.cells).some((v) => v !== null && v !== ""));
}

function escapeField(value: string, delimiter: Delimiter): string {
  if (value.includes('"') || value.includes("\n") || value.includes("\r") || value.includes(delimiter)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(
  columns: ColumnDef[],
  rows: Row[],
  delimiter: Delimiter = ",",
): string {
  const header = columns.map((c) => escapeField(c.name, delimiter)).join(delimiter);
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const v = row.cells[c.id];
        if (v === null || v === undefined) return "";
        if (typeof v === "boolean") return v ? "true" : "false";
        return escapeField(String(v), delimiter);
      })
      .join(delimiter),
  );
  return [header, ...lines].join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function slugFilename(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "tabela"
  );
}
