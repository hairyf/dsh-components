// Extracted from @deepseek-ai/dsh-client-ui-sidebar-browser (lib/client.js); region lib/types/client/browser/BrowserPersistence.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Read the selected address from a saved navigation record.
* @param state - saved navigation.
* @returns its last selected address, if any.
*/
function currentBrowserTarget(state) {
	return state === void 0 || state.index < 0 ? void 0 : state.entries[state.index];
}
/**
* Checkpoint an observed address without serializing native history.
* @param target - current address.
* @param revision - navigation generation.
* @returns an address-only checkpoint.
*/
function browserAddressCheckpoint(target, revision) {
	return {
		entries: [target],
		index: 0,
		request: {
			target,
			revision
		},
		navigation: {
			status: "known",
			revision
		},
		failure: void 0
	};
}
