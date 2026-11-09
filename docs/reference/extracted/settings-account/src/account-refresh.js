// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/account-refresh.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Refresh ordering for returning from an external account operation. */
/**
* Wait for the pre-return read, then request a fresh account snapshot.
* @param pending - query already running before the user returned.
* @param refresh - account owner's normal refresh operation.
* @returns settlement of the new query, independent of the older query's outcome.
*/
async function refreshAfterReturn(pending, refresh) {
	try {
		await pending;
	} catch (_error) {}
	await refresh();
}
