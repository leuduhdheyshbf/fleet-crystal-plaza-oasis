const TAGS = /<\/?[^>]+>/g;
const CONTROLS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const SCRIPTISH = /javascript:|data:text\/html|vbscript:/gi;

export function sanitizeText(input: unknown): string {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(TAGS, "")
    .replace(SCRIPTISH, "")
    .replace(CONTROLS, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function digitsOnly(input: string): string {
  return sanitizeText(input).replace(/\D/g, "");
}

export function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isLikelyPhone(value: string): boolean {
  const d = digitsOnly(value);
  return d.length >= 10 && d.length <= 15;
}

export function parseNumber(value: string): number | null {
  const cleaned = sanitizeText(value).replace(/\s/g, "").replace(",", ".");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
