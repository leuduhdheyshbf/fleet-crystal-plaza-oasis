import type { WorkspaceSnapshot } from "@/types/workspace";
import { getSupabase } from "@/lib/supabase/client";

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

/** Carrega o workspace do usuário autenticado no Supabase. */
export async function loadWorkspaceFromSupabase(): Promise<WorkspaceSnapshot | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data: sessionData } = await sb.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return null;

  const { data, error } = await sb
    .from("workspaces")
    .select("snapshot")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Falha ao ler workspace no Supabase");
  }
  if (!data?.snapshot) return null;
  if (!isWorkspaceSnapshot(data.snapshot)) {
    throw new Error("Snapshot no Supabase inválido");
  }
  return data.snapshot;
}

/** Salva (upsert) o workspace do usuário autenticado. */
export async function saveWorkspaceToSupabase(snapshot: WorkspaceSnapshot): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  const { data: sessionData } = await sb.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return;

  const { error } = await sb.from("workspaces").upsert(
    {
      user_id: user.id,
      snapshot,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw new Error(error.message || "Falha ao salvar no Supabase");
  }
}

export async function getSupabaseUserEmail(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.user?.email ?? null;
}

export async function signUpWithEmail(email: string, password: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error("Configure a URL e a anon key do Supabase");
  const { error } = await sb.auth.signUp({ email: email.trim(), password });
  if (error) throw new Error(error.message);
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error("Configure a URL e a anon key do Supabase");
  const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(error.message);
}

export async function signOutSupabase(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signOut();
}
