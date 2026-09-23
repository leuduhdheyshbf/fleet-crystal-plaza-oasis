import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

const URL_KEY = "nexora.supabase.url";
const ANON_KEY = "nexora.supabase.anon";

/** Projeto padrão (pode sobrescrever em Configurações ou com VITE_*). */
const DEFAULT_SUPABASE_URL = "https://eynxmtasjatrumjyqgus.supabase.co";
const DEFAULT_SUPABASE_ANON = "sb_publishable_n10JuW8feXC5F26qUdSPRQ_p611tm_v";

export function getSupabaseUrl(): string {
  if (typeof window === "undefined") return DEFAULT_SUPABASE_URL;
  return (
    window.localStorage.getItem(URL_KEY)?.trim() ||
    (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
    DEFAULT_SUPABASE_URL
  );
}

export function getSupabaseAnonKey(): string {
  if (typeof window === "undefined") return DEFAULT_SUPABASE_ANON;
  return (
    window.localStorage.getItem(ANON_KEY)?.trim() ||
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
    DEFAULT_SUPABASE_ANON
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

/** Cliente browser. Sempre usa URL/anon configurados ou o padrão do projeto. */
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
