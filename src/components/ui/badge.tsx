import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium leading-none",
  {
    variants: {
      tone: {
        default: "border-transparent bg-secondary text-foreground",
        primary: "border-transparent bg-primary/15 text-primary",
        blue: "border-transparent bg-tone-blue/15 text-tone-blue",
        teal: "border-transparent bg-tone-teal/15 text-tone-teal",
        amber: "border-transparent bg-tone-amber/15 text-tone-amber",
        rose: "border-transparent bg-tone-rose/15 text-tone-rose",
        zinc: "border-transparent bg-tone-zinc/15 text-tone-zinc",
        emerald: "border-transparent bg-tone-emerald/15 text-tone-emerald",
        outline: "border-border text-foreground",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

function Badge({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { Badge, badgeVariants };
