// Extracted from @deepseek-ai/dsh-client-ui-trajectory (lib/client.js); region lib/types/client/string-wrapping-store.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Create the browser-wide default for expanded JSON strings.
* @returns A persisted preference sampled only when a string is expanded.
*/
function createTrajectoryStringWrappingStore() {
	return (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(false, { persist: { name: "dsh.trajectory.jsonStringWrapping" } });
}
