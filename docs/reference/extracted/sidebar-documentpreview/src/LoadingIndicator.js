// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/LoadingIndicator.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* @param props - localized status label and compact inline placement for additional pages.
* @returns a centered document loading status or an accessible inline spinner.
*/
function LoadingIndicator({ label, inline = false }) {
	return (0, react_jsx_runtime.jsxs)("span", {
		className: clsx(LoadingIndicator_module_css_default.loading, inline && LoadingIndicator_module_css_default.inline),
		role: "status",
		"aria-label": label,
		"data-document-loading": true,
		children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
			state: "ongoing",
			size: inline ? 14 : 28
		}), !inline && (0, react_jsx_runtime.jsx)("span", { children: label })]
	});
}
