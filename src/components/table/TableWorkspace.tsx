import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Rows3,
  Search,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import type { CellValue, FilterRule, Row, ViewMode } from "@/types/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, sortRows } from "@/components/table/DataTable";
import { ListView } from "@/components/table/ListView";
import { KanbanView } from "@/components/table/KanbanView";
import { RowModal } from "@/components/table/RowModal";
import { RowDrawer } from "@/components/table/RowDrawer";
import { FilterPanel } from "@/components/table/FilterPanel";
import { ImportModal } from "@/components/table/ImportModal";
import { BulkActionBar } from "@/components/table/BulkActionBar";
import { FieldInput } from "@/components/table/FieldInput";
import { useWorkspace } from "@/lib/store";
import { applyFilters } from "@/lib/data/filters";
import { downloadCsv, slugFilename, toCsv } from "@/lib/data/csv";
import { cellsFromUnknown, validateCells } from "@/lib/data/validation";
import { TABLE_ICONS } from "@/lib/table-icons";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export function TableWorkspace({
  tableId,
  addLabel,
}: {
  tableId: string;
  addLabel?: string;
}) {
  const table = useWorkspace((s) => s.tables.find((t) => t.id === tableId));
  const allRows = useWorkspace((s) => s.rows[tableId] ?? []);
  const view = useWorkspace((s) => s.views[tableId] ?? "grid");
  const setView = useWorkspace((s) => s.setView);
  const addRow = useWorkspace((s) => s.addRow);
  const updateRow = useWorkspace((s) => s.updateRow);
  const deleteRows = useWorkspace((s) => s.deleteRows);
  const duplicateRows = useWorkspace((s) => s.duplicateRows);
  const bulkPatch = useWorkspace((s) => s.bulkPatch);
  const importRows = useWorkspace((s) => s.importRows);
  const log = useWorkspace((s) => s.log);
  const persistNow = useWorkspace((s) => s.persistNow);

  const isMobile = useMediaQuery("(max-width: 767px)");

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [viewRow, setViewRow] = useState<Row | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkCol, setBulkCol] = useState("");
  const [bulkVal, setBulkVal] = useState<CellValue>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setPage(0);
    setSelected(new Set());
  }, [tableId, search, filters, sortKey, sortDir]);

  const filtered = useMemo(() => {
    if (!table) return [];
    return applyFilters(allRows, table.columns, search, filters);
  }, [allRows, table, search, filters]);

  const sorted = useMemo(() => {
    if (!table) return [];
    return sortRows(filtered, table.columns, sortKey, sortDir);
  }, [filtered, table, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const paged = sorted.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  if (!table) {
    return (
      <div className="rounded-xl bg-card p-10 text-center shadow-card">
        <p className="text-sm font-medium">Tabela não encontrada</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Ela pode ter sido removida. Volte para Tabelas e crie outra.
        </p>
      </div>
    );
  }

  const Icon = TABLE_ICONS[table.icon];
  const createLabel = addLabel ?? `Adicionar em ${table.name}`;
  const kanbanCol =
    table.kanbanColumnId ?? table.columns.find((c) => c.type === "select")?.id ?? "";

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function toggleAll() {
    setSelected((s) => {
      if (paged.every((r) => s.has(r.id))) {
        const n = new Set(s);
        paged.forEach((r) => n.delete(r.id));
        return n;
      }
      const n = new Set(s);
      paged.forEach((r) => n.add(r.id));
      return n;
    });
  }

  function handleSort(id: string) {
    if (sortKey === id) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(id);
      setSortDir("asc");
    }
  }

  function exportRows(rows: Row[], suffix = "") {
    if (!table) return;
    const csv = toCsv(table.columns, rows);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`${slugFilename(table.name)}${suffix}-${stamp}.csv`, csv);
    log("export", `Exportação CSV de ${table.name}`, table.id);
    toast.success("CSV exportado com UTF-8");
  }

  async function sync() {
    if (!table) return;
    setSyncing(true);
    persistNow();
    await new Promise((r) => setTimeout(r, 400));
    setSyncing(false);
    log("sync", `Dados de ${table.name} sincronizados`, table.id);
    toast.success("Dados sincronizados");
  }

  const effectiveView: ViewMode = isMobile && view === "grid" ? "list" : view;
  const filterCount = filters.filter((f) => f.columnId).length;

  return (
    <div className="relative space-y-4 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-primary/15 text-primary">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold tracking-tight">{table.name}</h2>
            <p className="truncate text-sm text-muted-foreground">
              {table.description || `${allRows.length} registros`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void sync()}>
            <RefreshCw className={cn("size-4", syncing && "animate-spin")} />
            Sincronizar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload /> Importar
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportRows(sorted)}>
            <Download /> Exportar
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus /> {createLabel}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Pesquisar ${table.name.toLowerCase()}...`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter /> Filtros
                {filterCount > 0 && (
                  <Badge tone="primary" className="ml-1">
                    {filterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[min(100vw-2rem,36rem)]" align="end">
              <FilterPanel columns={table.columns} rules={filters} onChange={setFilters} />
            </PopoverContent>
          </Popover>
          <Tabs
            value={view}
            onValueChange={(v) => setView(table.id, v as ViewMode)}
          >
            <TabsList>
              <TabsTrigger value="grid" className="hidden md:inline-flex">
                <LayoutGrid className="size-3.5" /> Grid
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="size-3.5" /> Lista
              </TabsTrigger>
              <TabsTrigger value="kanban">
                <Rows3 className="size-3.5" /> Kanban
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-16 text-center shadow-card">
          <p className="text-sm font-medium">Nenhum registro encontrado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {allRows.length === 0
              ? "Comece adicionando um registro ou importe um CSV."
              : "Ajuste a busca ou os filtros para ver resultados."}
          </p>
          <Button className="mt-4" onClick={() => setAddOpen(true)}>
            <Plus /> {createLabel}
          </Button>
        </div>
      ) : effectiveView === "kanban" ? (
        <KanbanView
          columns={table.columns}
          rows={sorted}
          groupColumnId={kanbanCol}
          onOpen={setViewRow}
          onMove={(rowId, value) => {
            updateRow(table.id, rowId, { [kanbanCol]: value });
            toast.success("Status atualizado");
          }}
        />
      ) : effectiveView === "list" ? (
        <ListView
          columns={table.columns}
          rows={paged}
          selected={selected}
          onToggle={toggle}
          onOpen={setViewRow}
        />
      ) : (
        <DataTable
          columns={table.columns}
          rows={paged}
          selected={selected}
          onToggle={toggle}
          onToggleAll={toggleAll}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          onOpen={setViewRow}
          onEdit={setEditRow}
          onDelete={(r) => setDeleteIds([r.id])}
        />
      )}

      {effectiveView !== "kanban" && sorted.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p className="tabular-nums">
            Mostrando {safePage * PAGE_SIZE + 1}–
            {Math.min(sorted.length, safePage * PAGE_SIZE + PAGE_SIZE)} de {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              aria-label="Página anterior"
            >
              <ChevronLeft />
            </Button>
            <span className="px-2 tabular-nums">
              {safePage + 1}/{pageCount}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Próxima página"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}

      <BulkActionBar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        onDelete={() => setDeleteIds([...selected])}
        onExport={() => {
          const rows = allRows.filter((r) => selected.has(r.id));
          exportRows(rows, "-selecao");
        }}
        onDuplicate={() => {
          duplicateRows(table.id, [...selected]);
          toast.success("Registros duplicados");
          setSelected(new Set());
        }}
        onEdit={() => {
          setBulkCol(table.columns[0]?.id ?? "");
          setBulkVal(null);
          setBulkEditOpen(true);
        }}
      />

      <RowModal
        open={addOpen}
        onOpenChange={setAddOpen}
        columns={table.columns}
        title={createLabel}
        submitLabel={createLabel}
        onSubmit={(cells) => {
          addRow(table.id, cells);
          toast.success("Registro adicionado");
        }}
      />
      <RowModal
        open={Boolean(editRow)}
        onOpenChange={(v) => {
          if (!v) setEditRow(null);
        }}
        columns={table.columns}
        row={editRow}
        title="Editar registro"
        submitLabel="Salvar alterações"
        onSubmit={(cells) => {
          if (!editRow) return;
          updateRow(table.id, editRow.id, cells);
          toast.success("Alterações salvas");
        }}
      />
      <RowDrawer
        open={Boolean(viewRow)}
        onOpenChange={(v) => {
          if (!v) setViewRow(null);
        }}
        columns={table.columns}
        row={viewRow}
        onEdit={() => {
          if (viewRow) {
            setEditRow(viewRow);
            setViewRow(null);
          }
        }}
        onDelete={() => {
          if (viewRow) {
            setDeleteIds([viewRow.id]);
            setViewRow(null);
          }
        }}
      />
      <ImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        columns={table.columns}
        tableId={table.id}
        onImport={(rows) => {
          importRows(table.id, rows);
          toast.success(`${rows.length} registro${rows.length > 1 ? "s" : ""} importado${rows.length > 1 ? "s" : ""}`);
        }}
      />

      <AlertDialog open={Boolean(deleteIds)} onOpenChange={(v) => !v && setDeleteIds(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir {deleteIds?.length === 1 ? "registro" : "registros"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove {deleteIds?.length} item
              {deleteIds && deleteIds.length > 1 ? "s" : ""} desta tabela. Não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteIds) {
                  deleteRows(table.id, deleteIds);
                  setSelected(new Set());
                  toast.success("Excluído");
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar {selected.size} selecionados</DialogTitle>
            <DialogDescription>
              Aplique o mesmo valor a uma coluna em todos os registros selecionados.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Coluna</Label>
              <Select
                value={bulkCol}
                onValueChange={(v) => {
                  setBulkCol(v);
                  setBulkVal(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {table.columns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {bulkCol && (
              <FieldInput
                column={table.columns.find((c) => c.id === bulkCol)!}
                value={bulkVal}
                onChange={setBulkVal}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkEditOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                const col = table.columns.find((c) => c.id === bulkCol);
                if (!col) return;
                const cells = cellsFromUnknown([col], { [col.id]: bulkVal });
                const errors = validateCells([{ ...col, required: false }], cells);
                if (errors[col.id]) {
                  toast.error(errors[col.id]);
                  return;
                }
                bulkPatch(table.id, [...selected], col.id, cells[col.id] ?? null);
                setBulkEditOpen(false);
                setSelected(new Set());
                toast.success("Edição em massa aplicada");
              }}
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
