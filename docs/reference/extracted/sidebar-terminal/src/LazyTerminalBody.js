// Extracted from @deepseek-ai/dsh-client-ui-sidebar-terminal (lib/client.js); region lib/types/client/LazyTerminalBody.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Load xterm only after a terminal body is mounted. */
const LoadedTerminalBody = (0, react.lazy)(async () => ({ default: (await require.async("./client.terminal.js")).TerminalBody }));
/**
* Suspend while the package-local terminal chunk arrives.
* @param props - Terminal body props supplied by the sidebar slot.
* @returns the deferred terminal renderer.
*/
function LazyTerminalBody(props) {
	return (0, react_jsx_runtime.jsx)(react.Suspense, {
		fallback: null,
		children: (0, react_jsx_runtime.jsx)(LoadedTerminalBody, { ...props })
	});
}
