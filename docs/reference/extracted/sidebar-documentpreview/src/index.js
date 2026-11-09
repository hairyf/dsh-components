// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/index.js); region lib/types/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Embed validated preview settings in browser pages.
* @param ctx - Host context serving browser pages.
* @param config - Cache limits adopted when the page loads.
*/
function apply(ctx, config) {
	ctx.on("webserver/index-inject", (table) => {
		table.push({
			kind: "global",
			name: "__DSH_DOCUMENT_PREVIEW_CONFIG__",
			value: config
		});
	});
}
