import { cn } from "@/lib/utils";

const LOGO_SRC =
  "data:image/jpeg;base64,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";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-md bg-black shadow-glow ring-1 ring-primary/30">
        <img
          src={LOGO_SRC}
          alt="LATAM"
          className="size-9 object-cover"
          width={36}
          height={36}
        />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight">ＬＡＴＡＭ　友</span>
          <span className="mt-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Workspace
          </span>
        </span>
      )}
    </div>
  );
}
