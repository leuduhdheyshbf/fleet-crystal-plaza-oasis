import type {
  CellValue,
  ColumnDef,
  FilterOperator,
  FilterRule,
  Row,
} from "@/types/workspace";

function cellToString(value: CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function cellToNumber(value: CellValue): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function rowMatchesSearch(
  row: Row,
  columns: ColumnDef[],
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return columns.some((col) =>
    cellToString(row.cells[col.id]).toLowerCase().includes(q),
  );
}

export function applyOperator(
  value: CellValue,
  operator: FilterOperator,
  raw: string,
): boolean {
  const text = cellToString(value);
  const needle = raw.trim();

  switch (operator) {
    case "empty":
      return text === "";
    case "notEmpty":
      return text !== "";
    case "eq":
      return text.toLowerCase() === needle.toLowerCase();
    case "neq":
      return text.toLowerCase() !== needle.toLowerCase();
    case "contains":
      return text.toLowerCase().includes(needle.toLowerCase());
    case "startsWith":
      return text.toLowerCase().startsWith(needle.toLowerCase());
    case "endsWith":
      return text.toLowerCase().endsWith(needle.toLowerCase());
    case "gt":
    case "gte":
    case "lt":
    case "lte": {
      const a = cellToNumber(value);
      const b = Number(needle.replace(",", "."));
      if (a === null || !Number.isFinite(b)) return false;
      if (operator === "gt") return a > b;
      if (operator === "gte") return a >= b;
      if (operator === "lt") return a < b;
      return a <= b;
    }
    default:
      return true;
  }
}

export function applyFilters(
  rows: Row[],
  columns: ColumnDef[],
  search: string,
  rules: FilterRule[],
): Row[] {
  return rows.filter((row) => {
    if (!rowMatchesSearch(row, columns, search)) return false;
    return rules.every((rule) => {
      if (!rule.columnId) return true;
      const needsValue = !["empty", "notEmpty"].includes(rule.operator);
      if (needsValue && !rule.value.trim()) return true;
      return applyOperator(row.cells[rule.columnId], rule.operator, rule.value);
    });
  });
}

export function compareCells(
  a: CellValue,
  b: CellValue,
  type: ColumnDef["type"],
): number {
  if (a === null || a === undefined || a === "") return 1;
  if (b === null || b === undefined || b === "") return -1;
  if (type === "number") {
    return Number(a) - Number(b);
  }
  if (type === "boolean") {
    return Number(Boolean(a)) - Number(Boolean(b));
  }
  return cellToString(a).localeCompare(cellToString(b), "pt-BR", {
    sensitivity: "base",
    numeric: true,
  });
}
