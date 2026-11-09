// Extracted from @deepseek-ai/dsh-client-ui-subagent (lib/client.js); region lib/types/client/SubagentReadOnlyComposer.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Explain why the normal composer is unavailable for an addressed child.
* @param props - selector-owned read-only reason plus standard slot props.
* @returns A read-only composer replacement.
*/
function SubagentReadOnlyComposer({ matched, t }) {
	const oneShot = matched.reason === "one-shot";
	return (0, react_jsx_runtime.jsxs)("div", {
		className: SubagentReadOnlyComposer_module_css_default.frame,
		role: "status",
		children: [(0, react_jsx_runtime.jsx)("strong", { children: t(oneShot ? "readonly.oneShot.title" : "readonly.title") }), (0, react_jsx_runtime.jsx)("span", { children: t(matched.reason === "unknown" ? "readonly.unknown.body" : oneShot ? "readonly.oneShot.body" : "readonly.body") })]
	});
}
