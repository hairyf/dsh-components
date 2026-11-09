// Extracted from @deepseek-ai/dsh-client-ui-session (lib/client.js); region lib/types/client/session-provider.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render the selected Session body or its empty branch.
* @param binding - current Session scope binding.
* @param props - standard Session area render props.
* @returns the selected Session subtree.
*/
function renderSessionArea(binding, { empty, children }) {
	if (binding.key === void 0) return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: empty?.() ?? null });
	return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children });
}
