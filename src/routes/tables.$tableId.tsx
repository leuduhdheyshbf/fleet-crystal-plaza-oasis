import { createFileRoute } from "@tanstack/react-router";
import { TableWorkspace } from "@/components/table/TableWorkspace";

export const Route = createFileRoute("/tables/$tableId")({
  component: TableDetailPage,
});

function TableDetailPage() {
  const { tableId } = Route.useParams();
  return <TableWorkspace tableId={tableId} />;
}
