import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ColumnDef, ColumnType, TableIconName } from "@/types/workspace";
import { COLUMN_TYPE_LABELS } from "@/types/workspace";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TABLE_ICON_OPTIONS, TABLE_ICONS } from "@/lib/table-icons";
import { sanitizeText } from "@/lib/data/sanitize";
import { uid } from "@/lib/utils";

const TYPES = Object.keys(COLUMN_TYPE_LABELS) as ColumnType[];

function emptyCol(): ColumnDef {
  return { id: uid("col"), name: "Nome", type: "text", required: true };
}

export function CreateTableModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (input: {
    name: string;
    description: string;
    icon: TableIconName;
    columns: ColumnDef[];
  }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<TableIconName>("table");
  const [columns, setColumns] = useState<ColumnDef[]>([emptyCol()]);
  const [error, setError] = useState("");

  function reset() {
    setName("");
    setDescription("");
    setIcon("table");
    setColumns([emptyCol()]);
    setError("");
  }

  function submit() {
    const n = sanitizeText(name);
    if (!n) {
      setError("Informe o nome da tabela.");
      return;
    }
    const cols = columns
      .map((c) => ({
        ...c,
        name: sanitizeText(c.name),
        options:
          c.type === "select"
            ? (c.options ?? [])
                .map((o) => sanitizeText(o))
                .filter(Boolean)
            : undefined,
      }))
      .filter((c) => c.name);
    if (!cols.length) {
      setError("Adicione pelo menos uma coluna.");
      return;
    }
    const selectMissing = cols.find((c) => c.type === "select" && !c.options?.length);
    if (selectMissing) {
      setError(`A coluna ${selectMissing.name} precisa de opções (separadas por vírgula).`);
      return;
    }
    onCreate({
      name: n,
      description: sanitizeText(description),
      icon,
      columns: cols,
    });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-hidden p-0 sm:max-w-xl">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle>Nova tabela</DialogTitle>
            <DialogDescription>
              Defina nome, descrição e as colunas. Cada tabela tem suas próprias linhas.
            </DialogDescription>
          </DialogHeader>
        </div>
        <ScrollArea className="max-h-[min(60dvh,32rem)] px-6">
          <div className="grid gap-4 py-4">
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="tbl-name">Nome da tabela</Label>
              <Input
                id="tbl-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Recrutamentos"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="tbl-desc">Descrição</Label>
              <Textarea
                id="tbl-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Para que serve esta tabela"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Ícone</Label>
              <div className="flex flex-wrap gap-1.5">
                {TABLE_ICON_OPTIONS.map((opt) => {
                  const Icon = TABLE_ICONS[opt.name];
                  const on = icon === opt.name;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      title={opt.label}
                      onClick={() => setIcon(opt.name)}
                      className={`grid size-9 place-items-center rounded-md transition-[background-color,color] duration-150 ${
                        on ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-4" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Colunas</Label>
              {columns.map((col, i) => (
                <div key={col.id} className="rounded-lg bg-secondary/70 p-3">
                  <div className="grid grid-cols-[1fr_8rem_auto] items-center gap-2">
                    <Input
                      value={col.name}
                      onChange={(e) =>
                        setColumns((s) =>
                          s.map((c) => (c.id === col.id ? { ...c, name: e.target.value } : c)),
                        )
                      }
                      placeholder="Nome da coluna"
                    />
                    <Select
                      value={col.type}
                      onValueChange={(v) =>
                        setColumns((s) =>
                          s.map((c) =>
                            c.id === col.id ? { ...c, type: v as ColumnType } : c,
                          ),
                        )
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {COLUMN_TYPE_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={columns.length === 1}
                      aria-label="Remover coluna"
                      onClick={() => setColumns((s) => s.filter((c) => c.id !== col.id))}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  {col.type === "select" && (
                    <Input
                      className="mt-2"
                      placeholder="Opções, separadas por vírgula"
                      value={(col.options ?? []).join(", ")}
                      onChange={(e) =>
                        setColumns((s) =>
                          s.map((c) =>
                            c.id === col.id
                              ? {
                                  ...c,
                                  options: e.target.value.split(",").map((x) => x.trim()).filter(Boolean),
                                }
                              : c,
                          ),
                        )
                      }
                    />
                  )}
                  <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={Boolean(col.required)}
                      onChange={(e) =>
                        setColumns((s) =>
                          s.map((c) =>
                            c.id === col.id ? { ...c, required: e.target.checked } : c,
                          ),
                        )
                      }
                    />
                    Obrigatória {i === 0 ? "(primeira coluna)" : ""}
                  </label>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setColumns((s) => [
                    ...s,
                    { id: uid("col"), name: "Nova coluna", type: "text" },
                  ])
                }
              >
                <Plus /> Coluna
              </Button>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="border-t border-border p-4">
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            Cancelar
          </Button>
          <Button onClick={submit}>Criar tabela</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
