import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { c as useWorkspace, i as MEMBERS_TABLE_ID, t as Button } from "./button-Dm1fkKXb.mjs";
import { t as TableWorkspace } from "./TableWorkspace-BZlgBUeY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/members-BDmQQx3G.js
var import_jsx_runtime = require_jsx_runtime();
function MembersPage() {
	const exists = useWorkspace((s) => s.tables.some((t) => t.id === MEMBERS_TABLE_ID));
	const restore = useWorkspace((s) => s.restoreMembersTable);
	if (!exists) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-card p-10 text-center shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: "Tabela de membros não encontrada"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Restaure o cadastro padrão para continuar."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				onClick: restore,
				children: "Restaurar Membros"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableWorkspace, {
		tableId: MEMBERS_TABLE_ID,
		addLabel: "Adicionar membro"
	});
}
//#endregion
export { MembersPage as component };
