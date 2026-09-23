import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { c as useWorkspace, n as COLUMN_TYPE_LABELS, o as cn, r as FILTER_OPERATOR_LABELS, s as uid, t as Button } from "./button-Dm1fkKXb.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, d as Label, f as digitsOnly, g as sanitizeText, h as parseNumber, i as AlertDialogContent, m as isLikelyPhone, n as AlertDialogAction, o as AlertDialogFooter, p as isLikelyEmail, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog, u as Input } from "./label-DwrxkgZ-.mjs";
import { A as Download, B as ArrowDown, D as Eye, F as Check, L as ArrowUp, M as ChevronRight, N as ChevronLeft, O as Ellipsis, R as ArrowUpDown, S as LayoutGrid, T as Funnel, _ as Pencil, a as Upload, c as Trash2, g as Plus, h as RefreshCw, j as Copy, m as Rows3, p as Search, t as X, v as Minus, x as List } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { a as Separator2, i as Root2, n as Item2, o as Trigger, r as Portal2, t as Content2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { _ as DialogFooter, a as SheetDescription, c as SheetTitle, d as formatRelative, f as selectTone, g as DialogDescription, h as DialogContent, i as SheetContent, l as formatCell, m as Dialog, o as SheetFooter, p as whatsappHref, r as Sheet, s as SheetHeader, u as formatPhone, v as DialogHeader, y as DialogTitle } from "./router-P6QNUDHT.mjs";
import { t as Badge } from "./badge-DHD0zMl5.mjs";
import { t as TABLE_ICONS } from "./table-icons-BcNkszNX.mjs";
import { a as SelectTrigger, i as SelectItem, n as Select, o as SelectValue, r as SelectContent, t as ScrollArea } from "./scroll-area-D-cR9Qi0.mjs";
import { n as Root2$1, r as Trigger$1, t as List$1 } from "../_libs/radix-ui__react-tabs.mjs";
import { i as Trigger$2, n as Portal, r as Root2$2, t as Content2$1 } from "../_libs/radix-ui__react-popover.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/TableWorkspace-BZlgBUeY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function coerceCell(column, raw) {
	if (raw === null || raw === void 0 || raw === "") return null;
	switch (column.type) {
		case "boolean": {
			if (typeof raw === "boolean") return raw;
			const s = sanitizeText(raw).toLowerCase();
			if ([
				"true",
				"1",
				"sim",
				"yes",
				"on"
			].includes(s)) return true;
			if ([
				"false",
				"0",
				"nao",
				"não",
				"no",
				"off"
			].includes(s)) return false;
			return null;
		}
		case "number":
			if (typeof raw === "number" && Number.isFinite(raw)) return raw;
			return parseNumber(String(raw));
		case "phone": return digitsOnly(String(raw)) || null;
		case "date": {
			const s = sanitizeText(raw);
			if (!s) return null;
			const t = Date.parse(s);
			if (Number.isNaN(t)) return s;
			return s.slice(0, 10);
		}
		default: return sanitizeText(raw) || null;
	}
}
function validateCells(columns, cells) {
	const errors = {};
	let anyFilled = false;
	for (const col of columns) {
		const coerced = coerceCell(col, cells[col.id]);
		const empty = coerced === null || coerced === "" || typeof coerced === "string" && coerced.trim() === "";
		if (!empty) anyFilled = true;
		if (col.required && empty) {
			errors[col.id] = `${col.name} é obrigatório`;
			continue;
		}
		if (empty) continue;
		if (col.type === "number") {
			if (typeof coerced !== "number") errors[col.id] = `${col.name} deve ser numérico`;
			else if (col.id === "idade" && (coerced < 0 || coerced > 120 || !Number.isInteger(coerced))) errors[col.id] = "Idade deve ser um número inteiro entre 0 e 120";
		}
		if (col.type === "phone" && !isLikelyPhone(String(coerced))) errors[col.id] = "WhatsApp inválido. Use DDI + DDD + número (10 a 15 dígitos).";
		if (col.type === "email" && !isLikelyEmail(String(coerced))) errors[col.id] = "E-mail inválido";
		if (col.type === "select" && col.options && !col.options.includes(String(coerced))) errors[col.id] = `Selecione uma opção válida para ${col.name}`;
	}
	if (!anyFilled) errors._form = "Preencha pelo menos um campo para salvar o registro.";
	return errors;
}
function cellsFromUnknown(columns, raw) {
	const out = {};
	for (const col of columns) out[col.id] = coerceCell(col, raw[col.id]);
	return out;
}
var Tabs = Root2$1;
function TabsList({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List$1, {
		className: cn("inline-flex h-10 items-center justify-center rounded-lg bg-secondary p-1 text-muted-foreground", className),
		...props
	});
}
function TabsTrigger({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger$1, {
		className: cn("inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap", "transition-[background-color,color,box-shadow] duration-150", "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-card", "focus-visible:ring-2 focus-visible:ring-ring/70 disabled:opacity-50", className),
		...props
	});
}
var Popover = Root2$2;
var PopoverTrigger = Trigger$2;
function PopoverContent({ className, align = "center", sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$1, {
		align,
		sideOffset,
		className: cn("z-50 w-72 rounded-lg bg-popover p-3 text-popover-foreground shadow-overlay outline-none", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
		...props
	}) });
}
function Checkbox({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
		"data-slot": "checkbox",
		className: cn("peer size-4 shrink-0 rounded-xs shadow-card outline-none", "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-none", "focus-visible:ring-2 focus-visible:ring-ring/70", "disabled:cursor-not-allowed disabled:opacity-50", "relative after:absolute after:top-1/2 after:left-1/2 after:size-10 after:-translate-x-1/2 after:-translate-y-1/2", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
			className: "flex items-center justify-center text-current",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
				className: "size-3",
				strokeWidth: 3
			})
		})
	});
}
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
function DropdownMenuContent({ className, sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		sideOffset,
		className: cn("z-50 min-w-44 overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-overlay", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
		...props
	}) });
}
function DropdownMenuItem({ className, inset, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
		className: cn("relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none", "transition-[background-color,color] duration-150 focus:bg-accent focus:text-accent-foreground", "data-disabled:pointer-events-none data-disabled:opacity-40", inset && "pl-8", variant === "destructive" && "text-destructive focus:text-destructive", className),
		...props
	});
}
function DropdownMenuSeparator({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
		className: cn("-mx-1 my-1 h-px bg-border", className),
		...props
	});
}
function CellDisplay({ column, value, compact }) {
	if (value === null || value === void 0 || value === "") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-muted-foreground",
		children: "—"
	});
	if (column.type === "boolean") return value ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1 text-success",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }), " Sim"]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1 text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-3.5" }), " Não"]
	});
	if (column.type === "select") {
		const opt = String(value);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			tone: selectTone(opt, column.options),
			children: opt
		});
	}
	if (column.type === "phone") {
		const raw = String(value);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			href: whatsappHref(raw),
			target: "_blank",
			rel: "noreferrer",
			onClick: (e) => e.stopPropagation(),
			className: "font-mono text-xs text-primary hover:underline",
			children: formatPhone(raw)
		});
	}
	if (column.id === "identidade" || column.id === "nick" || column.type === "number") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("font-mono text-xs tabular-nums", compact ? "text-muted-foreground" : "text-foreground"),
		children: formatCell(column, value)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "truncate",
		children: formatCell(column, value)
	});
}
function cellToString(value) {
	if (value === null || value === void 0) return "";
	if (typeof value === "boolean") return value ? "true" : "false";
	return String(value);
}
function cellToNumber(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim()) {
		const n = Number(value.replace(",", "."));
		return Number.isFinite(n) ? n : null;
	}
	return null;
}
function rowMatchesSearch(row, columns, query) {
	const q = query.trim().toLowerCase();
	if (!q) return true;
	return columns.some((col) => cellToString(row.cells[col.id]).toLowerCase().includes(q));
}
function applyOperator(value, operator, raw) {
	const text = cellToString(value);
	const needle = raw.trim();
	switch (operator) {
		case "empty": return text === "";
		case "notEmpty": return text !== "";
		case "eq": return text.toLowerCase() === needle.toLowerCase();
		case "neq": return text.toLowerCase() !== needle.toLowerCase();
		case "contains": return text.toLowerCase().includes(needle.toLowerCase());
		case "startsWith": return text.toLowerCase().startsWith(needle.toLowerCase());
		case "endsWith": return text.toLowerCase().endsWith(needle.toLowerCase());
		case "gt":
		case "gte":
		case "lt":
		case "lte": {
			const a = cellToNumber(value);
			const b = Number(needle.replace(",", "."));
			if (a === null || !Number.isFinite(b)) return false;
			if (operator === "gt") return a > b;
			if (operator === "gte") return a >= b;
			if (operator === "lt") return a < b;
			return a <= b;
		}
		default: return true;
	}
}
function applyFilters(rows, columns, search, rules) {
	return rows.filter((row) => {
		if (!rowMatchesSearch(row, columns, search)) return false;
		return rules.every((rule) => {
			if (!rule.columnId) return true;
			if (!["empty", "notEmpty"].includes(rule.operator) && !rule.value.trim()) return true;
			return applyOperator(row.cells[rule.columnId], rule.operator, rule.value);
		});
	});
}
function compareCells(a, b, type) {
	if (a === null || a === void 0 || a === "") return 1;
	if (b === null || b === void 0 || b === "") return -1;
	if (type === "number") return Number(a) - Number(b);
	if (type === "boolean") return Number(Boolean(a)) - Number(Boolean(b));
	return cellToString(a).localeCompare(cellToString(b), "pt-BR", {
		sensitivity: "base",
		numeric: true
	});
}
function DataTable({ columns, rows, selected, onToggle, onToggleAll, sortKey, sortDir, onSort, onOpen, onEdit, onDelete }) {
	const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
	const someSelected = rows.some((r) => selected.has(r.id)) && !allSelected;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-hidden rounded-xl bg-card shadow-card",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[720px] border-collapse text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-10 px-3 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								checked: allSelected ? true : someSelected ? "indeterminate" : false,
								onCheckedChange: onToggleAll,
								"aria-label": "Selecionar todos"
							})
						}),
						columns.map((col) => {
							const active = sortKey === col.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-3 font-medium text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "inline-flex items-center gap-1.5 transition-[color] duration-150 hover:text-foreground",
									onClick: () => onSort(col.id),
									children: [col.name, active ? sortDir === "asc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-3.5 text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-3.5 text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "size-3.5 opacity-40" })]
								})
							}, col.id);
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-12 px-3 py-3 text-right font-medium text-muted-foreground",
							children: "Ações"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => {
					const isOn = selected.has(row.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						onClick: () => onOpen(row),
						className: cn("cursor-pointer border-b border-border/70 last:border-0", "transition-[background-color] duration-150 hover:bg-accent/60", isOn && "bg-primary/5"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2.5",
								onClick: (e) => e.stopPropagation(),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: isOn,
									onCheckedChange: () => onToggle(row.id),
									"aria-label": "Selecionar linha"
								})
							}),
							columns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "max-w-48 truncate px-3 py-2.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellDisplay, {
									column: col,
									value: row.cells[col.id] ?? null
								})
							}, col.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1.5 text-right",
								onClick: (e) => e.stopPropagation(),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon-sm",
										"aria-label": "Ações",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {})
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
									align: "end",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onSelect: () => onOpen(row),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" }), " Visualizar"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onSelect: () => onEdit(row),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" }), " Editar"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											variant: "destructive",
											onSelect: () => onDelete(row),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), " Excluir"]
										})
									]
								})] })
							})
						]
					}, row.id);
				}) })]
			})
		})
	});
}
function sortRows(rows, columns, sortKey, sortDir) {
	if (!sortKey) return rows;
	const col = columns.find((c) => c.id === sortKey);
	if (!col) return rows;
	const copy = [...rows];
	copy.sort((a, b) => {
		const r = compareCells(a.cells[sortKey] ?? null, b.cells[sortKey] ?? null, col.type);
		return sortDir === "asc" ? r : -r;
	});
	return copy;
}
function ListView({ columns, rows, selected, onToggle, onOpen }) {
	const primary = columns[0];
	const rest = columns.slice(1, 4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2",
		children: rows.map((row) => {
			const on = selected.has(row.id);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onOpen(row),
				className: cn("flex w-full items-start gap-3 rounded-xl bg-card p-4 text-left shadow-card", "transition-[box-shadow,background-color] duration-150 hover:shadow-card-hover", on && "bg-primary/5"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					onClick: (e) => {
						e.stopPropagation();
						onToggle(row.id);
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, { checked: on })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate text-sm font-medium",
						children: primary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellDisplay, {
							column: primary,
							value: row.cells[primary.id] ?? null
						}) : row.id
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-2 grid gap-1 sm:grid-cols-3",
						children: rest.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-[10px] font-medium tracking-wide text-muted-foreground uppercase",
								children: col.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-xs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellDisplay, {
									column: col,
									value: row.cells[col.id] ?? null,
									compact: true
								})
							})]
						}, col.id))
					})]
				})]
			}, row.id);
		})
	});
}
function KanbanView({ columns, rows, groupColumnId, onOpen, onMove }) {
	const group = columns.find((c) => c.id === groupColumnId);
	const options = group?.options ?? [];
	const primary = columns[0];
	const extras = columns.filter((c) => c.id !== groupColumnId).slice(1, 3);
	const buckets = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const opt of options) map.set(opt, []);
		map.set("__none", []);
		for (const row of rows) {
			const v = String(row.cells[groupColumnId] ?? "");
			if (map.has(v)) map.get(v).push(row);
			else map.get("__none").push(row);
		}
		return map;
	}, [
		rows,
		options,
		groupColumnId
	]);
	if (!group || group.type !== "select" || options.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-card p-8 text-center shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium",
			children: "Kanban precisa de uma coluna de seleção"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: "Adicione uma coluna do tipo Seleção (Status, Gravidade, etc.) para agrupar os cards."
		})]
	});
	const cols = [...options, ...buckets.get("__none")?.length ? ["__none"] : []];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-3 overflow-x-auto pb-2",
		children: cols.map((opt) => {
			const list = buckets.get(opt) ?? [];
			const label = opt === "__none" ? "Sem status" : opt;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex w-72 shrink-0 flex-col rounded-xl bg-card p-3 shadow-card",
				onDragOver: (e) => {
					e.preventDefault();
				},
				onDrop: (e) => {
					e.preventDefault();
					const id = e.dataTransfer.getData("text/row-id");
					if (id && opt !== "__none") onMove(id, opt);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between px-1",
					children: [opt === "__none" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-medium text-muted-foreground",
						children: label
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: selectTone(opt, options),
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs tabular-nums text-muted-foreground",
						children: list.length
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-2",
					children: list.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						draggable: true,
						onDragStart: (e) => {
							e.dataTransfer.setData("text/row-id", row.id);
							e.dataTransfer.effectAllowed = "move";
						},
						onClick: () => onOpen(row),
						className: cn("rounded-lg bg-secondary p-3 text-left shadow-card", "transition-[box-shadow,transform] duration-150 hover:shadow-card-hover active:scale-[0.99]"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-medium",
							children: primary ? String(row.cells[primary.id] ?? "—") : row.id
						}), extras.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 truncate text-xs text-muted-foreground",
							children: [
								col.name,
								":",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellDisplay, {
									column: col,
									value: row.cells[col.id] ?? null,
									compact: true
								})
							]
						}, col.id))]
					}, row.id))
				})]
			}, opt);
		})
	});
}
function Switch({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
		className: cn("peer inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full bg-secondary shadow-card transition-[background-color] duration-150 ease-out data-[state=checked]:bg-primary focus-visible:ring-2 focus-visible:ring-ring/70 disabled:cursor-not-allowed disabled:opacity-50", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: "pointer-events-none block size-5 translate-x-0.5 rounded-full bg-foreground shadow-sm transition-transform duration-150 ease-out data-[state=checked]:translate-x-4 data-[state=checked]:bg-primary-foreground" })
	});
}
function FieldInput({ column, value, onChange, error, autoFocus }) {
	const str = value === null || value === void 0 ? "" : String(value);
	const invalid = Boolean(error);
	if (column.type === "boolean") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between rounded-lg bg-secondary px-3 py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor: column.id,
			children: column.name
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			id: column.id,
			checked: Boolean(value),
			onCheckedChange: (c) => onChange(c)
		})]
	});
	if (column.type === "select") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
				htmlFor: column.id,
				children: [column.name, column.required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-destructive",
					children: " *"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: str || "__empty",
				onValueChange: (v) => onChange(v === "__empty" ? null : v),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					id: column.id,
					"aria-invalid": invalid,
					className: cn(invalid && "ring-2 ring-destructive/70"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Selecionar..." })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "__empty",
					children: "—"
				}), (column.options ?? []).map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: opt,
					children: opt
				}, opt))] })]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-destructive",
				children: error
			})
		]
	});
	const typeAttr = column.type === "number" ? "number" : column.type === "date" ? "date" : column.type === "email" ? "email" : column.type === "phone" ? "tel" : "text";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
				htmlFor: column.id,
				children: [column.name, column.required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-destructive",
					children: " *"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id: column.id,
				type: typeAttr,
				autoFocus,
				value: str,
				"aria-invalid": invalid,
				inputMode: column.type === "number" || column.type === "phone" ? "numeric" : void 0,
				onChange: (e) => onChange(e.target.value === "" ? null : e.target.value),
				placeholder: placeholderFor(column)
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-destructive",
				children: error
			})
		]
	});
}
function placeholderFor(column) {
	switch (column.type) {
		case "phone": return "559481046789";
		case "email": return "nome@email.com";
		case "number": return "0";
		default: return column.name;
	}
}
function RowModal({ open, onOpenChange, columns, row, title, submitLabel, onSubmit }) {
	const [values, setValues] = (0, import_react.useState)({});
	const [errors, setErrors] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const next = {};
		for (const c of columns) next[c.id] = row?.cells[c.id] ?? null;
		setValues(next);
		setErrors({});
	}, [
		open,
		row,
		columns
	]);
	function handleSave() {
		const coerced = cellsFromUnknown(columns, values);
		const nextErrors = validateCells(columns, coerced);
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length) return;
		onSubmit(coerced);
		onOpenChange(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90dvh] overflow-hidden p-0 sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-6 pb-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Campos obrigatórios estão marcados. HTML e scripts são removidos automaticamente." })] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "max-h-[min(60dvh,28rem)] px-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 py-4",
						children: [errors._form && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive",
							children: errors._form
						}), columns.map((col, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldInput, {
							column: col,
							value: values[col.id] ?? null,
							error: errors[col.id],
							autoFocus: i === 0,
							onChange: (v) => {
								setValues((s) => ({
									...s,
									[col.id]: v
								}));
								setErrors((s) => {
									const n = { ...s };
									delete n[col.id];
									delete n._form;
									return n;
								});
							}
						}, col.id))]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "border-t border-border p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => onOpenChange(false),
						children: "Cancelar"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: handleSave,
						children: submitLabel
					})]
				})
			]
		})
	});
}
function RowDrawer({ open, onOpenChange, columns, row, onEdit, onDelete }) {
	const title = row ? String(row.cells[columns[0]?.id] ?? "Registro") : "Registro";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			className: "flex flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
					className: "truncate",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: row ? `Atualizado ${formatRelative(row.updatedAt)}` : "Detalhes do registro" })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 space-y-3 overflow-y-auto px-6",
					children: row && columns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-secondary/70 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-muted-foreground",
							children: col.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellDisplay, {
								column: col,
								value: row.cells[col.id] ?? null
							})
						})]
					}, col.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetFooter, {
					className: "justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: () => onOpenChange(false),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {}), " Fechar"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "destructive",
							onClick: onDelete,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}), " Excluir"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: onEdit,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {}), " Editar"]
						})]
					})]
				})
			]
		})
	});
}
var OPS = [
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
	"notEmpty"
];
function FilterPanel({ columns, rules, onChange }) {
	function update(id, patch) {
		onChange(rules.map((r) => r.id === id ? {
			...r,
			...patch
		} : r));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			rules.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Combine regras: idade maior que 18, nome contém Lucas, nick começa com x."
			}),
			rules.map((rule) => {
				const needsValue = !["empty", "notEmpty"].includes(rule.operator);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: rule.columnId || "__none",
							onValueChange: (v) => update(rule.id, { columnId: v === "__none" ? "" : v }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-9",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Coluna" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: c.id,
								children: c.name
							}, c.id)) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: rule.operator,
							onValueChange: (v) => update(rule.id, { operator: v }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-9",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: OPS.map((op) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: op,
								children: FILTER_OPERATOR_LABELS[op]
							}, op)) })]
						}),
						needsValue ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "h-9",
							value: rule.value,
							onChange: (e) => update(rule.id, { value: e.target.value }),
							placeholder: "Valor"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							"aria-label": "Remover filtro",
							onClick: () => onChange(rules.filter((r) => r.id !== rule.id)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})
					]
				}, rule.id);
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: () => onChange([...rules, {
					id: uid("flt"),
					columnId: columns[0]?.id ?? "",
					operator: "contains",
					value: ""
				}]),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), " Adicionar filtro"]
			})
		]
	});
}
var DELIMITERS = [
	",",
	";",
	"	",
	"|"
];
function detectDelimiter(text) {
	const first = text.split(/\r?\n/).find((l) => l.trim()) ?? "";
	let best = ",";
	let bestCount = -1;
	for (const d of DELIMITERS) {
		const count = splitCsvLine(first, d).length;
		if (count > bestCount) {
			bestCount = count;
			best = d;
		}
	}
	return best;
}
function splitCsvLine(line, delimiter) {
	const out = [];
	let cur = "";
	let inQuotes = false;
	for (let i = 0; i < line.length; i += 1) {
		const ch = line[i];
		if (inQuotes) {
			if (ch === "\"") {
				if (line[i + 1] === "\"") {
					cur += "\"";
					i += 1;
				} else inQuotes = false;
			} else cur += ch;
		} else if (ch === "\"") inQuotes = true;
		else if (ch === delimiter) {
			out.push(cur);
			cur = "";
		} else cur += ch;
	}
	out.push(cur);
	return out;
}
function parseDelimited(text, delimiter) {
	const lines = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
	const rows = [];
	let buf = "";
	let quotes = 0;
	for (const line of lines) {
		buf = buf ? `${buf}\n${line}` : line;
		quotes += (line.match(/"/g) ?? []).length;
		if (quotes % 2 === 0) {
			if (buf.trim().length > 0) rows.push(splitCsvLine(buf, delimiter));
			buf = "";
			quotes = 0;
		}
	}
	if (buf.trim()) rows.push(splitCsvLine(buf, delimiter));
	return rows;
}
function slug(name) {
	return sanitizeText(name).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "");
}
function mapHeadersToColumns(headers, columns) {
	return headers.map((h) => {
		const s = slug(h);
		const exact = columns.find((c) => slug(c.name) === s || slug(c.id) === s);
		if (exact) return exact.id;
		if (s === "id" || s === "identidade") {
			const idCol = columns.find((c) => c.id === "identidade" || slug(c.name) === "id");
			if (idCol) return idCol.id;
		}
		return null;
	});
}
function previewImport(text, columns) {
	const delimiter = detectDelimiter(text);
	const table = parseDelimited(text, delimiter);
	const headers = (table[0] ?? []).map((h) => h.trim());
	const body = table.slice(1);
	return {
		delimiter,
		headers,
		mapping: mapHeadersToColumns(headers, columns),
		sample: body.slice(0, 8),
		total: body.length
	};
}
function rowsFromImport(text, delimiter, columns, mapping, tableId) {
	const body = parseDelimited(text, delimiter).slice(1);
	const now = Date.now();
	return body.map((line) => {
		const raw = {};
		mapping.forEach((colId, i) => {
			if (!colId) return;
			raw[colId] = line[i] ?? "";
		});
		return {
			id: uid("row"),
			tableId,
			cells: cellsFromUnknown(columns, raw),
			createdAt: now,
			updatedAt: now
		};
	}).filter((r) => Object.values(r.cells).some((v) => v !== null && v !== ""));
}
function escapeField(value, delimiter) {
	if (value.includes("\"") || value.includes("\n") || value.includes("\r") || value.includes(delimiter)) return `"${value.replace(/"/g, "\"\"")}"`;
	return value;
}
function toCsv(columns, rows, delimiter = ",") {
	return [columns.map((c) => escapeField(c.name, delimiter)).join(delimiter), ...rows.map((row) => columns.map((c) => {
		const v = row.cells[c.id];
		if (v === null || v === void 0) return "";
		if (typeof v === "boolean") return v ? "true" : "false";
		return escapeField(String(v), delimiter);
	}).join(delimiter))].join("\r\n");
}
function downloadCsv(filename, csv) {
	const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
function slugFilename(name) {
	return sanitizeText(name).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "tabela";
}
var DELIM_LABEL = {
	",": "Vírgula",
	";": "Ponto e vírgula",
	"	": "TAB",
	"|": "Pipe |"
};
function ImportModal({ open, onOpenChange, columns, tableId, onImport }) {
	const [fileName, setFileName] = (0, import_react.useState)("");
	const [text, setText] = (0, import_react.useState)("");
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	function reset() {
		setFileName("");
		setText("");
		setPreview(null);
		setError("");
	}
	async function onFile(file) {
		if (!file) return;
		const raw = await file.text();
		setFileName(file.name);
		setText(raw);
		if (!raw.trim()) {
			setError("Arquivo vazio.");
			setPreview(null);
			return;
		}
		setError("");
		setPreview(previewImport(raw, columns));
	}
	function setDelimiter(d) {
		if (!text) return;
		const table = parseDelimited(text, d);
		const headers = (table[0] ?? []).map((h) => h.trim());
		const body = table.slice(1);
		setPreview({
			delimiter: d,
			headers,
			mapping: mapHeadersToColumns(headers, columns),
			sample: body.slice(0, 8),
			total: body.length
		});
	}
	function setMap(index, colId) {
		if (!preview) return;
		const mapping = [...preview.mapping];
		mapping[index] = colId;
		setPreview({
			...preview,
			mapping
		});
	}
	function confirm() {
		if (!preview || !text) return;
		const rows = rowsFromImport(text, preview.delimiter, columns, preview.mapping, tableId);
		if (!rows.length) {
			setError("Nenhuma linha válida para importar.");
			return;
		}
		onImport(rows);
		reset();
		onOpenChange(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (v) => {
			if (!v) reset();
			onOpenChange(v);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90dvh] overflow-hidden p-0 sm:max-w-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-6 pb-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Importar CSV / TXT" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Detectamos vírgula, ponto e vírgula, TAB ou pipe. Confira o mapeamento antes de importar." })] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 px-6 py-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex h-24 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border bg-secondary/50 text-sm text-muted-foreground transition-[border-color,background-color] duration-150 hover:bg-secondary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: ".csv,.txt,text/csv,text/plain",
								className: "hidden",
								onChange: (e) => void onFile(e.target.files?.[0])
							}), fileName ? fileName : "Selecionar arquivo CSV ou TXT"]
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-destructive",
							children: error
						}),
						preview && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Delimitador" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: preview.delimiter === "	" ? "tab" : preview.delimiter,
										onValueChange: (v) => setDelimiter(v === "tab" ? "	" : v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Object.entries(DELIM_LABEL).map(([k, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: k === "	" ? "tab" : k,
											children: label
										}, k)) })]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "self-end text-sm text-muted-foreground",
									children: [
										preview.total,
										" linha",
										preview.total === 1 ? "" : "s",
										" detectada",
										preview.total === 1 ? "" : "s"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Mapear colunas" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid gap-2",
									children: preview.headers.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-sm",
											children: h || `Coluna ${i + 1}`
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: preview.mapping[i] ?? "__skip",
											onValueChange: (v) => setMap(i, v === "__skip" ? null : v),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-9",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Ignorar" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "__skip",
												children: "Ignorar"
											}), columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
												value: c.id,
												children: [
													c.name,
													" (",
													COLUMN_TYPE_LABELS[c.type],
													")"
												]
											}, c.id))] })]
										})]
									}, `${h}-${i}`))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Prévia" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
								className: "mt-2 max-h-48 rounded-lg bg-secondary/60",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-left text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: preview.headers.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-2 py-1.5 font-medium text-muted-foreground",
										children: h
									}, i)) }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: preview.sample.map((line, ri) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
										className: "border-t border-border",
										children: preview.headers.map((_, ci) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "max-w-32 truncate px-2 py-1.5",
											children: line[ci] ?? ""
										}, ci))
									}, ri)) })]
								})
							})] })
						] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "border-t border-border p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => {
							reset();
							onOpenChange(false);
						},
						children: "Cancelar"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: confirm,
						disabled: !preview,
						children: [
							"Importar ",
							preview ? preview.total : 0,
							" linha",
							preview?.total === 1 ? "" : "s"
						]
					})]
				})
			]
		})
	});
}
function BulkActionBar({ count, onClear, onDelete, onExport, onDuplicate, onEdit }) {
	if (count === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto flex items-center gap-2 rounded-xl bg-card/95 px-3 py-2 shadow-overlay backdrop-blur-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "px-2 text-sm font-medium tabular-nums",
					children: [
						count,
						" selecionado",
						count > 1 ? "s" : ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: onEdit,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {}), " Editar"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: onDuplicate,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), " Duplicar"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: onExport,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), " Exportar"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					className: "text-destructive",
					onClick: onDelete,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}), " Excluir"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					"aria-label": "Limpar seleção",
					onClick: onClear,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
				})
			]
		})
	});
}
function useMediaQuery(query) {
	const [matches, setMatches] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const mq = window.matchMedia(query);
		const onChange = () => setMatches(mq.matches);
		onChange();
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, [query]);
	return matches;
}
var PAGE_SIZE = 10;
function TableWorkspace({ tableId, addLabel }) {
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
	const [search, setSearch] = (0, import_react.useState)("");
	const [filters, setFilters] = (0, import_react.useState)([]);
	const [sortKey, setSortKey] = (0, import_react.useState)(null);
	const [sortDir, setSortDir] = (0, import_react.useState)("asc");
	const [page, setPage] = (0, import_react.useState)(0);
	const [selected, setSelected] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [addOpen, setAddOpen] = (0, import_react.useState)(false);
	const [editRow, setEditRow] = (0, import_react.useState)(null);
	const [viewRow, setViewRow] = (0, import_react.useState)(null);
	const [importOpen, setImportOpen] = (0, import_react.useState)(false);
	const [deleteIds, setDeleteIds] = (0, import_react.useState)(null);
	const [bulkEditOpen, setBulkEditOpen] = (0, import_react.useState)(false);
	const [bulkCol, setBulkCol] = (0, import_react.useState)("");
	const [bulkVal, setBulkVal] = (0, import_react.useState)(null);
	const [syncing, setSyncing] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setPage(0);
		setSelected(/* @__PURE__ */ new Set());
	}, [
		tableId,
		search,
		filters,
		sortKey,
		sortDir
	]);
	const filtered = (0, import_react.useMemo)(() => {
		if (!table) return [];
		return applyFilters(allRows, table.columns, search, filters);
	}, [
		allRows,
		table,
		search,
		filters
	]);
	const sorted = (0, import_react.useMemo)(() => {
		if (!table) return [];
		return sortRows(filtered, table.columns, sortKey, sortDir);
	}, [
		filtered,
		table,
		sortKey,
		sortDir
	]);
	const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
	const safePage = Math.min(page, pageCount - 1);
	const paged = sorted.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
	if (!table) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-card p-10 text-center shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium",
			children: "Tabela não encontrada"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: "Ela pode ter sido removida. Volte para Tabelas e crie outra."
		})]
	});
	const Icon = TABLE_ICONS[table.icon];
	const createLabel = addLabel ?? `Adicionar em ${table.name}`;
	const kanbanCol = table.kanbanColumnId ?? table.columns.find((c) => c.type === "select")?.id ?? "";
	function toggle(id) {
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
	function handleSort(id) {
		if (sortKey === id) setSortDir((d) => d === "asc" ? "desc" : "asc");
		else {
			setSortKey(id);
			setSortDir("asc");
		}
	}
	function exportRows(rows, suffix = "") {
		if (!table) return;
		const csv = toCsv(table.columns, rows);
		const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
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
	const effectiveView = isMobile && view === "grid" ? "list" : view;
	const filterCount = filters.filter((f) => f.columnId).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative space-y-4 pb-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-10 place-items-center rounded-lg bg-primary/15 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "truncate text-xl font-semibold tracking-tight",
							children: table.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm text-muted-foreground",
							children: table.description || `${allRows.length} registros`
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => void sync(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("size-4", syncing && "animate-spin") }), "Sincronizar"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setImportOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {}), " Importar"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => exportRows(sorted),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), " Exportar"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => setAddOpen(true),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}),
								" ",
								createLabel
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 lg:flex-row lg:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "pl-9",
						value: search,
						onChange: (e) => setSearch(e.target.value),
						placeholder: `Pesquisar ${table.name.toLowerCase()}...`
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, {}),
								" Filtros",
								filterCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "primary",
									className: "ml-1",
									children: filterCount
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
						className: "w-[min(100vw-2rem,36rem)]",
						align: "end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterPanel, {
							columns: table.columns,
							rules: filters,
							onChange: setFilters
						})
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
						value: view,
						onValueChange: (v) => setView(table.id, v),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "grid",
								className: "hidden md:inline-flex",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "size-3.5" }), " Grid"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "list",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "size-3.5" }), " Lista"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "kanban",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rows3, { className: "size-3.5" }), " Kanban"]
							})
						] })
					})]
				})]
			}),
			sorted.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-card px-6 py-16 text-center shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Nenhum registro encontrado"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: allRows.length === 0 ? "Comece adicionando um registro ou importe um CSV." : "Ajuste a busca ou os filtros para ver resultados."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-4",
						onClick: () => setAddOpen(true),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}),
							" ",
							createLabel
						]
					})
				]
			}) : effectiveView === "kanban" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanView, {
				columns: table.columns,
				rows: sorted,
				groupColumnId: kanbanCol,
				onOpen: setViewRow,
				onMove: (rowId, value) => {
					updateRow(table.id, rowId, { [kanbanCol]: value });
					toast.success("Status atualizado");
				}
			}) : effectiveView === "list" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListView, {
				columns: table.columns,
				rows: paged,
				selected,
				onToggle: toggle,
				onOpen: setViewRow
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				columns: table.columns,
				rows: paged,
				selected,
				onToggle: toggle,
				onToggleAll: toggleAll,
				sortKey,
				sortDir,
				onSort: handleSort,
				onOpen: setViewRow,
				onEdit: setEditRow,
				onDelete: (r) => setDeleteIds([r.id])
			}),
			effectiveView !== "kanban" && sorted.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "tabular-nums",
					children: [
						"Mostrando ",
						safePage * PAGE_SIZE + 1,
						"–",
						Math.min(sorted.length, safePage * PAGE_SIZE + PAGE_SIZE),
						" de ",
						sorted.length
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							disabled: safePage === 0,
							onClick: () => setPage((p) => Math.max(0, p - 1)),
							"aria-label": "Página anterior",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "px-2 tabular-nums",
							children: [
								safePage + 1,
								"/",
								pageCount
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							disabled: safePage >= pageCount - 1,
							onClick: () => setPage((p) => p + 1),
							"aria-label": "Próxima página",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BulkActionBar, {
				count: selected.size,
				onClear: () => setSelected(/* @__PURE__ */ new Set()),
				onDelete: () => setDeleteIds([...selected]),
				onExport: () => {
					exportRows(allRows.filter((r) => selected.has(r.id)), "-selecao");
				},
				onDuplicate: () => {
					duplicateRows(table.id, [...selected]);
					toast.success("Registros duplicados");
					setSelected(/* @__PURE__ */ new Set());
				},
				onEdit: () => {
					setBulkCol(table.columns[0]?.id ?? "");
					setBulkVal(null);
					setBulkEditOpen(true);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowModal, {
				open: addOpen,
				onOpenChange: setAddOpen,
				columns: table.columns,
				title: createLabel,
				submitLabel: createLabel,
				onSubmit: (cells) => {
					addRow(table.id, cells);
					toast.success("Registro adicionado");
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowModal, {
				open: Boolean(editRow),
				onOpenChange: (v) => {
					if (!v) setEditRow(null);
				},
				columns: table.columns,
				row: editRow,
				title: "Editar registro",
				submitLabel: "Salvar alterações",
				onSubmit: (cells) => {
					if (!editRow) return;
					updateRow(table.id, editRow.id, cells);
					toast.success("Alterações salvas");
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowDrawer, {
				open: Boolean(viewRow),
				onOpenChange: (v) => {
					if (!v) setViewRow(null);
				},
				columns: table.columns,
				row: viewRow,
				onEdit: () => {
					if (viewRow) {
						setEditRow(viewRow);
						setViewRow(null);
					}
				},
				onDelete: () => {
					if (viewRow) {
						setDeleteIds([viewRow.id]);
						setViewRow(null);
					}
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportModal, {
				open: importOpen,
				onOpenChange: setImportOpen,
				columns: table.columns,
				tableId: table.id,
				onImport: (rows) => {
					importRows(table.id, rows);
					toast.success(`${rows.length} registro${rows.length > 1 ? "s" : ""} importado${rows.length > 1 ? "s" : ""}`);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: Boolean(deleteIds),
				onOpenChange: (v) => !v && setDeleteIds(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
					"Excluir ",
					deleteIds?.length === 1 ? "registro" : "registros",
					"?"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
					"Esta ação remove ",
					deleteIds?.length,
					" item",
					deleteIds && deleteIds.length > 1 ? "s" : "",
					" desta tabela. Não pode ser desfeita."
				] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancelar" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					onClick: () => {
						if (deleteIds) {
							deleteRows(table.id, deleteIds);
							setSelected(/* @__PURE__ */ new Set());
							toast.success("Excluído");
						}
					},
					children: "Excluir"
				})] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: bulkEditOpen,
				onOpenChange: setBulkEditOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: [
						"Editar ",
						selected.size,
						" selecionados"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Aplique o mesmo valor a uma coluna em todos os registros selecionados." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Coluna" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: bulkCol,
								onValueChange: (v) => {
									setBulkCol(v);
									setBulkVal(null);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: table.columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: c.id,
									children: c.name
								}, c.id)) })]
							})]
						}), bulkCol && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldInput, {
							column: table.columns.find((c) => c.id === bulkCol),
							value: bulkVal,
							onChange: setBulkVal
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setBulkEditOpen(false),
						children: "Cancelar"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => {
							const col = table.columns.find((c) => c.id === bulkCol);
							if (!col) return;
							const cells = cellsFromUnknown([col], { [col.id]: bulkVal });
							const errors = validateCells([{
								...col,
								required: false
							}], cells);
							if (errors[col.id]) {
								toast.error(errors[col.id]);
								return;
							}
							bulkPatch(table.id, [...selected], col.id, cells[col.id] ?? null);
							setBulkEditOpen(false);
							setSelected(/* @__PURE__ */ new Set());
							toast.success("Edição em massa aplicada");
						},
						children: "Aplicar"
					})] })
				] })
			})
		]
	});
}
//#endregion
export { TableWorkspace as t };
