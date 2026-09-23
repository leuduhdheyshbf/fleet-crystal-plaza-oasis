import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { o as cn } from "./button-Dm1fkKXb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-DHD0zMl5.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium leading-none", {
	variants: { tone: {
		default: "border-transparent bg-secondary text-foreground",
		primary: "border-transparent bg-primary/15 text-primary",
		blue: "border-transparent bg-tone-blue/15 text-tone-blue",
		teal: "border-transparent bg-tone-teal/15 text-tone-teal",
		amber: "border-transparent bg-tone-amber/15 text-tone-amber",
		rose: "border-transparent bg-tone-rose/15 text-tone-rose",
		zinc: "border-transparent bg-tone-zinc/15 text-tone-zinc",
		emerald: "border-transparent bg-tone-emerald/15 text-tone-emerald",
		outline: "border-border text-foreground"
	} },
	defaultVariants: { tone: "default" }
});
function Badge({ className, tone, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ tone }), className),
		...props
	});
}
//#endregion
export { Badge as t };
