// Extracted from @deepseek-ai/dsh-client-ui-renderer (lib/client.js); region lib/types/client/app.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Build the assembled application factory.
* @param deps - Active UI-renderer dependencies.
* @returns Factory producing the application React tree.
*/
function buildRenderApp(deps) {
	const { ctx } = deps;
	return () => ctx.slots.renderSlot("root", {});
}
