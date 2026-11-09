// Extracted from @deepseek-ai/dsh-client-ui-action-cards (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Mount action cards and their Remote.
* @param ctx - Client plugin context.
* @returns disposer for every contribution.
*/
async function apply(ctx) {
	return await mountActionCards(ctx, TYPERT_REMOTE);
}
