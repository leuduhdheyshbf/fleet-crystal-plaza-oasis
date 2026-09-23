import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="relative grid size-8 place-items-center rounded-md bg-primary/15 shadow-glow">
        <svg viewBox="0 0 24 24" className="size-4.5 text-primary" aria-hidden>
          <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.95" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.45" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.45" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.95" />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight">Nexora</span>
          <span className="mt-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Workspace
          </span>
        </span>
      )}
    </div>
  );
}
