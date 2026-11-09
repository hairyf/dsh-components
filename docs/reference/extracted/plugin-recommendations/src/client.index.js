// Extracted from @deepseek-ai/dsh-client-ui-plugin-recommendations (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Mount recommendation UI and its optional Remote.
* @param ctx - Client plugin context.
* @returns disposer for both contributions.
*/
async function apply(ctx) {
	return await mountRecommendations(ctx, TYPERT_REMOTE);
}
