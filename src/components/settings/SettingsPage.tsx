import { useEffect, useState } from "react";
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
import {
  clearGoogleToken,
  connectGoogleSheets,
  createSpreadsheetWithAllTables,
  disconnectGoogleSheets,
  downloadAllTablesAsCsv,
  getStoredClientId,
  isGoogleConnected,
  setStoredClientId,
  syncOneTableToExistingSheet,
} from "@/lib/data/google-export";
import {
  isCloudSyncEnabled,
  loadWorkspaceFromCloud,
  saveWorkspaceToCloud,
  setCloudSyncEnabled,
} from "@/lib/data/google-cloud";

export function SettingsPage() {
  const profile = useWorkspace((s) => s.profile);
  const setProfile = useWorkspace((s) => s.setProfile);
  const setLocked = useWorkspace((s) => s.setLocked);
  const resetWorkspace = useWorkspace((s) => s.resetWorkspace);
  const persistNow = useWorkspace((s) => s.persistNow);
  const tables = useWorkspace((s) => s.tables);
  const rows = useWorkspace((s) => s.rows);

  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [clientId, setClientId] = useState("");
  const [googleConnected, setGoogleConnected] = useState(false);
  const [sheetTableId, setSheetTableId] = useState(tables[0]?.id ?? "");
  const [spreadsheetUrl, setSpreadsheetUrl] = useState("");
  const [sheetName, setSheetName] = useState("Sheet1");
  const [syncing, setSyncing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [lastSheetUrl, setLastSheetUrl] = useState<string | null>(null);
  const [cloudSync, setCloudSync] = useState(false);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [lastCloudAt, setLastCloudAt] = useState<string | null>(null);

  useEffect(() => {
    setClientId(getStoredClientId());
    setGoogleConnected(isGoogleConnected());
    setCloudSync(isCloudSyncEnabled());
  }, []);

  useEffect(() => {
    if (!sheetTableId && tables[0]?.id) setSheetTableId(tables[0].id);
  }, [tables, sheetTableId]);

  function spreadsheetIdFromInput(value: string): string {
    const trimmed = value.trim();
    const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match?.[1] ?? trimmed;
  }

  async function handleConnectGoogle() {
    const id = clientId.trim() || getStoredClientId();
    if (!id) {
      toast.error("Cole o Client ID do Google Cloud (tipo aplicativo Web)");
      return;
    }
    setStoredClientId(id);
    try {
      await connectGoogleSheets(id);
      setGoogleConnected(true);
      toast.success("Google Sheets conectado");
    } catch (error) {
      setGoogleConnected(false);
      toast.error(error instanceof Error ? error.message : "Falha ao conectar Google");
    }
  }

  async function handleDisconnectGoogle() {
    await disconnectGoogleSheets();
    clearGoogleToken();
    setGoogleConnected(false);
    toast.success("Google desconectado");
  }

  async function handleSaveCloud() {
    const id = clientId.trim() || getStoredClientId();
    if (!id) {
      toast.error("Informe o Google Client ID");
      return;
    }
    setCloudBusy(true);
    try {
      setStoredClientId(id);
      const state = useWorkspace.getState();
      await saveWorkspaceToCloud(
        {
          version: state.version,
          tables: state.tables,
          rows: state.rows,
          activity: state.activity,
          profile: state.profile,
          views: state.views,
          locked: state.locked,
        },
        id,
      );
      setGoogleConnected(true);
      setCloudSync(true);
      setCloudSyncEnabled(true);
      setLastCloudAt(new Date().toLocaleString("pt-BR"));
      toast.success("Workspace salvo na nuvem (Google Drive)");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar na nuvem");
    } finally {
      setCloudBusy(false);
    }
  }

  async function handleLoadCloud() {
    const id = clientId.trim() || getStoredClientId();
    if (!id) {
      toast.error("Informe o Google Client ID");
      return;
    }
    setCloudBusy(true);
    try {
      setStoredClientId(id);
      const remote = await loadWorkspaceFromCloud(id);
      if (!remote) {
        toast.error("Nenhum backup na nuvem ainda. Use “Salvar na nuvem” neste aparelho primeiro.");
        return;
      }
      useWorkspace.setState({
        ...remote,
        hydrated: true,
      });
      useWorkspace.getState().persistNow();
      setGoogleConnected(true);
      setLastCloudAt(new Date().toLocaleString("pt-BR"));
      toast.success("Workspace restaurado da nuvem");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao carregar da nuvem");
    } finally {
      setCloudBusy(false);
    }
  }

  async function handleCreateAllSheets() {
    const id = clientId.trim() || getStoredClientId();
    if (!id) {
      toast.error("Informe o Google Client ID antes de criar a planilha");
      return;
    }
    if (!tables.length) {
      toast.error("Não há tabelas no workspace");
      return;
    }

    setCreating(true);
    try {
      setStoredClientId(id);
      const state = useWorkspace.getState();
      const result = await createSpreadsheetWithAllTables(
        {
          tables: state.tables,
          rows: state.rows,
          profile: state.profile,
        },
        id,
      );
      setGoogleConnected(true);
      setLastSheetUrl(result.spreadsheetUrl);
      toast.success(
        `Planilha criada: ${result.sheetCount} abas, ${result.rowCount} registros`,
      );
      window.open(result.spreadsheetUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao criar planilha");
    } finally {
      setCreating(false);
    }
  }

  async function handleSyncOneTable() {
    const id = clientId.trim() || getStoredClientId();
    const spreadsheetId = spreadsheetIdFromInput(spreadsheetUrl);
    if (!id) {
      toast.error("Informe o Google Client ID");
      return;
    }
    if (!googleConnected && !isGoogleConnected()) {
      toast.error("Conecte sua conta Google primeiro");
      return;
    }
    if (!sheetTableId || !spreadsheetId || !sheetName.trim()) {
      toast.error("Informe tabela, planilha e nome da aba");
      return;
    }

    setSyncing(true);
    try {
      const state = useWorkspace.getState();
      const result = await syncOneTableToExistingSheet(
        { tables: state.tables, rows: state.rows },
        sheetTableId,
        spreadsheetId,
        sheetName.trim(),
        id,
      );
      toast.success(`Google Sheets atualizado: ${result.updatedRows} registros`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao sincronizar");
    } finally {
      setSyncing(false);
    }
  }

  function handleDownloadCsv() {
    const state = useWorkspace.getState();
    if (!state.tables.length) {
      toast.error("Não há tabelas para exportar");
      return;
    }
    const n = downloadAllTablesAsCsv({ tables: state.tables, rows: state.rows });
    toast.success(`${n} arquivo(s) CSV baixado(s)`);
  }

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
    const s = useWorkspace.getState();
    const snapshot = {
      version: s.version,
      tables: s.tables,
      rows: s.rows,
      activity: s.activity,
      profile: s.profile,
      views: s.views,
      locked: s.locked,
    };
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
        <h3 className="text-sm font-semibold">Google Sheets</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Cria uma planilha nova com <strong>uma aba por tabela</strong> e grava todos os registros,
          ou sincroniza uma tabela em uma planilha que você já tem.
        </p>

        <div className="mt-4 space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="google-client-id">Google Client ID (Web)</Label>
            <Input
              id="google-client-id"
              placeholder="xxxxx.apps.googleusercontent.com"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              onBlur={() => setStoredClientId(clientId)}
            />
            <p className="text-xs text-muted-foreground">
              No Google Cloud Console: APIs e serviços → Credenciais → ID do cliente OAuth (tipo
              Aplicativo da Web). Ative as APIs Google Sheets e Google Drive, e autorize a origem deste site. Reconecte o Google após alterar o Client ID.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={googleConnected ? "outline" : "default"}
              onClick={handleConnectGoogle}
              disabled={googleConnected}
            >
              {googleConnected ? "Google conectado" : "Conectar Google"}
            </Button>
            {googleConnected && (
              <Button variant="ghost" onClick={handleDisconnectGoogle}>
                Desconectar
              </Button>
            )}
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
            <p className="text-sm font-medium">Sessão na nuvem (qualquer aparelho)</p>
            <p className="text-xs text-muted-foreground">
              Salva o workspace completo no seu Google Drive. Em outro celular ou PC, conecte a
              mesma conta Google e toque em <strong>Restaurar da nuvem</strong>. Ative também a
              API <em>Google Drive</em> no Console (além da Sheets).
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSaveCloud} disabled={cloudBusy}>
                {cloudBusy ? "Sincronizando…" : "Salvar na nuvem"}
              </Button>
              <Button variant="outline" onClick={handleLoadCloud} disabled={cloudBusy}>
                Restaurar da nuvem
              </Button>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={cloudSync}
                onChange={(e) => {
                  const on = e.target.checked;
                  setCloudSync(on);
                  setCloudSyncEnabled(on);
                }}
              />
              Lembrar de sincronizar (marque e use “Salvar na nuvem” após mudanças importantes)
            </label>
            {lastCloudAt && (
              <p className="text-xs text-muted-foreground">Última sync: {lastCloudAt}</p>
            )}
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-3">
            <p className="text-sm font-medium">Salvar todas as tabelas</p>
            <p className="text-xs text-muted-foreground">
              Cria uma planilha &quot;Nexora — ...&quot; no seu Google Drive, com uma aba para cada tabela do
              workspace ({tables.length} tabela{tables.length === 1 ? "" : "s"},{" "}
              {Object.values(rows).reduce((n, list) => n + list.length, 0)} registros).
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleCreateAllSheets} disabled={creating}>
                {creating ? "Criando planilha…" : "Criar planilha e salvar tudo"}
              </Button>
              <Button variant="outline" onClick={handleDownloadCsv}>
                Baixar CSVs (todas)
              </Button>
            </div>
            {lastSheetUrl && (
              <p className="text-xs">
                Última planilha:{" "}
                <a
                  className="text-primary underline underline-offset-2"
                  href={lastSheetUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  abrir no Google Sheets
                </a>
              </p>
            )}
          </div>

          <div className="border-t border-border/50 pt-4 space-y-3">
            <p className="text-sm font-medium">Sincronizar uma tabela em planilha existente</p>
            <div className="grid gap-1.5">
              <Label htmlFor="google-sheet-table">Tabela do workspace</Label>
              <select
                id="google-sheet-table"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={sheetTableId}
                onChange={(e) => setSheetTableId(e.target.value)}
              >
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="google-spreadsheet">URL ou ID da planilha</Label>
              <Input
                id="google-spreadsheet"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={spreadsheetUrl}
                onChange={(e) => setSpreadsheetUrl(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="google-sheet-name">Nome da aba</Label>
              <Input
                id="google-sheet-name"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSyncOneTable} disabled={syncing}>
                {syncing ? "Sincronizando…" : "Enviar tabela para a aba"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-card p-5 shadow-card">
        <h3 className="text-sm font-semibold">Dados</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Persistência atual via armazenamento local, isolada atrás de um adaptador pronto para API.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              persistNow();
              toast.success("Workspace sincronizado");
            }}
          >
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
