import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CellValue, ColumnDef } from "@/types/workspace";

export function formatRelative(ts: number): string {
  return formatDistanceToNow(ts, { addSuffix: true, locale: ptBR });
}

export function formatDateShort(value: string): string {
  const t = Date.parse(value);
  if (Number.isNaN(t)) return value;
  return format(t, "dd/MM/yyyy", { locale: ptBR });
}

export function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "");
  if (d.startsWith("55") && d.length >= 12) {
    const rest = d.slice(2);
    const ddd = rest.slice(0, 2);
    const local = rest.slice(2);
    if (local.length === 9) {
      return `+55 (${ddd}) ${local.slice(0, 5)}-${local.slice(5)}`;
    }
    if (local.length === 8) {
      return `+55 (${ddd}) ${local.slice(0, 4)}-${local.slice(4)}`;
    }
  }
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return value;
}

export function whatsappHref(value: string): string {
  const d = value.replace(/\D/g, "");
  return `https://wa.me/${d}`;
}

export function formatCell(column: ColumnDef, value: CellValue): string {
  if (value === null || value === undefined || value === "") return "—";
  if (column.type === "boolean") return value ? "Sim" : "Não";
  if (column.type === "phone") return formatPhone(String(value));
  if (column.type === "date") return formatDateShort(String(value));
  if (column.type === "number") {
    return new Intl.NumberFormat("pt-BR").format(Number(value));
  }
  return String(value);
}

export const SELECT_TONES = [
  "blue",
  "teal",
  "amber",
  "rose",
  "zinc",
  "emerald",
] as const;

export function selectTone(option: string, options: string[] = []): (typeof SELECT_TONES)[number] {
  const i = Math.max(0, options.indexOf(option));
  return SELECT_TONES[i % SELECT_TONES.length];
}
