import type { ColumnDef, Row, TableDef, WorkspaceSnapshot } from "@/types/workspace";
import { downloadCsv, mapHeadersToColumns, slugFilename, toCsv } from "@/lib/data/csv";
import { cellsFromUnknown } from "@/lib/data/validation";
import { uid } from "@/lib/utils";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const GOOGLE_SCOPES = `${SHEETS_SCOPE} ${DRIVE_SCOPE}`;
const TOKEN_KEY = "nexora.google.access_token";
const CLIENT_ID_KEY = "nexora.google.client_id";
const TOKEN_EXP_KEY = "nexora.google.token_exp";

export type SheetPayload = {
  title: string;
  values: (string | number | boolean)[][];
};

function encodeCell(value: unknown): string | number | boolean {
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value == null) return "";
  return String(value);
}

export function safeSheetTitle(name: string, used: Set<string>): string {
  let base = name
    .replace(/[:\\/?*\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
  if (!base) base = "Tabela";
  let candidate = base;
  let n = 2;
  while (used.has(candidate.toLowerCase())) {
    candidate = `${base.slice(0, 85)} ${n}`;
    n += 1;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

export function tableToValues(table: TableDef, rows: Row[]): (string | number | boolean)[][] {
  const columns = table.columns;
  return [
    columns.map((c) => c.name),
    ...rows.map((row) => columns.map((c) => encodeCell(row.cells?.[c.id]))),
  ];
}

export function buildAllSheetPayloads(snapshot: Pick<WorkspaceSnapshot, "tables" | "rows">): SheetPayload[] {
  const used = new Set<string>();
  return snapshot.tables.map((table) => ({
    title: safeSheetTitle(table.name, used),
    values: tableToValues(table, snapshot.rows[table.id] ?? []),
  }));
}

export function downloadAllTablesAsCsv(snapshot: Pick<WorkspaceSnapshot, "tables" | "rows">): number {
  const date = new Date().toISOString().slice(0, 10);
  for (const table of snapshot.tables) {
    const rows = snapshot.rows[table.id] ?? [];
    const csv = toCsv(table.columns, rows, ",");
    downloadCsv(`nexora-${slugFilename(table.name)}-${date}.csv`, csv);
  }
  return snapshot.tables.length;
}

export function getStoredClientId(): string {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem(CLIENT_ID_KEY)?.trim() ||
    (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() ||
    ""
  );
}

export function setStoredClientId(clientId: string): void {
  if (typeof window === "undefined") return;
  const v = clientId.trim();
  if (v) window.localStorage.setItem(CLIENT_ID_KEY, v);
  else window.localStorage.removeItem(CLIENT_ID_KEY);
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  const exp = Number(window.sessionStorage.getItem(TOKEN_EXP_KEY) || 0);
  if (exp && Date.now() > exp) {
    clearGoogleToken();
    return null;
  }
  return window.sessionStorage.getItem(TOKEN_KEY);
}

function storeToken(accessToken: string, expiresInSec?: number): void {
  window.sessionStorage.setItem(TOKEN_KEY, accessToken);
  const exp = Date.now() + Math.max(60, (expiresInSec ?? 3600) - 60) * 1000;
  window.sessionStorage.setItem(TOKEN_EXP_KEY, String(exp));
}

export function clearGoogleToken(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_EXP_KEY);
}

export function isGoogleConnected(): boolean {
  return Boolean(getStoredToken());
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; expires_in?: number; error?: string }) => void;
            error_callback?: (err: { type?: string; message?: string }) => void;
          }) => { requestAccessToken: (opts?: { prompt?: string }) => void };
          revoke: (token: string, done: () => void) => void;
        };
      };
    };
  }
}

function loadGisScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Somente no navegador"));
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-nexora-gis="1"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Falha ao carregar Google Identity")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.dataset.nexoraGis = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar Google Identity"));
    document.head.appendChild(script);
  });
}

