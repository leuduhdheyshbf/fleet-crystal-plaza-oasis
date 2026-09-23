import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useWorkspace } from "@/lib/store";
import { sanitizeText } from "@/lib/data/sanitize";

export function SettingsPage() {
  const profile = useWorkspace((s) => s.profile);
  const setProfile = useWorkspace((s) => s.setProfile);
  const setLocked = useWorkspace((s) => s.setLocked);
  const resetWorkspace = useWorkspace((s) => s.resetWorkspace);
  const persistNow = useWorkspace((s) => s.persistNow);
  const snapshot = useWorkspace((s) => ({
    version: s.version,
    tables: s.tables,
    rows: s.rows,
    activity: s.activity,
    profile: s.profile,
    views: s.views,
    locked: s.locked,
  }));

  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);

  function save() {
    const n = sanitizeText(name);
    const r = sanitizeText(role);
    if (!n) {
      toast.error("Informe um nome de perfil");
      return;
    }
    setProfile({ name: n, role: r || "Owner" });
    toast.success("Perfil atualizado");
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexora-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exportado");
  }

  return (
    <div className="stagger-in mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-medium tracking-wide text-primary uppercase">Conta</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">Configurações</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Perfil local deste dispositivo. Os dados ficam no navegador até você conectar um backend.
        </p>
      </div>

      <section className="rounded-xl bg-card p-5 shadow-card">
        <h3 className="text-sm font-semibold">Perfil</h3>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="profile-name">Nome</Label>
            <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="profile-role">Função</Label>
            <Input id="profile-role" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={save}>Salvar perfil</Button>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-card p-5 shadow-card">
        <h3 className="text-sm font-semibold">Dados</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Persistência atual via armazenamento local, isolada atrás de um adaptador pronto para API.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => { persistNow(); toast.success("Workspace sincronizado"); }}>
            Sincronizar agora
          </Button>
          <Button variant="outline" onClick={exportBackup}>
            Exportar backup JSON
          </Button>
        </div>
      </section>

      <section className="rounded-xl bg-card p-5 shadow-card">
        <h3 className="text-sm font-semibold">Sessão</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Sair bloqueia o workspace neste dispositivo. Entrar de novo não apaga os dados.
        </p>
        <Button className="mt-4" variant="outline" onClick={() => setLocked(true)}>
          Sair
        </Button>
      </section>

      <section className="rounded-xl bg-card p-5 shadow-card">
        <h3 className="text-sm font-semibold text-destructive">Zona de risco</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Restaura o workspace para os dados de exemplo, incluindo o membro Cassio.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mt-4">
              Restaurar dados iniciais
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Restaurar workspace?</AlertDialogTitle>
              <AlertDialogDescription>
                Tabelas e registros atuais serão substituídos pelos dados de exemplo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  resetWorkspace();
                  toast.success("Workspace restaurado");
                }}
              >
                Restaurar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
