import type { CellValue, ColumnDef } from "@/types/workspace";
import {
  digitsOnly,
  isLikelyEmail,
  isLikelyPhone,
  parseNumber,
  sanitizeText,
} from "@/lib/data/sanitize";

export type FieldErrors = Record<string, string>;

export function coerceCell(column: ColumnDef, raw: unknown): CellValue {
  if (raw === null || raw === undefined || raw === "") return null;
  switch (column.type) {
    case "boolean": {
      if (typeof raw === "boolean") return raw;
      const s = sanitizeText(raw).toLowerCase();
      if (["true", "1", "sim", "yes", "on"].includes(s)) return true;
      if (["false", "0", "nao", "não", "no", "off"].includes(s)) return false;
      return null;
    }
    case "number": {
      if (typeof raw === "number" && Number.isFinite(raw)) return raw;
      return parseNumber(String(raw));
    }
    case "phone":
      return digitsOnly(String(raw)) || null;
    case "date": {
      const s = sanitizeText(raw);
      if (!s) return null;
      const t = Date.parse(s);
      if (Number.isNaN(t)) return s;
      return s.slice(0, 10);
    }
    default:
      return sanitizeText(raw) || null;
  }
}

export function validateCells(
  columns: ColumnDef[],
  cells: Record<string, unknown>,
): FieldErrors {
  const errors: FieldErrors = {};
  let anyFilled = false;

  for (const col of columns) {
    const coerced = coerceCell(col, cells[col.id]);
    const empty =
      coerced === null ||
      coerced === "" ||
      (typeof coerced === "string" && coerced.trim() === "");

    if (!empty) anyFilled = true;

    if (col.required && empty) {
      errors[col.id] = `${col.name} é obrigatório`;
      continue;
    }
    if (empty) continue;

    if (col.type === "number") {
      if (typeof coerced !== "number") {
        errors[col.id] = `${col.name} deve ser numérico`;
      } else if (col.id === "idade" && (coerced < 0 || coerced > 120 || !Number.isInteger(coerced))) {
        errors[col.id] = "Idade deve ser um número inteiro entre 0 e 120";
      }
    }

    if (col.type === "phone" && !isLikelyPhone(String(coerced))) {
      errors[col.id] = "WhatsApp inválido. Use DDI + DDD + número (10 a 15 dígitos).";
    }

    if (col.type === "email" && !isLikelyEmail(String(coerced))) {
      errors[col.id] = "E-mail inválido";
    }

    if (col.type === "select" && col.options && !col.options.includes(String(coerced))) {
      errors[col.id] = `Selecione uma opção válida para ${col.name}`;
    }
  }

  if (!anyFilled) {
    errors._form = "Preencha pelo menos um campo para salvar o registro.";
  }

  return errors;
}

export function cellsFromUnknown(
  columns: ColumnDef[],
  raw: Record<string, unknown>,
): Record<string, CellValue> {
  const out: Record<string, CellValue> = {};
  for (const col of columns) {
    out[col.id] = coerceCell(col, raw[col.id]);
  }
  return out;
}
