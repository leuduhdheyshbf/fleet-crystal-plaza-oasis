import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef, Row } from "@/types/workspace";
import {
  getStoredClientId,
  isGoogleConnected,
  listSpreadsheetTabs,
  pullSheetAsRows,
  type SheetTabInfo,
} from "@/lib/data/google-export";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PullGoogleModal({
  open,
  onOpenChange,
  columns,
  tableId,
  tableName,
  onPull,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  columns: ColumnDef[];
  tableId: string;
  tableName: string;
  onPull: (rows: Row[], mode: "append" | "replace") => void;
}) {
  const [url, setUrl] = useState("");
  const [tabs, setTabs] = useState<SheetTabInfo[]>([]);
  const [sheetTitle, setSheetTitle] = useState("");
  const [selectedTab, setSelectedTab] = useState("");
  const [mode, setMode] = useState<"append" | "replace">("append");
  const [busy, setBusy] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  function reset() {
    setUrl("");
    setTabs([]);
    setSheetTitle("");
    setSelectedTab("");
    setPreviewCount(null);
    setBusy(false);
  }

  async function loadTabs() {
    const clientId = getStoredClientId();
    if (!clientId || !isGoogleConnected()) {
      toast.error("Conecte o Google em Configurações primeiro");
      return;
    }
    if (!url.trim()) {
      toast.error("Cole a URL da planilha");
      return;
    }
    setBusy(true);
    try {
      const info = await listSpreadsheetTabs(url, clientId);
      setTabs(info.tabs);
      setSheetTitle(info.title);
      setSelectedTab(info.tabs[0]?.title ?? "");
      toast.success(`${info.tabs.length} aba(s) em "${info.title}"`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao ler planilha");
    } finally {
      setBusy(false);
    }
  }

  async function pull() {
    const clientId = getStoredClientId();
    if (!clientId || !isGoogleConnected()) {
      toast.error("Conecte o Google em Configurações primeiro");
      return;
    }
    if (!url.trim() || !selectedTab) {
      toast.error("Informe a planilha e a aba");
      return;
    }
    setBusy(true);
    try {
      const { rows, total } = await pullSheetAsRows(
        url,
        selectedTab,
        columns,
        tableId,
        clientId,
      );
      setPreviewCount(total);
      if (!rows.length) {
        toast.error("Nenhuma linha de dados na aba (só cabeçalho ou vazia)");
        return;
      }
      onPull(rows, mode);
      toast.success(
        mode === "replace"
          ? `${total} linha(s) substituíram "${tableName}"`
          : `${total} linha(s) adicionadas em "${tableName}"`,
      );
      reset();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao puxar dados");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Puxar tabela do Google</DialogTitle>
          <DialogDescription>
            Lê uma aba da planilha e traz os dados para{" "}
            <strong>{tableName}</strong>. A 1ª linha deve ser o cabeçalho (nomes das
            colunas).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="sheet-url">URL da planilha</Label>
            <Input
              id="sheet-url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={busy}
            />
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => void loadTabs()}
            disabled={busy || !url.trim()}
          >
            {busy ? <Loader2 className="animate-spin" /> : null}
            Listar abas
          </Button>

          {sheetTitle && (
            <p className="text-xs text-muted-foreground">
              Planilha: <span className="font-medium text-foreground">{sheetTitle}</span>
            </p>
          )}

          {tabs.length > 0 && (
            <div className="grid gap-1.5">
              <Label>Aba</Label>
              <Select value={selectedTab} onValueChange={setSelectedTab}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha a aba" />
                </SelectTrigger>
                <SelectContent>
                  {tabs.map((t) => (
                    <SelectItem key={t.sheetId + t.title} value={t.title}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-1.5">
            <Label>Como importar</Label>
            <Select
              value={mode}
              onValueChange={(v) => setMode(v as "append" | "replace")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="append">Adicionar às linhas atuais</SelectItem>
                <SelectItem value="replace">Substituir tudo desta tabela</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {previewCount !== null && (
            <p className="text-xs text-muted-foreground">{previewCount} linha(s) na última leitura</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancelar
          </Button>
          <Button onClick={() => void pull()} disabled={busy || !selectedTab}>
            {busy ? <Loader2 className="animate-spin" /> : null}
            Puxar dados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
