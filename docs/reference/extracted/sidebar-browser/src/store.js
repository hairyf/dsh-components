// Extracted from @deepseek-ai/dsh-client-ui-sidebar-browser (lib/client.js); region lib/types/client/browser/store.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Persisted Browser tab snapshots shared by the body and title slots. */
/**
* Declare the Session-scoped Browser persistence store.
* @returns a fresh store handle for Slot registration.
*/
function createBrowserStore() {
	return (0, _deepseek_ai_dsh_client_store.defineStore)({
		init: () => ({ byTab: {} }),
		persist: "dsh.sidebar-browser.v1",
		actions: {
			replace: (draft, tabId, state) => {
				draft.byTab[tabId] = state;
			},
			forget: (draft, tabId) => {
				const byTab = {};
				for (const [id, state] of Object.entries(draft.byTab)) if (id !== tabId) byTab[id] = state;
				draft.byTab = byTab;
			}
		}
	});
}
