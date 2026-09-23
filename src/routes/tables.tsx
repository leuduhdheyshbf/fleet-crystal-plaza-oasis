import { createFileRoute } from "@tanstack/react-router";
import { TablesPage } from "@/components/tables/TablesPage";

export const Route = createFileRoute("/tables")({ component: TablesPage });
