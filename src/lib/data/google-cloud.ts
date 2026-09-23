import type { WorkspaceSnapshot } from "@/types/workspace";
import { connectGoogleSheets } from "@/lib/data/google-export";

const CLOUD_FILE_NAME = "nexora-workspace-v1.json";
const CLOUD_FILE_ID_KEY = "nexora.google.drive_file_id";
const CLOUD_SYNC_KEY = "nexora.google.cloud_sync";
const TOKEN_KEY = "nexora.google.access_token";
const TOKEN_EXP_KEY = "nexora.google.token_exp";

export function isCloudSyncEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(CLOUD_SYNC_KEY) === "1";
}

export function setCloudSyncEnabled(on: boolean): void {
  if (typeof window === "undefined") return;
  if (on) window.localStorage.setItem(CLOUD_SYNC_KEY, "1");
  else window.localStorage.removeItem(CLOUD_SYNC_KEY);
}

function getCloudFileId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CLOUD_FILE_ID_KEY);
}

function setCloudFileId(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) window.localStorage.setItem(CLOUD_FILE_ID_KEY, id);
  else window.localStorage.removeItem(CLOUD_FILE_ID_KEY);
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  const exp = Number(window.sessionStorage.getItem(TOKEN_EXP_KEY) || 0);
  if (exp && Date.now() > exp) {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(TOKEN_EXP_KEY);
    return null;
  }
  return window.sessionStorage.getItem(TOKEN_KEY);
}

function isWorkspaceSnapshot(value: unknown): value is WorkspaceSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<WorkspaceSnapshot>;
  return (
    snapshot.version === 1 &&
    Array.isArray(snapshot.tables) &&
    typeof snapshot.rows === "object" &&
    snapshot.rows !== null &&
    Array.isArray(snapshot.activity) &&
    typeof snapshot.profile === "object" &&
    snapshot.profile !== null &&
    typeof snapshot.views === "object" &&
    snapshot.views !== null &&
    typeof snapshot.locked === "boolean"
  );
}

async function ensureToken(clientId: string): Promise<string> {
  const existing = getStoredToken();
  if (existing) return existing;
  return connectGoogleSheets(clientId);
}

async function findCloudFileId(token: string): Promise<string | null> {
  const cached = getCloudFileId();
  if (cached) return cached;
  const q = encodeURIComponent(`name='${CLOUD_FILE_NAME}' and trashed=false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,name)&pageSize=5`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Falha ao buscar arquivo na nuvem: ${res.status} ${body.slice(0, 150)}`);
  }
  const data = (await res.json()) as { files?: { id: string }[] };
  const id = data.files?.[0]?.id ?? null;
  if (id) setCloudFileId(id);
  return id;
}

export async function saveWorkspaceToCloud(
  snapshot: WorkspaceSnapshot,
  clientId: string,
): Promise<{ fileId: string }> {
  const token = await ensureToken(clientId);
  const body = JSON.stringify(snapshot);
  const existingId = await findCloudFileId(token);

  if (existingId) {
    const res = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(existingId)}?uploadType=media`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body,
      },
    );
    if (!res.ok) {
      if (res.status === 404) {
        setCloudFileId(null);
        return saveWorkspaceToCloud(snapshot, clientId);
      }
      const text = await res.text();
      throw new Error(`Falha ao atualizar nuvem: ${res.status} ${text.slice(0, 150)}`);
    }
    return { fileId: existingId };
  }

  const metadata = JSON.stringify({
    name: CLOUD_FILE_NAME,
    mimeType: "application/json",
  });
  const boundary = "nexora_boundary_" + Date.now();
  const multipart =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipart,
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha ao criar arquivo na nuvem: ${res.status} ${text.slice(0, 200)}`);
  }
  const created = (await res.json()) as { id: string };
  setCloudFileId(created.id);
  return { fileId: created.id };
}

export async function loadWorkspaceFromCloud(
  clientId: string,
): Promise<WorkspaceSnapshot | null> {
  const token = await ensureToken(clientId);
  const fileId = await findCloudFileId(token);
  if (!fileId) return null;

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (res.status === 404) {
    setCloudFileId(null);
    return null;
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha ao ler nuvem: ${res.status} ${text.slice(0, 150)}`);
  }
  const parsed: unknown = await res.json();
  if (!isWorkspaceSnapshot(parsed)) {
    throw new Error("Arquivo na nuvem não é um workspace Nexora válido");
  }
  return parsed;
}
