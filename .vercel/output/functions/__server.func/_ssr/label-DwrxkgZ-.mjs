import "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { I as require_jsx_runtime, a as Overlay2, c as Title2, i as Description2, l as Trigger2, n as Cancel, o as Portal2, r as Content2, s as Root2, t as Action } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as buttonVariants, o as cn } from "./button-Dm1fkKXb.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var TAGS = /<\/?[^>]+>/g;
var CONTROLS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
var SCRIPTISH = /javascript:|data:text\/html|vbscript:/gi;
function sanitizeText(input) {
	if (input === null || input === void 0) return "";
	return String(input).replace(TAGS, "").replace(SCRIPTISH, "").replace(CONTROLS, "").replace(/\s+/g, " ").trim();
}
function digitsOnly(input) {
	return sanitizeText(input).replace(/\D/g, "");
}
function isLikelyEmail(value) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function isLikelyPhone(value) {
	const d = digitsOnly(value);
	return d.length >= 10 && d.length <= 15;
}
function parseNumber(value) {
	const cleaned = sanitizeText(value).replace(/\s/g, "").replace(",", ".");
	if (!cleaned) return null;
	const n = Number(cleaned);
	return Number.isFinite(n) ? n : null;
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		"data-slot": "input",
		className: cn("flex h-10 w-full min-w-0 rounded-md bg-secondary px-3 py-1 text-sm text-foreground shadow-card outline-none placeholder:text-muted-foreground", "transition-[box-shadow,background-color] duration-150 ease-out", "focus-visible:shadow-card-hover focus-visible:ring-2 focus-visible:ring-ring/60", "disabled:pointer-events-none disabled:opacity-50", "file:border-0 file:bg-transparent file:text-sm file:font-medium", "aria-invalid:ring-2 aria-invalid:ring-destructive/70", className),
		...props
	});
}
var AlertDialog = Root2;
var AlertDialogTrigger = Trigger2;
var AlertDialogPortal = Portal2;
function AlertDialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, {
		className: cn("fixed inset-0 z-50 bg-background/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		...props
	});
}
function AlertDialogContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		className: cn("fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-card p-6 shadow-overlay", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200", className),
		...props
	})] });
}
function AlertDialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1.5", className),
		...props
	});
}
function AlertDialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
		...props
	});
}
function AlertDialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
		className: cn("text-lg font-semibold tracking-tight", className),
		...props
	});
}
function AlertDialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
function AlertDialogAction({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
		className: cn(buttonVariants(), className),
		...props
	});
}
function AlertDialogCancel({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
		className: cn(buttonVariants({ variant: "outline" }), className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		"data-slot": "label",
		className: cn("text-xs font-medium text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className),
		...props
	});
}
//#endregion
export { AlertDialogDescription as a, AlertDialogTitle as c, Label as d, digitsOnly as f, sanitizeText as g, parseNumber as h, AlertDialogContent as i, AlertDialogTrigger as l, isLikelyPhone as m, AlertDialogAction as n, AlertDialogFooter as o, isLikelyEmail as p, AlertDialogCancel as r, AlertDialogHeader as s, AlertDialog as t, Input as u };
