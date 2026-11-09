// Extracted from @deepseek-ai/dsh-client-ui-cordis (lib/client.js); region lib/types/client/CordisPreparingRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/* v8 ignore next -- Non-expandable rows never invoke DisclosureRow's required toggle callback. */
const noop = () => void 0;
/**
* Render a Cordis-owned prefix without disclosure.
* @param props - Cordis prefix, styling, and locale.
* @returns the preparation row.
*/
function CordisPreparingRow({ toolName, t, icon, title, className, rowClassName, titleClassName }) {
	return (0, react_jsx_runtime.jsx)("div", {
		"data-tool": toolName,
		"data-state": "preparing",
		"aria-label": t("a11y.preparing"),
		children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DisclosureRow, {
			icon,
			title,
			className,
			rowClassName,
			titleClassName,
			open: false,
			expandable: false,
			onToggle: noop,
			running: true
		})
	});
}
