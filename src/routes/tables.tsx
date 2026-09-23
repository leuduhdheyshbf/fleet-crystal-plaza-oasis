import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/tables")({
  component: TablesLayout,
});

function TablesLayout() {
  return <Outlet />;
}
