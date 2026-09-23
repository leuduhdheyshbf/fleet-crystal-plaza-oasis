import { Plus, Trash2 } from "lucide-react";
import type { ColumnDef, FilterOperator, FilterRule } from "@/types/workspace";
import { FILTER_OPERATOR_LABELS } from "@/types/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uid } from "@/lib/utils";

const OPS: FilterOperator[] = [
  "contains",
  "eq",
  "neq",
  "startsWith",
  "endsWith",
  "gt",
  "gte",
  "lt",
  "lte",
  "empty",
  "notEmpty",
];

export function FilterPanel({
  columns,
  rules,
  onChange,
}: {
  columns: ColumnDef[];
  rules: FilterRule[];
  onChange: (rules: FilterRule[]) => void;
}) {
  function update(id: string, patch: Partial<FilterRule>) {
    onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <div className="space-y-3">
      {rules.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Combine regras: idade maior que 18, nome contém Lucas, nick começa com x.
        </p>
      )}
      {rules.map((rule) => {
        const needsValue = !["empty", "notEmpty"].includes(rule.operator);
        return (
          <div key={rule.id} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2">
            <Select
              value={rule.columnId || "__none"}
              onValueChange={(v) => update(rule.id, { columnId: v === "__none" ? "" : v })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Coluna" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={rule.operator}
              onValueChange={(v) => update(rule.id, { operator: v as FilterOperator })}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPS.map((op) => (
                  <SelectItem key={op} value={op}>
                    {FILTER_OPERATOR_LABELS[op]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {needsValue ? (
              <Input
                className="h-9"
                value={rule.value}
                onChange={(e) => update(rule.id, { value: e.target.value })}
                placeholder="Valor"
              />
            ) : (
              <div />
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Remover filtro"
              onClick={() => onChange(rules.filter((r) => r.id !== rule.id))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      })}
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          onChange([
            ...rules,
            {
              id: uid("flt"),
              columnId: columns[0]?.id ?? "",
              operator: "contains",
              value: "",
            },
          ])
        }
      >
        <Plus /> Adicionar filtro
      </Button>
    </div>
  );
}
