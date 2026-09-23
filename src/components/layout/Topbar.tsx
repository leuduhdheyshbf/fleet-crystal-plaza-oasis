import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";

export function Topbar({
  title,
  onMenu,
  onSearch,
}: {
  title: string;
  onMenu: () => void;
  onSearch: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:h-16 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenu}
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </Button>
      <div className="lg:hidden">
        <Logo compact />
      </div>
      <h1 className="hidden min-w-0 truncate text-sm font-semibold tracking-tight md:block md:text-base">
        {title}
      </h1>
      <button
        type="button"
        onClick={onSearch}
        className="ml-auto flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md bg-secondary px-3 text-left text-sm text-muted-foreground shadow-card transition-[box-shadow] duration-150 hover:shadow-card-hover md:max-w-md md:flex-none"
      >
        <Search className="size-4 shrink-0" />
        <span className="truncate">Pesquisar membros...</span>
        <kbd className="ml-auto hidden rounded-sm bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline">
          ⌘K
        </kbd>
      </button>
    </header>
  );
}
