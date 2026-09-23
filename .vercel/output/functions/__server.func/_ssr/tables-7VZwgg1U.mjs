import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { c as useWorkspace, n as COLUMN_TYPE_LABELS, o as cn, s as uid, t as Button } from "./button-Dm1fkKXb.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, d as Label, g as sanitizeText, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog, u as Input } from "./label-DwrxkgZ-.mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as Trash2, g as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as DialogFooter, d as formatRelative, g as DialogDescription, h as DialogContent, m as Dialog, v as DialogHeader, y as DialogTitle } from "./router-P6QNUDHT.mjs";
import { n as TABLE_ICON_OPTIONS, t as TABLE_ICONS } from "./table-icons-BcNkszNX.mjs";
import { a as SelectTrigger, i as SelectItem, n as Select, o as SelectValue, r as SelectContent, t as ScrollArea } from "./scroll-area-D-cR9Qi0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tables-7VZwgg1U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		"data-slot": "textarea",
		className: cn("flex min-h-24 w-full rounded-md bg-secondary px-3 py-2 text-sm text-foreground shadow-card outline-none placeholder:text-muted-foreground", "transition-[box-shadow] duration-150 ease-out focus-visible:shadow-card-hover focus-visible:ring-2 focus-visible:ring-ring/60", "disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
var TYPES = Object.keys(COLUMN_TYPE_LABELS);
function emptyCol() {
	return {
		id: uid("col"),
		name: "Nome",
		type: "text",
		required: true
	};
}
function CreateTableModal({ open, onOpenChange, onCreate }) {
	const [name, setName] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [icon, setIcon] = (0, import_react.useState)("table");
	const [columns, setColumns] = (0, import_react.useState)([emptyCol()]);
	const [error, setError] = (0, import_react.useState)("");
	function reset() {
		setName("");
		setDescription("");
		setIcon("table");
		setColumns([emptyCol()]);
		setError("");
	}
	function submit() {
		const n = sanitizeText(name);
		if (!n) {
			setError("Informe o nome da tabela.");
			return;
		}
		const cols = columns.map((c) => ({
			...c,
			name: sanitizeText(c.name),
			options: c.type === "select" ? (c.options ?? []).map((o) => sanitizeText(o)).filter(Boolean) : void 0
		})).filter((c) => c.name);
		if (!cols.length) {
			setError("Adicione pelo menos uma coluna.");
			return;
		}
		const selectMissing = cols.find((c) => c.type === "select" && !c.options?.length);
		if (selectMissing) {
			setError(`A coluna ${selectMissing.name} precisa de opções (separadas por vírgula).`);
			return;
		}
		onCreate({
			name: n,
			description: sanitizeText(description),
			icon,
			columns: cols
		});
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
			className: "max-h-[90dvh] overflow-hidden p-0 sm:max-w-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-6 pb-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Nova tabela" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Defina nome, descrição e as colunas. Cada tabela tem suas próprias linhas." })] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "max-h-[min(60dvh,32rem)] px-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 py-4",
						children: [
							error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive",
								children: error
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "tbl-name",
									children: "Nome da tabela"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "tbl-name",
									value: name,
									onChange: (e) => setName(e.target.value),
									placeholder: "Ex.: Recrutamentos"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "tbl-desc",
									children: "Descrição"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "tbl-desc",
									value: description,
									onChange: (e) => setDescription(e.target.value),
									placeholder: "Para que serve esta tabela"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Ícone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-1.5",
									children: TABLE_ICON_OPTIONS.map((opt) => {
										const Icon = TABLE_ICONS[opt.name];
										const on = icon === opt.name;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											title: opt.label,
											onClick: () => setIcon(opt.name),
											className: `grid size-9 place-items-center rounded-md transition-[background-color,color] duration-150 ${on ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
										}, opt.name);
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Colunas" }),
									columns.map((col, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg bg-secondary/70 p-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-[1fr_8rem_auto] items-center gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: col.name,
														onChange: (e) => setColumns((s) => s.map((c) => c.id === col.id ? {
															...c,
															name: e.target.value
														} : c)),
														placeholder: "Nome da coluna"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: col.type,
														onValueChange: (v) => setColumns((s) => s.map((c) => c.id === col.id ? {
															...c,
															type: v
														} : c)),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
															className: "h-10",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: t,
															children: COLUMN_TYPE_LABELS[t]
														}, t)) })]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														variant: "ghost",
														size: "icon",
														disabled: columns.length === 1,
														"aria-label": "Remover coluna",
														onClick: () => setColumns((s) => s.filter((c) => c.id !== col.id)),
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
													})
												]
											}),
											col.type === "select" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												className: "mt-2",
												placeholder: "Opções, separadas por vírgula",
												value: (col.options ?? []).join(", "),
												onChange: (e) => setColumns((s) => s.map((c) => c.id === col.id ? {
													...c,
													options: e.target.value.split(",").map((x) => x.trim()).filter(Boolean)
												} : c))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "mt-2 flex items-center gap-2 text-xs text-muted-foreground",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "checkbox",
														checked: Boolean(col.required),
														onChange: (e) => setColumns((s) => s.map((c) => c.id === col.id ? {
															...c,
															required: e.target.checked
														} : c))
													}),
													"Obrigatória ",
													i === 0 ? "(primeira coluna)" : ""
												]
											})
										]
									}, col.id)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										onClick: () => setColumns((s) => [...s, {
											id: uid("col"),
											name: "Nova coluna",
											type: "text"
										}]),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), " Coluna"]
									})
								]
							})
						]
					})
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: submit,
						children: "Criar tabela"
					})]
				})
			]
		})
	});
}
function TablesPage() {
	const tables = useWorkspace((s) => s.tables);
	const rows = useWorkspace((s) => s.rows);
	const addTable = useWorkspace((s) => s.addTable);
	const deleteTable = useWorkspace((s) => s.deleteTable);
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [pendingDelete, setPendingDelete] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "stagger-in space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-wide text-primary uppercase",
						children: "Workspace"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 text-2xl font-semibold tracking-tight",
						children: "Tabelas"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-xl text-sm text-muted-foreground",
						children: "Cada tabela tem colunas, tipos e registros próprios. Crie bases para staff, torneios, financeiro e o que a operação precisar."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), " Nova tabela"]
				})]
			}),
			tables.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-card px-6 py-16 text-center shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Nenhuma tabela ainda"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Crie a primeira para começar a organizar dados."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-4",
						onClick: () => setOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), " Nova tabela"]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
				children: tables.map((table) => {
					const Icon = TABLE_ICONS[table.icon];
					const count = rows[table.id]?.length ?? 0;
					const href = table.id === "tbl_members" ? "/members" : `/tables/${table.id}`;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "group relative rounded-xl bg-card p-5 shadow-card transition-[box-shadow] duration-150 hover:shadow-card-hover",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: table.id === "tbl_members" ? "/members" : "/tables/$tableId",
								params: table.id === "tbl_members" ? void 0 : { tableId: table.id },
								className: "block",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid size-10 place-items-center rounded-lg bg-primary/15 text-primary",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-4 text-base font-semibold tracking-tight",
										children: table.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 line-clamp-2 text-sm text-muted-foreground",
										children: table.description || "Sem descrição"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-4 text-xs text-muted-foreground tabular-nums",
										children: [
											count,
											" registro",
											count === 1 ? "" : "s",
											" · ",
											table.columns.length,
											" coluna",
											table.columns.length === 1 ? "" : "s",
											" · ",
											formatRelative(table.updatedAt)
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "absolute top-4 right-4 grid size-8 place-items-center rounded-md text-muted-foreground opacity-100 transition-[background-color,color] duration-150 hover:bg-accent hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100",
								"aria-label": `Excluir ${table.name}`,
								onClick: () => setPendingDelete(table.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: href
							})
						]
					}, table.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateTableModal, {
				open,
				onOpenChange: setOpen,
				onCreate: (input) => {
					const table = addTable(input);
					toast.success(`Tabela ${table.name} criada`);
					navigate({
						to: "/tables/$tableId",
						params: { tableId: table.id }
					});
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: Boolean(pendingDelete),
				onOpenChange: (v) => !v && setPendingDelete(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Excluir tabela?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "Todos os registros desta tabela serão removidos do workspace." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancelar" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					onClick: () => {
						if (pendingDelete) {
							deleteTable(pendingDelete);
							toast.success("Tabela excluída");
						}
					},
					children: "Excluir"
				})] })] })
			})
		]
	});
}
var SplitComponent = TablesPage;
//#endregion
export { SplitComponent as component };
