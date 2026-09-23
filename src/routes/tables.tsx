import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { TablesPage } from "@/components/tables/TablesPage";

export const Route = createFileRoute("/tables")({
  component: TablesLayout,
});

/**
 * `/tables` is a parent of `/tables/$tableId`. Without an `<Outlet />`, navigating
 * to Staff, Financeiro, etc. still painted the list and looked "broken" — only
 * `/members` worked because it is a top-level route.
 */
function TablesLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isList =
    pathname === "/tables" || pathname === "/tables/" || pathname === "/tables";

  // Exact list path → catalog; any /tables/:id → table workspace via child route
  if (pathname === "/tables" || pathname === "/tables/") {
    return <TablesPage />;
  }

  return <Outlet />;
}
