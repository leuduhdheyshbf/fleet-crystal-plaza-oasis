import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandSearch } from "@/components/layout/CommandSearch";
import { LockScreen } from "@/components/layout/LockScreen";
import { LoginScreen } from "@/components/layout/LoginScreen";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useWorkspace } from "@/lib/store";
import { getSupabase } from "@/lib/supabase/client";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/members": "Membros",
  "/tables": "Tabelas",
  "/settings": "Configurações",
};

function pageTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/tables/")) return "Tabela";
  return "Nexora";
}

export function AppShell({ children }: { children: ReactNode }) {
  const hydrate = useWorkspace((s) => s.hydrate);
  const locked = useWorkspace((s) => s.locked);
  const hydrated = useWorkspace((s) => s.hydrated);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    let cancelled = false;
    const sb = getSupabase();
    if (!sb) {
      setAuthReady(true);
      return;
    }

    void sb.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSessionEmail(data.session?.user?.email ?? null);
      setAuthReady(true);
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user?.email ?? null);
      setAuthReady(true);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!hydrated || !authReady) {
    return (
      <div className="app-shell-bg flex min-h-dvh items-center justify-center">
        <div className="text-sm text-muted-foreground">Carregando…</div>
      </div>
    );
  }

  if (!sessionEmail) {
    return (
      <>
        <LoginScreen
          onAuthenticated={() => {
            const sb = getSupabase();
            void sb?.auth.getSession().then(({ data }) => {
              setSessionEmail(data.session?.user?.email ?? null);
            });
          }}
        />
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "bg-card text-foreground border-border shadow-overlay",
            },
          }}
        />
      </>
    );
  }

  if (locked) return <LockScreen />;

  return (
    <TooltipProvider>
      <div className="app-shell-bg flex min-h-dvh">
        <div className="sticky top-0 hidden h-dvh lg:block">
          <Sidebar />
        </div>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent side="left" className="w-64 p-0 sm:max-w-xs">
            <SheetTitle className="sr-only">Navegação</SheetTitle>
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            title={pageTitle(pathname)}
            onMenu={() => setMenuOpen(true)}
            onSearch={() => setSearchOpen(true)}
          />
          <main className="min-w-0 flex-1 px-4 py-5 md:px-6 md:py-6">{children}</main>
        </div>
        <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "bg-card text-foreground border-border shadow-overlay",
            },
          }}
        />
      </div>
    </TooltipProvider>
  );
}
