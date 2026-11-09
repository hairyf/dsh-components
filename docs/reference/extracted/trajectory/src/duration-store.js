// Extracted from @deepseek-ai/dsh-client-ui-trajectory (lib/client.js); region lib/types/client/duration-store.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Create the browser-wide trajectory duration preference source.
* @returns a persisted source shared by every session view in one plugin lifecycle.
*/
function createTrajectoryDurationStore() {
	return (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(false, { persist: { name: "dsh.trajectory.duration" } });
}
