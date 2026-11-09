// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/document/tab-lifetime.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Release retained view state on tab closure or plugin disposal.
* @param ctx - owning preview plugin context.
* @returns a callback accepting the tab, its lifetime signal, and its store's forget action; repeated holds share one listener.
*/
function retainDocumentTabs(ctx) {
	const retained = /* @__PURE__ */ new Map();
	ctx.effect(() => () => {
		for (const forget of retained.values()) forget();
	});
	return (tabId, signal, forgetTab) => {
		if (signal.aborted) {
			forgetTab(tabId);
			return;
		}
		if (retained.has(signal)) return;
		const forget = () => {
			signal.removeEventListener("abort", forget);
			retained.delete(signal);
			forgetTab(tabId);
		};
		retained.set(signal, forget);
		signal.addEventListener("abort", forget, { once: true });
	};
}