export async function connectGoogleSheets(clientId: string): Promise<string> {
  const id = clientId.trim();
  if (!id) throw new Error("Informe o Google Client ID (tipo Web) nas configurações");
  setStoredClientId(id);
  await loadGisScript();
  if (!window.google?.accounts?.oauth2) {
    throw new Error("Google Identity não disponível");
  }

  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: id,
      scope: GOOGLE_SCOPES,
      callback: (resp) => {
        if (resp.error || !resp.access_token) {
          reject(new Error(resp.error || "Autorização negada"));
          return;
        }
        storeToken(resp.access_token, resp.expires_in);
        resolve(resp.access_token);
      },
      error_callback: (err) => {
        reject(new Error(err.message || err.type || "Falha no login Google"));
      },
    });
    client.requestAccessToken({ prompt: "consent" });
  });
}

export async function disconnectGoogleSheets(): Promise<void> {
  const token = getStoredToken();
  clearGoogleToken();
  if (!token) return;
  try {
    await loadGisScript();
    window.google?.accounts?.oauth2?.revoke(token, () => undefined);
  } catch {
    /* ignore */
  }
}

async function ensureAccessToken(clientId: string): Promise<string> {
  const existing = getStoredToken();
  if (existing) return existing;
  return connectGoogleSheets(clientId);
}

async function sheetsFetch(path: string, token: string, init?: RequestInit): Promise<Response> {
  return fetch(`https://sheets.googleapis.com/v4/spreadsheets${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

export async function createSpreadsheetWithAllTables(
  snapshot: Pick<WorkspaceSnapshot, "tables" | "rows" | "profile">,
  clientId: string,
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; sheetCount: number; rowCount: number }> {
  if (!snapshot.tables.length) throw new Error("Nenhuma tabela para exportar");

  const token = await ensureAccessToken(clientId);
  const payloads = buildAllSheetPayloads(snapshot);
  const title = `LATAM — ${snapshot.profile?.name || "Workspace"} — ${new Date().toLocaleDateString("pt-BR")}`;

  const createRes = await sheetsFetch("", token, {
    method: "POST",
    body: JSON.stringify({
      properties: { title },
      sheets: payloads.map((p, index) => ({
        properties: {
          title: p.title,
          index,
          gridProperties: {
            frozenRowCount: 1,
            rowCount: Math.max(p.values.length + 50, 100),
            columnCount: Math.max(p.values[0]?.length ?? 1, 10),
          },
        },
      })),
    }),
  });

  if (!createRes.ok) {
    const body = await createRes.text();
    if (createRes.status === 401) {
      clearGoogleToken();
      throw new Error("Sessão Google expirada. Conecte novamente.");
    }
    throw new Error(`Falha ao criar planilha: ${createRes.status} ${body.slice(0, 200)}`);
  }

  const created = (await createRes.json()) as {
    spreadsheetId: string;
    spreadsheetUrl?: string;
  };

  const data = {
    valueInputOption: "USER_ENTERED",
    data: payloads.map((p) => ({
      range: `'${p.title.replace(/'/g, "''")}'!A1`,
      majorDimension: "ROWS",
      values: p.values,
    })),
  };

  const updateRes = await sheetsFetch(
    `/${encodeURIComponent(created.spreadsheetId)}/values:batchUpdate`,
    token,
    { method: "POST", body: JSON.stringify(data) },
  );

  if (!updateRes.ok) {
    const body = await updateRes.text();
    throw new Error(`Planilha criada, mas falhou ao gravar dados: ${updateRes.status} ${body.slice(0, 200)}`);
  }

  const rowCount = payloads.reduce((n, p) => n + Math.max(0, p.values.length - 1), 0);
  const spreadsheetUrl =
    created.spreadsheetUrl ||
    `https://docs.google.com/spreadsheets/d/${created.spreadsheetId}/edit`;

  return {
    spreadsheetId: created.spreadsheetId,
    spreadsheetUrl,
    sheetCount: payloads.length,
    rowCount,
  };
}

