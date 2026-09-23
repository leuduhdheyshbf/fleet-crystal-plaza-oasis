import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

const URL_KEY = "nexora.supabase.url";
const ANON_KEY = "nexora.supabase.anon";

export function getSupabaseUrl(): string {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem(URL_KEY)?.trim() ||
    (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
    ""
  );
}

export function getSupabaseAnonKey(): string {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem(ANON_KEY)?.trim() ||
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
    ""
  );
}

export function setSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window === "undefined") return;
  const u = url.trim().replace(/\/$/, "");
  const k = anonKey.trim();
  if (u) window.localStorage.setItem(URL_KEY, u);
  else window.localStorage.removeItem(URL_KEY);
  if (k) window.localStorage.setItem(ANON_KEY, k);
  else window.localStorage.removeItem(ANON_KEY);
  clientCache = null;
}

let clientCache: SupabaseClient | null = null;

/** Cliente browser. Retorna null se URL/anon não estiverem configurados. */
export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return null;
  if (!clientCache) {
    clientCache = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
    });
  }
  return clientCache;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export type { User };
