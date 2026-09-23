import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkspace } from "@/lib/store";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
  setSupabaseConfig,
} from "@/lib/supabase/client";
import {
  getSupabaseUserEmail,
  loadWorkspaceFromSupabase,
  saveWorkspaceToSupabase,
  signInWithEmail,
  signOutSupabase,
  signUpWithEmail,
} from "@/lib/data/supabase-workspace";

export function SupabaseAccountSection() {
  const [sbUrl, setSbUrl] = useState("");
  const [sbAnon, setSbAnon] = useState("");
  const [sbEmail, setSbEmail] = useState("");
  const [sbPassword, setSbPassword] = useState("");
  const [sbUserEmail, setSbUserEmail] = useState<string | null>(null);
  const [sbBusy, setSbBusy] = useState(false);

  useEffect(() => {
    setSbUrl(getSupabaseUrl());
    setSbAnon(getSupabaseAnonKey());
    void getSupabaseUserEmail().then(setSbUserEmail).catch(() => setSbUserEmail(null));
  }, []);

  function saveConfig() {
    setSupabaseConfig(sbUrl, sbAnon);
    toast.success("Configuração Supabase salva neste aparelho");
  }

  async function handleSignUp() {
    if (!sbEmail.trim() || !sbPassword) {
      toast.error("Informe e-mail e senha");
      return;
    }
    setSbBusy(true);
    try {
      setSupabaseConfig(sbUrl, sbAnon);
      await signUpWithEmail(sbEmail, sbPassword);
      setSbUserEmail(sbEmail.trim());
      toast.success("Conta criada. Confirme o e-mail se o Supabase exigir verificação.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao criar conta");
    } finally {
      setSbBusy(false);
    }
  }

  async function handleSignIn() {
    if (!sbEmail.trim() || !sbPassword) {
      toast.error("Informe e-mail e senha");
      return;
    }
    setSbBusy(true);
    try {
      setSupabaseConfig(sbUrl, sbAnon);
      await signInWithEmail(sbEmail, sbPassword);
      const email = await getSupabaseUserEmail();
      setSbUserEmail(email);
      const remote = await loadWorkspaceFromSupabase();
      if (remote) {
        useWorkspace.setState({ ...remote, hydrated: true });
        useWorkspace.getState().persistNow();
        toast.success("Login ok — workspace carregado do Supabase");
      } else {
        const state = useWorkspace.getState();
        await saveWorkspaceToSupabase({
          version: state.version,
          tables: state.tables,
          rows: state.rows,
          activity: state.activity,
          profile: state.profile,
          views: state.views,
          locked: state.locked,
        });
        toast.success("Login ok — workspace local enviado ao Supabase");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha no login");
    } finally {
      setSbBusy(false);
    }
  }

  async function handleSignOut() {
    setSbBusy(true);
    try {
      await signOutSupabase();
      setSbUserEmail(null);
      toast.success("Saiu da conta Supabase");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao sair");
    } finally {
      setSbBusy(false);
    }
  }

  async function handlePush() {
    setSbBusy(true);
    try {
      const state = useWorkspace.getState();
      await saveWorkspaceToSupabase({
        version: state.version,
        tables: state.tables,
        rows: state.rows,
        activity: state.activity,
        profile: state.profile,
        views: state.views,
        locked: state.locked,
      });
      toast.success("Workspace salvo no Supabase");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar");
    } finally {
      setSbBusy(false);
    }
  }

  async function handlePull() {
    setSbBusy(true);
    try {
      const remote = await loadWorkspaceFromSupabase();
      if (!remote) {
        toast.error("Nada no Supabase ainda para esta conta");
        return;
      }
      useWorkspace.setState({ ...remote, hydrated: true });
      useWorkspace.getState().persistNow();
      toast.success("Workspace restaurado do Supabase");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao carregar");
    } finally {
      setSbBusy(false);
    }
  }

  return (
    <section className="rounded-xl bg-card p-5 shadow-card">
      <h3 className="text-sm font-semibold">Conta Supabase (nuvem)</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Crie uma conta e salve o workspace no seu projeto Supabase. Assim você acessa os mesmos
        dados em qualquer aparelho. Rode o SQL em{" "}
        <code className="text-xs">supabase/schema.sql</code> no painel.
      </p>
      <div className="mt-4 space-y-3">
        <div className="grid gap-1.5">
          <Label htmlFor="sb-url">Project URL</Label>
          <Input
            id="sb-url"
            placeholder="https://xxxx.supabase.co"
            value={sbUrl}
            onChange={(e) => setSbUrl(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="sb-anon">Anon public key</Label>
          <Input
            id="sb-anon"
            placeholder="eyJhbGciOi..."
            value={sbAnon}
            onChange={(e) => setSbAnon(e.target.value)}
          />
        </div>
        <Button variant="outline" type="button" onClick={saveConfig}>
          Salvar configuração
        </Button>

        {sbUserEmail ? (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
            <p className="text-sm">
              Logado como <strong>{sbUserEmail}</strong>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handlePush} disabled={sbBusy}>
                {sbBusy ? "Salvando…" : "Salvar no Supabase"}
              </Button>
              <Button variant="outline" onClick={handlePull} disabled={sbBusy}>
                Restaurar do Supabase
              </Button>
              <Button variant="ghost" onClick={handleSignOut} disabled={sbBusy}>
                Sair
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-3">
            <div className="grid gap-1.5">
              <Label htmlFor="sb-email">E-mail</Label>
              <Input
                id="sb-email"
                type="email"
                autoComplete="email"
                value={sbEmail}
                onChange={(e) => setSbEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="sb-password">Senha</Label>
              <Input
                id="sb-password"
                type="password"
                autoComplete="current-password"
                value={sbPassword}
                onChange={(e) => setSbPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSignIn} disabled={sbBusy}>
                {sbBusy ? "Entrando…" : "Entrar"}
              </Button>
              <Button variant="outline" onClick={handleSignUp} disabled={sbBusy}>
                Criar conta
              </Button>
            </div>
            {!isSupabaseConfigured() && (
              <p className="text-xs text-muted-foreground">
                Preencha URL e anon key antes de entrar (ou use VITE_SUPABASE_URL /
                VITE_SUPABASE_ANON_KEY no deploy).
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
