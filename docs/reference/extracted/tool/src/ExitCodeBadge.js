// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/components/ExitCodeBadge.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Inline exit status for a settled command. */
/**
* Render a neutral capsule with a failure dot and a localized exit status.
* @param props - localized exit code or terminating signal label.
* @returns the exit status capsule.
*/
function ExitCodeBadge({ label }) {
	return (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
		tone: "neutral",
		className: ExitCodeBadge_module_css_default.badge,
		children: [(0, react_jsx_runtime.jsx)("span", {
			className: ExitCodeBadge_module_css_default.dot,
			"aria-hidden": true
		}), label]
	});
}