export async function syncOneTableToExistingSheet(
  snapshot: Pick<WorkspaceSnapshot, "tables" | "rows">,
  tableId: string,
  spreadsheetId: string,
  sheetName: string,
  clientId: string,
): Promise<{ updatedRows: number }> {
  const table = snapshot.tables.find((t) => t.id === tableId);
  if (!table) throw new Error("Tabela não encontrada");
  const rows = snapshot.rows[tableId] ?? [];
  const values = tableToValues(table, rows);
  const token = await ensureAccessToken(clientId);
  const id = spreadsheetId.trim();
  const tab = sheetName.trim() || "Sheet1";

  const clearRes = await sheetsFetch(
    `/${encodeURIComponent(id)}/values/${encodeURIComponent(`'${tab.replace(/'/g, "''")}'!A:ZZ`)}:clear`,
    token,
    { method: "POST", body: "{}" },
  );
  if (!clearRes.ok && clearRes.status !== 400) {
    const body = await clearRes.text();
    throw new Error(`Falha ao limpar aba: ${clearRes.status} ${body.slice(0, 150)}`);
  }

  const putRes = await sheetsFetch(
    `/${encodeURIComponent(id)}/values/${encodeURIComponent(`'${tab.replace(/'/g, "''")}'!A1`)}?valueInputOption=USER_ENTERED`,
    token,
    {
      method: "PUT",
      body: JSON.stringify({ majorDimension: "ROWS", values }),
    },
  );
  if (!putRes.ok) {
    const body = await putRes.text();
    throw new Error(`Falha ao gravar aba: ${putRes.status} ${body.slice(0, 200)}`);
  }

  return { updatedRows: rows.length };
}

export function extractSpreadsheetId(urlOrId: string): string {
  const s = urlOrId.trim();
  const m = s.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9-_]{20,}$/.test(s)) return s;
  throw new Error("URL ou ID da planilha inválido");
}

export type SheetTabInfo = { title: string; sheetId: number };

export async function listSpreadsheetTabs(
  spreadsheetIdOrUrl: string,
  clientId: string,
): Promise<{ spreadsheetId: string; title: string; tabs: SheetTabInfo[] }> {
  const spreadsheetId = extractSpreadsheetId(spreadsheetIdOrUrl);
  const token = await ensureAccessToken(clientId);
  const res = await sheetsFetch(
    `/${encodeURIComponent(spreadsheetId)}?fields=spreadsheetId,properties.title,sheets.properties`,
    token,
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Falha ao ler planilha: ${res.status} ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    spreadsheetId: string;
    properties?: { title?: string };
    sheets?: { properties?: { title?: string; sheetId?: number } }[];
  };
  const tabs: SheetTabInfo[] = (data.sheets ?? [])
    .map((s) => ({
      title: s.properties?.title ?? "Sheet1",
      sheetId: s.properties?.sheetId ?? 0,
    }))
    .filter((t) => t.title);
  return {
    spreadsheetId: data.spreadsheetId || spreadsheetId,
    title: data.properties?.title ?? "Planilha",
    tabs,
  };
}

export async function fetchSheetValues(
  spreadsheetIdOrUrl: string,
  sheetName: string,
  clientId: string,
): Promise<string[][]> {
  const spreadsheetId = extractSpreadsheetId(spreadsheetIdOrUrl);
  const token = await ensureAccessToken(clientId);
  const tab = sheetName.trim() || "Sheet1";
  const range = `'${tab.replace(/'/g, "''")}'!A:ZZ`;
  const res = await sheetsFetch(
    `/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?valueRenderOption=FORMATTED_VALUE`,
    token,
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Falha ao puxar aba: ${res.status} ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as { values?: unknown[][] };
  const values = data.values ?? [];
  return values.map((row) =>
    row.map((cell) => (cell === null || cell === undefined ? "" : String(cell))),
  );
}

export function sheetValuesToRows(
  values: string[][],
  columns: ColumnDef[],
  tableId: string,
): Row[] {
  if (!values.length || !columns.length) return [];
  const headers = (values[0] ?? []).map((h) => h.trim());
  const body = values.slice(1);
  let mapping = mapHeadersToColumns(headers, columns);
  const mappedCount = mapping.filter(Boolean).length;
  if (mappedCount === 0) {
    mapping = columns.map((c) => c.id);
  } else {
    mapping = mapping.map((id, i) => id ?? columns[i]?.id ?? null);
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

export async function pullSheetAsRows(
  spreadsheetIdOrUrl: string,
  sheetName: string,
  columns: ColumnDef[],
  tableId: string,
  clientId: string,
): Promise<{ rows: Row[]; headers: string[]; total: number }> {
  const values = await fetchSheetValues(spreadsheetIdOrUrl, sheetName, clientId);
  const headers = (values[0] ?? []).map((h) => h.trim());
  const rows = sheetValuesToRows(values, columns, tableId);
  return { rows, headers, total: rows.length };
}
