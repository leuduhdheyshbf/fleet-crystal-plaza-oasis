import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as Route } from "./router-P6QNUDHT.mjs";
import { t as TableWorkspace } from "./TableWorkspace-BZlgBUeY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tables._tableId-B0bfZm_K.js
var import_jsx_runtime = require_jsx_runtime();
function TableDetailPage() {
	const { tableId } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableWorkspace, { tableId });
}
//#endregion
export { TableDetailPage as component };
