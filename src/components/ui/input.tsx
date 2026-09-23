import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-md bg-secondary px-3 py-1 text-sm text-foreground shadow-card outline-none placeholder:text-muted-foreground",
        "transition-[box-shadow,background-color] duration-150 ease-out",
        "focus-visible:shadow-card-hover focus-visible:ring-2 focus-visible:ring-ring/60",
        "disabled:pointer-events-none disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "aria-invalid:ring-2 aria-invalid:ring-destructive/70",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
