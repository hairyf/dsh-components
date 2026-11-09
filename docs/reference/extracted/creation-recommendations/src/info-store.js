// Extracted from @deepseek-ai/dsh-client-ui-creation-recommendations (lib/client.js); region lib/types/client/info-store.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Remember the dismissed creation notice across sessions in this browser.
* @returns a plugin-owned preference; unavailable storage only disables persistence.
*/
function createCreationInfoStore() {
	return (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(false, { persist: { name: "dsh.creation-recommendations.info-dismissed" } });
}
