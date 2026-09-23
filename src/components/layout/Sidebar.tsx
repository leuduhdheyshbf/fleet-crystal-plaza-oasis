import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  Table2,
  Users,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/store";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/members", label: "Membros", icon: Users },
  { to: "/tables", label: "Tabelas", icon: Table2, match: "prefix" as const },
  { to: "/settings", label: "Configurações", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const profile = useWorkspace((s) => s.profile);
  const setLocked = useWorkspace((s) => s.setLocked);

  return (
    <aside className="glass-panel flex h-full w-64 flex-col border-r border-border">
      <div className="px-5 py-5">
        <Logo />
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV.map((item) => {
          const active =
            item.to === "/"
              ? pathname === "/"
              : item.match === "prefix"
                ? pathname === item.to || pathname.startsWith(`${item.to}/`)
                : pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium",
                "transition-[background-color,color] duration-150",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {active && (
                <span className="absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full bg-primary" />
              )}
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3">
        <Separator className="mb-3" />
        <div className="flex items-center gap-3 rounded-lg bg-secondary/60 px-3 py-2.5">
          <div className="grid size-8 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {profile.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{profile.name}</p>
            <p className="truncate text-xs text-muted-foreground">{profile.role}</p>
          </div>
          <button
            type="button"
            onClick={() => setLocked(true)}
            className="relative grid size-8 place-items-center rounded-md text-muted-foreground transition-[background-color,color] duration-150 hover:bg-accent hover:text-foreground after:absolute after:inset-[-6px]"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
