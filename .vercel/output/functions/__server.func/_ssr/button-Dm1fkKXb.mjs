import "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { I as require_jsx_runtime, j as Slot } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid(prefix = "id") {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
	return `${prefix}_${Math.random().toString(36).slice(2, 12)}`;
}
var COLUMN_TYPE_LABELS = {
	text: "Texto",
	number: "Número",
	date: "Data",
	boolean: "Booleano",
	select: "Seleção",
	phone: "Telefone",
	email: "E-mail"
};
var FILTER_OPERATOR_LABELS = {
	eq: "é igual a",
	neq: "é diferente de",
	contains: "contém",
	startsWith: "começa com",
	endsWith: "termina com",
	gt: "maior que",
	gte: "maior ou igual a",
	lt: "menor que",
	lte: "menor ou igual a",
	empty: "está vazio",
	notEmpty: "não está vazio"
};
var MEMBERS_TABLE_ID = "tbl_members";
var KEY = "nexora.workspace.v1";
var LocalStorageAdapter = class {
	key;
	constructor(key = KEY) {
		this.key = key;
	}
	async load() {
		if (typeof window === "undefined") return null;
		try {
			const raw = window.localStorage.getItem(this.key);
			if (!raw) return null;
			const parsed = JSON.parse(raw);
			if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.tables)) return null;
			return parsed;
		} catch {
			return null;
		}
	}
	async save(data) {
		if (typeof window === "undefined") return;
		try {
			window.localStorage.setItem(this.key, JSON.stringify(data));
		} catch {}
	}
};
var workspaceAdapter = new LocalStorageAdapter();
function col(id, name, type, extra = {}) {
	return {
		id,
		name,
		type,
		...extra
	};
}
function row(tableId, createdAt, cells) {
	return {
		id: uid("row"),
		tableId,
		cells,
		createdAt,
		updatedAt: createdAt
	};
}
var MEMBERS_COLUMNS = [
	col("nome", "Nome", "text", { required: true }),
	col("idade", "Idade", "number", { required: true }),
	col("nick", "Nick", "text", { required: true }),
	col("identidade", "ID", "number", { required: true }),
	col("whatsapp", "WhatsApp", "phone", { required: true })
];
var TBL_RECRUIT = "tbl_recruit";
var TBL_STAFF = "tbl_staff";
var TBL_TOURNAMENT = "tbl_tournament";
var TBL_TRAINING = "tbl_training";
var TBL_WARNINGS = "tbl_warnings";
var TBL_EVENTS = "tbl_events";
var TBL_FINANCE = "tbl_finance";
function createSeedSnapshot() {
	const now = Date.now();
	const hours = (h) => now - h * 60 * 60 * 1e3;
	const days = (d) => now - d * 24 * 60 * 60 * 1e3;
	const tables = [
		{
			id: MEMBERS_TABLE_ID,
			name: "Membros",
			description: "Cadastro principal de membros da equipe.",
			icon: "users",
			columns: MEMBERS_COLUMNS,
			createdAt: days(40),
			updatedAt: hours(2)
		},
		{
			id: TBL_RECRUIT,
			name: "Recrutamentos",
			description: "Pipeline de candidatos em processo seletivo.",
			icon: "user-plus",
			columns: [
				col("nome", "Nome", "text", { required: true }),
				col("nick", "Nick", "text"),
				col("status", "Status", "select", { options: [
					"Pendente",
					"Entrevista",
					"Aprovado",
					"Recusado"
				] }),
				col("origem", "Origem", "text"),
				col("data", "Data", "date")
			],
			kanbanColumnId: "status",
			createdAt: days(30),
			updatedAt: hours(8)
		},
		{
			id: TBL_STAFF,
			name: "Staff",
			description: "Equipe interna, cargos e disponibilidade.",
			icon: "shield",
			columns: [
				col("nome", "Nome", "text", { required: true }),
				col("cargo", "Cargo", "select", { options: [
					"Owner",
					"Admin",
					"Moderador",
					"Suporte"
				] }),
				col("nivel", "Nível", "number"),
				col("status", "Status", "select", { options: [
					"Ativo",
					"Ausente",
					"Folga"
				] })
			],
			kanbanColumnId: "status",
			createdAt: days(28),
			updatedAt: hours(12)
		},
		{
			id: TBL_TOURNAMENT,
			name: "Torneios",
			description: "Competições e campeonatos em andamento.",
			icon: "trophy",
			columns: [
				col("nome", "Nome", "text", { required: true }),
				col("data", "Data", "date"),
				col("participantes", "Participantes", "number"),
				col("status", "Status", "select", { options: [
					"Planejado",
					"Inscrições",
					"Ao vivo",
					"Encerrado"
				] })
			],
			kanbanColumnId: "status",
			createdAt: days(21),
			updatedAt: days(1)
		},
		{
			id: TBL_TRAINING,
			name: "Treinos",
			description: "Agenda de treinos e responsáveis.",
			icon: "dumbbell",
			columns: [
				col("titulo", "Título", "text", { required: true }),
				col("data", "Data", "date"),
				col("responsavel", "Responsável", "text"),
				col("status", "Status", "select", { options: [
					"Agendado",
					"Concluído",
					"Cancelado"
				] })
			],
			kanbanColumnId: "status",
			createdAt: days(18),
			updatedAt: hours(30)
		},
		{
			id: TBL_WARNINGS,
			name: "Advertências",
			description: "Registro disciplinar da equipe.",
			icon: "alert",
			columns: [
				col("membro", "Membro", "text", { required: true }),
				col("motivo", "Motivo", "text"),
				col("gravidade", "Gravidade", "select", { options: [
					"Baixa",
					"Média",
					"Alta"
				] }),
				col("data", "Data", "date")
			],
			kanbanColumnId: "gravidade",
			createdAt: days(16),
			updatedAt: days(3)
		},
		{
			id: TBL_EVENTS,
			name: "Eventos",
			description: "Lives, encontros e datas especiais.",
			icon: "calendar",
			columns: [
				col("nome", "Nome", "text", { required: true }),
				col("data", "Data", "date"),
				col("local", "Local", "text"),
				col("status", "Status", "select", { options: [
					"Rascunho",
					"Confirmado",
					"Concluído"
				] })
			],
			kanbanColumnId: "status",
			createdAt: days(12),
			updatedAt: days(2)
		},
		{
			id: TBL_FINANCE,
			name: "Financeiro",
			description: "Entradas, saídas e saldo operacional.",
			icon: "wallet",
			columns: [
				col("descricao", "Descrição", "text", { required: true }),
				col("valor", "Valor", "number"),
				col("tipo", "Tipo", "select", { options: ["Entrada", "Saída"] }),
				col("data", "Data", "date"),
				col("status", "Status", "select", { options: [
					"Pendente",
					"Pago",
					"Cancelado"
				] })
			],
			kanbanColumnId: "status",
			createdAt: days(10),
			updatedAt: hours(5)
		}
	];
	const memberRows = [
		row(MEMBERS_TABLE_ID, hours(3), {
			nome: "Cassio",
			idade: 17,
			nick: "crazzyX",
			identidade: 9025394879,
			whatsapp: "559481046789"
		}),
		row(MEMBERS_TABLE_ID, hours(10), {
			nome: "Lucas Ferreira",
			idade: 19,
			nick: "xShadow",
			identidade: 8823410921,
			whatsapp: "5511987654321"
		}),
		row(MEMBERS_TABLE_ID, days(1), {
			nome: "Marina Costa",
			idade: 22,
			nick: "novaByte",
			identidade: 7712093847,
			whatsapp: "5521987654321"
		}),
		row(MEMBERS_TABLE_ID, days(2), {
			nome: "Rafael Souza",
			idade: 18,
			nick: "rafaGG",
			identidade: 6601928374,
			whatsapp: "5531987654321"
		}),
		row(MEMBERS_TABLE_ID, days(3), {
			nome: "Ana Beatriz",
			idade: 21,
			nick: "an4k",
			identidade: 5509182736,
			whatsapp: "5541987654321"
		}),
		row(MEMBERS_TABLE_ID, days(4), {
			nome: "Pedro Lima",
			idade: 16,
			nick: "pdrX",
			identidade: 4408172635,
			whatsapp: "5551987654321"
		}),
		row(MEMBERS_TABLE_ID, days(5), {
			nome: "Beatriz Alves",
			idade: 24,
			nick: "biaCore",
			identidade: 3307162544,
			whatsapp: "5561987654321"
		}),
		row(MEMBERS_TABLE_ID, days(6), {
			nome: "Thiago Nunes",
			idade: 20,
			nick: "thgZero",
			identidade: 2206152433,
			whatsapp: "5571987654321"
		}),
		row(MEMBERS_TABLE_ID, days(7), {
			nome: "Juliana Rocha",
			idade: 23,
			nick: "juLuna",
			identidade: 1105142322,
			whatsapp: "5581987654321"
		}),
		row(MEMBERS_TABLE_ID, days(8), {
			nome: "Henrique Dias",
			idade: 25,
			nick: "henq",
			identidade: 9984132211,
			whatsapp: "5591987654321"
		}),
		row(MEMBERS_TABLE_ID, days(9), {
			nome: "Sofia Martins",
			idade: 18,
			nick: "sofX",
			identidade: 8873121100,
			whatsapp: "5511912345678"
		})
	];
	return {
		version: 1,
		tables,
		rows: {
			[MEMBERS_TABLE_ID]: memberRows,
			[TBL_RECRUIT]: [
				row(TBL_RECRUIT, hours(6), {
					nome: "Diego Ramos",
					nick: "dgrms",
					status: "Entrevista",
					origem: "Discord",
					data: "2026-09-20"
				}),
				row(TBL_RECRUIT, days(2), {
					nome: "Camila Ortiz",
					nick: "camiO",
					status: "Pendente",
					origem: "Indicação",
					data: "2026-09-18"
				}),
				row(TBL_RECRUIT, days(4), {
					nome: "Igor Mendes",
					nick: "igM",
					status: "Aprovado",
					origem: "Formulário",
					data: "2026-09-12"
				})
			],
			[TBL_STAFF]: [
				row(TBL_STAFF, days(20), {
					nome: "Cassio",
					cargo: "Admin",
					nivel: 3,
					status: "Ativo"
				}),
				row(TBL_STAFF, days(18), {
					nome: "Marina Costa",
					cargo: "Moderador",
					nivel: 2,
					status: "Ativo"
				}),
				row(TBL_STAFF, days(10), {
					nome: "Henrique Dias",
					cargo: "Suporte",
					nivel: 1,
					status: "Folga"
				})
			],
			[TBL_TOURNAMENT]: [row(TBL_TOURNAMENT, days(2), {
				nome: "Open Cup Setembro",
				data: "2026-09-28",
				participantes: 32,
				status: "Inscrições"
			}), row(TBL_TOURNAMENT, days(8), {
				nome: "Scrim Interno",
				data: "2026-09-16",
				participantes: 8,
				status: "Encerrado"
			})],
			[TBL_TRAINING]: [row(TBL_TRAINING, hours(20), {
				titulo: "Aim & movement",
				data: "2026-09-23",
				responsavel: "Marina Costa",
				status: "Agendado"
			}), row(TBL_TRAINING, days(3), {
				titulo: "Review VOD",
				data: "2026-09-20",
				responsavel: "Cassio",
				status: "Concluído"
			})],
			[TBL_WARNINGS]: [row(TBL_WARNINGS, days(5), {
				membro: "Pedro Lima",
				motivo: "Ausência sem aviso",
				gravidade: "Média",
				data: "2026-09-18"
			})],
			[TBL_EVENTS]: [row(TBL_EVENTS, days(1), {
				nome: "Live de apresentação",
				data: "2026-09-26",
				local: "Twitch",
				status: "Confirmado"
			})],
			[TBL_FINANCE]: [row(TBL_FINANCE, days(2), {
				descricao: "Inscrição Open Cup",
				valor: 150,
				tipo: "Saída",
				data: "2026-09-21",
				status: "Pago"
			}), row(TBL_FINANCE, days(6), {
				descricao: "Patrocínio mensal",
				valor: 800,
				tipo: "Entrada",
				data: "2026-09-17",
				status: "Pago"
			})]
		},
		activity: [
			{
				id: uid("act"),
				type: "create",
				message: "Cassio foi adicionado em Membros",
				tableId: MEMBERS_TABLE_ID,
				at: hours(3)
			},
			{
				id: uid("act"),
				type: "create",
				message: "Diego Ramos entrou em Recrutamentos",
				tableId: TBL_RECRUIT,
				at: hours(6)
			},
			{
				id: uid("act"),
				type: "update",
				message: "Open Cup Setembro atualizado",
				tableId: TBL_TOURNAMENT,
				at: hours(14)
			},
			{
				id: uid("act"),
				type: "create",
				message: "Live de apresentação confirmada",
				tableId: TBL_EVENTS,
				at: days(1)
			},
			{
				id: uid("act"),
				type: "table_create",
				message: "Tabela Financeiro criada",
				tableId: TBL_FINANCE,
				at: days(10)
			}
		],
		profile: {
			name: "Admin",
			role: "Owner"
		},
		views: {},
		locked: false
	};
}
function snapshotOf(s) {
	return {
		version: 1,
		tables: s.tables,
		rows: s.rows,
		activity: s.activity.slice(0, 80),
		profile: s.profile,
		views: s.views,
		locked: s.locked
	};
}
function pushActivity(list, type, message, tableId) {
	return [{
		id: uid("act"),
		type,
		message,
		tableId,
		at: Date.now()
	}, ...list].slice(0, 80);
}
var seed = createSeedSnapshot();
var useWorkspace = create()((set, get) => ({
	...seed,
	hydrated: true,
	hydrate: async () => {
		const loaded = await workspaceAdapter.load();
		if (loaded) set({
			...loaded,
			activity: loaded.activity ?? [],
			views: loaded.views ?? {},
			profile: loaded.profile ?? seed.profile,
			locked: Boolean(loaded.locked),
			hydrated: true
		});
		else {
			set({ hydrated: true });
			await workspaceAdapter.save(snapshotOf(get()));
		}
	},
	persistNow: () => {
		workspaceAdapter.save(snapshotOf(get()));
	},
	setLocked: (locked) => {
		set({ locked });
		get().persistNow();
	},
	setProfile: (profile) => {
		set((s) => ({ profile: {
			...s.profile,
			...profile
		} }));
		get().persistNow();
	},
	setView: (tableId, view) => {
		set((s) => ({ views: {
			...s.views,
			[tableId]: view
		} }));
		get().persistNow();
	},
	addRow: (tableId, cells) => {
		const table = get().tables.find((t) => t.id === tableId);
		if (!table) return null;
		const now = Date.now();
		const next = {
			id: uid("row"),
			tableId,
			cells,
			createdAt: now,
			updatedAt: now
		};
		const label = String(cells[table.columns[0]?.id] ?? "Registro");
		set((s) => ({
			rows: {
				...s.rows,
				[tableId]: [next, ...s.rows[tableId] ?? []]
			},
			tables: s.tables.map((t) => t.id === tableId ? {
				...t,
				updatedAt: now
			} : t),
			activity: pushActivity(s.activity, "create", `${label} adicionado em ${table.name}`, tableId)
		}));
		get().persistNow();
		return next;
	},
	updateRow: (tableId, rowId, cells) => {
		const table = get().tables.find((t) => t.id === tableId);
		const now = Date.now();
		set((s) => ({
			rows: {
				...s.rows,
				[tableId]: (s.rows[tableId] ?? []).map((r) => r.id === rowId ? {
					...r,
					cells: {
						...r.cells,
						...cells
					},
					updatedAt: now
				} : r)
			},
			tables: s.tables.map((t) => t.id === tableId ? {
				...t,
				updatedAt: now
			} : t),
			activity: pushActivity(s.activity, "update", `Registro atualizado em ${table?.name ?? "tabela"}`, tableId)
		}));
		get().persistNow();
	},
	deleteRows: (tableId, rowIds) => {
		const table = get().tables.find((t) => t.id === tableId);
		const idSet = new Set(rowIds);
		const now = Date.now();
		set((s) => ({
			rows: {
				...s.rows,
				[tableId]: (s.rows[tableId] ?? []).filter((r) => !idSet.has(r.id))
			},
			tables: s.tables.map((t) => t.id === tableId ? {
				...t,
				updatedAt: now
			} : t),
			activity: pushActivity(s.activity, "delete", `${rowIds.length} registro${rowIds.length > 1 ? "s" : ""} excluído${rowIds.length > 1 ? "s" : ""} de ${table?.name ?? "tabela"}`, tableId)
		}));
		get().persistNow();
	},
	duplicateRows: (tableId, rowIds) => {
		const table = get().tables.find((t) => t.id === tableId);
		const now = Date.now();
		const idSet = new Set(rowIds);
		set((s) => {
			const current = s.rows[tableId] ?? [];
			const copies = current.filter((r) => idSet.has(r.id)).map((r) => ({
				...r,
				id: uid("row"),
				createdAt: now,
				updatedAt: now
			}));
			return {
				rows: {
					...s.rows,
					[tableId]: [...copies, ...current]
				},
				tables: s.tables.map((t) => t.id === tableId ? {
					...t,
					updatedAt: now
				} : t),
				activity: pushActivity(s.activity, "duplicate", `${copies.length} registro${copies.length > 1 ? "s" : ""} duplicado${copies.length > 1 ? "s" : ""} em ${table?.name ?? "tabela"}`, tableId)
			};
		});
		get().persistNow();
	},
	bulkPatch: (tableId, rowIds, columnId, value) => {
		const idSet = new Set(rowIds);
		const now = Date.now();
		set((s) => ({
			rows: {
				...s.rows,
				[tableId]: (s.rows[tableId] ?? []).map((r) => idSet.has(r.id) ? {
					...r,
					cells: {
						...r.cells,
						[columnId]: value
					},
					updatedAt: now
				} : r)
			},
			tables: s.tables.map((t) => t.id === tableId ? {
				...t,
				updatedAt: now
			} : t),
			activity: pushActivity(s.activity, "update", `Edição em massa (${rowIds.length})`, tableId)
		}));
		get().persistNow();
	},
	importRows: (tableId, incoming) => {
		const table = get().tables.find((t) => t.id === tableId);
		const now = Date.now();
		set((s) => ({
			rows: {
				...s.rows,
				[tableId]: [...incoming, ...s.rows[tableId] ?? []]
			},
			tables: s.tables.map((t) => t.id === tableId ? {
				...t,
				updatedAt: now
			} : t),
			activity: pushActivity(s.activity, "import", `${incoming.length} registro${incoming.length > 1 ? "s" : ""} importado${incoming.length > 1 ? "s" : ""} em ${table?.name ?? "tabela"}`, tableId)
		}));
		get().persistNow();
	},
	addTable: (input) => {
		const now = Date.now();
		const table = {
			id: uid("tbl"),
			name: input.name,
			description: input.description,
			icon: input.icon,
			columns: input.columns,
			createdAt: now,
			updatedAt: now,
			kanbanColumnId: input.columns.find((c) => c.type === "select")?.id
		};
		set((s) => ({
			tables: [...s.tables, table],
			rows: {
				...s.rows,
				[table.id]: []
			},
			activity: pushActivity(s.activity, "table_create", `Tabela ${table.name} criada`, table.id)
		}));
		get().persistNow();
		return table;
	},
	updateTable: (tableId, patch) => {
		const now = Date.now();
		set((s) => ({
			tables: s.tables.map((t) => t.id === tableId ? {
				...t,
				...patch,
				updatedAt: now
			} : t),
			activity: pushActivity(s.activity, "table_update", "Estrutura da tabela atualizada", tableId)
		}));
		get().persistNow();
	},
	deleteTable: (tableId) => {
		const table = get().tables.find((t) => t.id === tableId);
		set((s) => {
			const rows = { ...s.rows };
			delete rows[tableId];
			const views = { ...s.views };
			delete views[tableId];
			return {
				tables: s.tables.filter((t) => t.id !== tableId),
				rows,
				views,
				activity: pushActivity(s.activity, "table_delete", `Tabela ${table?.name ?? ""} removida`, tableId)
			};
		});
		get().persistNow();
	},
	log: (type, message, tableId) => {
		set((s) => ({ activity: pushActivity(s.activity, type, message, tableId) }));
		get().persistNow();
	},
	resetWorkspace: () => {
		set({
			...createSeedSnapshot(),
			hydrated: true
		});
		get().persistNow();
	},
	restoreMembersTable: () => {
		const fresh = createSeedSnapshot();
		const members = fresh.tables.find((t) => t.id === MEMBERS_TABLE_ID);
		if (!members) return;
		set((s) => {
			if (s.tables.some((t) => t.id === "tbl_members")) return s;
			return {
				tables: [members, ...s.tables],
				rows: {
					...s.rows,
					[MEMBERS_TABLE_ID]: fresh.rows["tbl_members"] ?? []
				}
			};
		});
		get().persistNow();
	}
}));
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium select-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-[background-color,box-shadow,color,opacity,transform] duration-150 ease-out active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow-glow hover:bg-primary/90",
			secondary: "bg-secondary text-secondary-foreground shadow-card hover:shadow-card-hover hover:bg-secondary/80",
			outline: "bg-transparent shadow-card hover:shadow-card-hover hover:bg-accent text-foreground",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-10 px-4 pr-3.5",
			sm: "h-8 rounded-sm px-3 text-xs",
			lg: "h-11 rounded-lg px-5",
			icon: "size-10",
			"icon-sm": "size-8"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		"data-slot": "button",
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
//#endregion
export { buttonVariants as a, useWorkspace as c, MEMBERS_TABLE_ID as i, COLUMN_TYPE_LABELS as n, cn as o, FILTER_OPERATOR_LABELS as r, uid as s, Button as t };
