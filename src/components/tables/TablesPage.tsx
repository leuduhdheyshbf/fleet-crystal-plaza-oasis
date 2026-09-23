import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateTableModal } from "@/components/table/CreateTableModal";
import { useWorkspace } from "@/lib/store";
import { TABLE_ICONS } from "@/lib/table-icons";
import { formatRelative } from "@/lib/data/format";
import { MEMBERS_TABLE_ID } from "@/types/workspace";

export function TablesPage() {
  const tables = useWorkspace((s) => s.tables);
  const rows = useWorkspace((s) => s.rows);
  const addTable = useWorkspace((s) => s.addTable);
  const deleteTable = useWorkspace((s) => s.deleteTable);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  return (
    <div className="stagger-in space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-primary uppercase">Workspace</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Tabelas</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Cada tabela tem colunas, tipos e registros próprios. Crie bases para staff, torneios, financeiro e o que a operação precisar.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus /> Nova tabela
        </Button>
      </div>

      {tables.length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-16 text-center shadow-card">
          <p className="text-sm font-medium">Nenhuma tabela ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">Crie a primeira para começar a organizar dados.</p>
          <Button className="mt-4" onClick={() => setOpen(true)}>
            <Plus /> Nova tabela
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tables.map((table) => {
            const Icon = TABLE_ICONS[table.icon] ?? TABLE_ICONS.table;
            const count = rows[table.id]?.length ?? 0;
            const href =
              table.id === MEMBERS_TABLE_ID
                ? "/members"
                : `/tables/${table.id}`;
            return (
              <article
                key={table.id}
                className="group relative rounded-xl bg-card p-5 shadow-card transition-[box-shadow] duration-150 hover:shadow-card-hover"
              >
                <Link
                  to={table.id === MEMBERS_TABLE_ID ? "/members" : "/tables/$tableId"}
                  params={table.id === MEMBERS_TABLE_ID ? undefined : { tableId: table.id }}
                  className="block"
                >
                  <span className="grid size-10 place-items-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold tracking-tight">{table.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {table.description || "Sem descrição"}
                  </p>
                  <p className="mt-4 text-xs text-muted-foreground tabular-nums">
                    {count} registro{count === 1 ? "" : "s"} · {table.columns.length} coluna
                    {table.columns.length === 1 ? "" : "s"} · {formatRelative(table.updatedAt)}
                  </p>
                </Link>
                <button
                  type="button"
                  className="absolute top-4 right-4 grid size-8 place-items-center rounded-md text-muted-foreground opacity-100 transition-[background-color,color] duration-150 hover:bg-accent hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label={`Excluir ${table.name}`}
                  onClick={() => setPendingDelete(table.id)}
                >
                  <Trash2 className="size-4" />
                </button>
                <span className="sr-only">{href}</span>
              </article>
            );
          })}
        </div>
      )}

      <CreateTableModal
        open={open}
        onOpenChange={setOpen}
        onCreate={(input) => {
          const table = addTable(input);
          toast.success(`Tabela ${table.name} criada`);
          void navigate({ to: "/tables/$tableId", params: { tableId: table.id } });
        }}
      />

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(v) => !v && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tabela?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os registros desta tabela serão removidos do workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingDelete) {
                  deleteTable(pendingDelete);
                  toast.success("Tabela excluída");
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
