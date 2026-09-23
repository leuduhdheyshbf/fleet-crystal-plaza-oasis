import type { ColumnDef, Row } from "@/types/workspace";
import { cellsFromUnknown } from "@/lib/data/validation";
import { sanitizeText } from "@/lib/data/sanitize";
import { uid } from "@/lib/utils";

export type Delimiter = "," | ";" | "\t" | "|";

const DELIMITERS: Delimiter[] = [",", ";", "\t", "|"];

export function detectDelimiter(text: string): Delimiter {
  const first = text.split(/\r?\n/).find((l) => l.trim()) ?? "";
  let best: Delimiter = ",";
  let bestCount = -1;
  for (const d of DELIMITERS) {
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
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
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
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  const rows: string[][] = [];
  let buf = "";
  let quotes = 0;
  for (const line of lines) {
    buf = buf ? `${buf}\n${line}` : line;
    quotes += (line.match(/"/g) ?? []).length;
    if (quotes % 2 === 0) {
      if (buf.trim().length > 0) rows.push(splitCsvLine(buf, delimiter));
      buf = "";
      quotes = 0;
    }
  }
  if (buf.trim()) rows.push(splitCsvLine(buf, delimiter));
  return rows;
}

function slug(name: string): string {
  return sanitizeText(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function mapHeadersToColumns(
  headers: string[],
  columns: ColumnDef[],
): (string | null)[] {
  return headers.map((h) => {
    const s = slug(h);
    const exact = columns.find(
      (c) => slug(c.name) === s || slug(c.id) === s,
    );
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
}

export function previewImport(text: string, columns: ColumnDef[]): ImportPreview {
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
  const table = parseDelimited(text, delimiter);
  const body = table.slice(1);
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
  return [header, ...lines].join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function slugFilename(name: string): string {
  return (
    sanitizeText(name)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "tabela"
  );
}
