import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";
import { useWorkspace } from "@/lib/store";

export function LockScreen() {
  const profile = useWorkspace((s) => s.profile);
  const setLocked = useWorkspace((s) => s.setLocked);

  return (
    <div className="app-shell-bg flex min-h-dvh items-center justify-center px-6">
      <div className="stagger-in w-full max-w-md rounded-xl bg-card p-8 shadow-card">
        <Logo />
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">Bem-vindo de volta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Entre no workspace para gerenciar membros, tabelas e operações da equipe.
        </p>
        <div className="mt-6 rounded-lg bg-secondary p-4">
          <p className="text-xs font-medium text-muted-foreground">Sessão local</p>
          <p className="mt-1 text-sm font-medium">{profile.name}</p>
          <p className="text-xs text-muted-foreground">{profile.role}</p>
        </div>
        <Button className="mt-6 w-full" onClick={() => setLocked(false)}>
          Entrar no workspace
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
