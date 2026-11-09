// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/GenericCommandCard.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

const COMMAND_ICON = (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconApiOutlineRegular, { size: 14 });
/** Node state → row state semantic (running while unsettled; outcome kind after). */
function stateOf(outcome) {
	if (outcome === null) return "running";
	return outcome.kind === "error" ? "error" : "ok";
}
/**
* Render a command summary and its lazily mounted multiline output.
* @param props - command, locale, and optional running label.
* @returns the command disclosure.
*/
const GenericCommandCard = (0, react.memo)(function GenericCommandCard({ node, t, runningSummary }) {
	const [expanded, setExpanded] = (0, react.useState)(false);
	const text = node.outcome?.text;
	const summary = node.outcome === null ? runningSummary ?? t("command.running") : text ?? (node.outcome.kind === "error" ? t("command.failed") : t("command.done"));
	const title = node.name ?? t("command.title");
	const state = stateOf(node.outcome);
	const running = state === "running";
	const body = text !== void 0 && text.includes("\n") ? text : null;
	const open = expanded && body !== null;
	const toggle = (0, react.useCallback)(() => {
		setExpanded((value) => !value);
	}, []);
	const collapsedContent = (0, react.useMemo)(() => (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
		className: GenericCommandCard_module_css_default.separator,
		"data-shimmer-decoration": true,
		"aria-hidden": true
	}), (0, react_jsx_runtime.jsx)("span", {
		className: GenericCommandCard_module_css_default.summary,
		"data-error": state === "error" || void 0,
		children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, { children: summary })
	})] }), [
		running,
		state,
		summary
	]);
	const content = (0, react.useMemo)(() => open ? (0, react_jsx_runtime.jsx)("pre", {
		className: GenericCommandCard_module_css_default.body,
		"data-error": state === "error" || void 0,
		children: body
	}) : void 0, [
		body,
		open,
		state
	]);
	return (0, react_jsx_runtime.jsxs)("div", {
		className: GenericCommandCard_module_css_default.root,
		"data-variant": "others",
		"data-state": state,
		children: [
			state === "running" && (0, react_jsx_runtime.jsx)("span", {
				className: accessibility_module_css_default.visuallyHidden,
				children: t("row.running")
			}),
			state === "error" && (0, react_jsx_runtime.jsx)("span", {
				className: accessibility_module_css_default.visuallyHidden,
				children: t("row.failed")
			}),
			(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DisclosureRow, {
				leadingClassName: GenericCommandCard_module_css_default.leading,
				titleClassName: GenericCommandCard_module_css_default.title,
				icon: COMMAND_ICON,
				title,
				running,
				open,
				expandable: body !== null,
				expandOnRowClick: true,
				keepContentWhenOpen: true,
				onToggle: toggle,
				collapsedContent,
				children: content
			})
		]
	});
});
