import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/Logo";
import {
  signInWithEmail,
  signUpWithEmail,
} from "@/lib/data/supabase-workspace";

type Props = {
  onAuthenticated: () => void;
};

export function LoginScreen({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Informe e-mail e senha");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password);
        toast.success("Conta criada. Entrando…");
        try {
          await signInWithEmail(email, password);
        } catch {
          toast.message("Verifique o e-mail se o Supabase pedir confirmação.");
          return;
        }
      } else {
        await signInWithEmail(email, password);
      }
      toast.success("Login salvo no Supabase");
      onAuthenticated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha no login");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell-bg flex min-h-dvh items-center justify-center px-6">
      <div className="stagger-in w-full max-w-md rounded-xl bg-card p-8 shadow-card">
        <Logo />
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sua conta fica no Supabase. Depois do login, a sessão continua neste aparelho
          até você sair.
        </p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div className="grid gap-1.5">
            <Label htmlFor="login-email">E-mail</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="login-password">Senha</Label>
            <Input
              id="login-password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />
          </div>
          <Button className="w-full" type="submit" disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="animate-spin" />
                Aguarde…
              </>
            ) : mode === "login" ? (
              <>
                Entrar
                <ArrowRight />
              </>
            ) : (
              <>
                Criar conta
                <ArrowRight />
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              Não tem conta?{" "}
              <button
                type="button"
                className="font-medium text-primary underline-offset-2 hover:underline"
                onClick={() => setMode("signup")}
              >
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button
                type="button"
                className="font-medium text-primary underline-offset-2 hover:underline"
                onClick={() => setMode("login")}
              >
                Entrar
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
