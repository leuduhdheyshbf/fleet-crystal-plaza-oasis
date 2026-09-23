import { createFileRoute } from "@tanstack/react-router";
import { TableWorkspace } from "@/components/table/TableWorkspace";
import { MEMBERS_TABLE_ID } from "@/types/workspace";
import { useWorkspace } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/members")({ component: MembersPage });

function MembersPage() {
  const exists = useWorkspace((s) => s.tables.some((t) => t.id === MEMBERS_TABLE_ID));
  const restore = useWorkspace((s) => s.restoreMembersTable);

  if (!exists) {
    return (
      <div className="rounded-xl bg-card p-10 text-center shadow-card">
        <p className="text-sm font-medium">Tabela de membros não encontrada</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Restaure o cadastro padrão para continuar.
        </p>
        <Button className="mt-4" onClick={restore}>
          Restaurar Membros
        </Button>
      </div>
    );
  }

  return <TableWorkspace tableId={MEMBERS_TABLE_ID} addLabel="Adicionar membro" />;
}
