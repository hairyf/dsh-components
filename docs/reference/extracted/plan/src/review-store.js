// Extracted from @deepseek-ai/dsh-client-ui-plan (lib/client.js); region lib/types/client/review-store.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Session-owned memory of pending plans already opened automatically. */
/**
* Keep manual sidebar closure effective across review component remounts.
* @returns a transient store handle whose instances belong to Session scopes.
*/
function createPlanReviewStore() {
	return (0, _deepseek_ai_dsh_client_store.defineStore)({
		init: () => ({ opened: {} }),
		actions: { markOpened: (draft, reviewKey) => {
			draft.opened[reviewKey] = true;
		} }
	});
}
