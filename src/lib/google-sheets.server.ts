import { SignJWT, jwtVerify } from "jose";
import { getSql } from "@/lib/db";

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function secretKey(): Uint8Array {
  return new TextEncoder().encode(requiredEnv("GOOGLE_SHEETS_TOKEN_SECRET"));
}

export async function createGoogleSheetsAuthUrl(userId: string): Promise<string> {
  const clientId = requiredEnv("GOOGLE_CLIENT_ID");
  const redirectUri = requiredEnv("GOOGLE_SHEETS_REDIRECT_URI");

  const state = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .setJti(crypto.randomUUID())
    .sign(secretKey());

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: SHEETS_SCOPE,
    state,
  });

  return `${GOOGLE_AUTH}?${params.toString()}`;
}

async function exchangeCode(code: string) {
  const response = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: requiredEnv("GOOGLE_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      redirect_uri: requiredEnv("GOOGLE_SHEETS_REDIRECT_URI"),
      grant_type: "authorization_code",
    }),
  });
  const data = await response.json() as {
    refresh_token?: string;
    scope?: string;
    error?: string;
    error_description?: string;
  };
  if (!response.ok || !data.refresh_token) {
    throw new Error(data.error_description ?? data.error ?? "Google OAuth exchange failed");
  }
  return data;
}

export async function finishGoogleSheetsOAuth(code: string, state: string): Promise<string> {
  const { payload } = await jwtVerify(state, secretKey(), { algorithms: ["HS256"] });
  const userId = typeof payload.uid === "string" ? payload.uid : null;
  if (!userId) throw new Error("Invalid Google OAuth state");

  const token = await exchangeCode(code);
  const sql = await getSql();
  await sql.query(
    `INSERT INTO google_sheets_connections (user_id, refresh_token, scope, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (user_id)
     DO UPDATE SET refresh_token = EXCLUDED.refresh_token, scope = EXCLUDED.scope, updated_at = now()`,
    [userId, token.refresh_token, token.scope ?? null],
  );

  return userId;
}

async function getAccessToken(userId: string): Promise<string> {
  const sql = await getSql();
  const rows = await sql.query<{ refresh_token: string }>(
    "SELECT refresh_token FROM google_sheets_connections WHERE user_id = $1 LIMIT 1",
    [userId],
  );
  const refreshToken = rows[0]?.refresh_token;
  if (!refreshToken) throw new Error("Google Sheets não conectado");

  const response = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requiredEnv("GOOGLE_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await response.json() as { access_token?: string; error?: string };
  if (!response.ok || !data.access_token) {
    throw new Error(data.error ?? "Não foi possível renovar o token do Google");
  }
  return data.access_token;
}

export async function getGoogleSheetsStatus(userId: string): Promise<{ connected: boolean }> {
  const sql = await getSql();
  const rows = await sql.query(
    "SELECT user_id FROM google_sheets_connections WHERE user_id = $1 LIMIT 1",
    [userId],
  );
  return { connected: Boolean(rows[0]) };
}

function encodeCell(value: unknown): string | number | boolean {
  if (typeof value === "number" || typeof value === "boolean") return value;
  return value == null ? "" : String(value);
}

export async function syncTableToGoogleSheet(
  userId: string,
  tableId: string,
  spreadsheetId: string,
  sheetName: string,
  snapshot: { tables: any[]; rows: Record<string, any[]> },
): Promise<{ updatedRows: number }> {
  const table = snapshot.tables.find((item) => item.id === tableId);
  if (!table) throw new Error("Tabela não encontrada");

  const columns = table.columns;
  const rows = snapshot.rows[tableId] ?? [];
  const values = [
    columns.map((column: any) => column.name),
    ...rows.map((row: any) => columns.map((column: any) => encodeCell(row.cells?.[column.id]))),
  ];

  const token = await getAccessToken(userId);
  const range = `${sheetName}!A1`;
  const clear = await fetch(
    `${SHEETS_API}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(sheetName + "!A:ZZ")}:clear`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: "{}",
    },
  );
  if (!clear.ok) throw new Error(`Google Sheets clear failed: ${clear.status}`);

  const response = await fetch(
    `${SHEETS_API}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ majorDimension: "ROWS", values }),
    },
  );
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Sheets update failed: ${response.status} ${body.slice(0, 300)}`);
  }

  const sql = await getSql();
  await sql.query(
    `INSERT INTO google_sheets_bindings (user_id, table_id, spreadsheet_id, sheet_name, updated_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (user_id, table_id)
     DO UPDATE SET spreadsheet_id = EXCLUDED.spreadsheet_id, sheet_name = EXCLUDED.sheet_name, updated_at = now()`,
    [userId, tableId, spreadsheetId, sheetName],
  );

  return { updatedRows: rows.length };
}

export async function disconnectGoogleSheets(userId: string): Promise<void> {
  const sql = await getSql();
  await sql.query("DELETE FROM google_sheets_connections WHERE user_id = $1", [userId]);
  await sql.query("DELETE FROM google_sheets_bindings WHERE user_id = $1", [userId]);
}
