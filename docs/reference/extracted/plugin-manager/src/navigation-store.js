// Extracted from @deepseek-ai/dsh-client-ui-plugin-manager (lib/client.js); region lib/types/client/navigation-store.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Plugin page selection shared by the page and cross-plugin navigation. */
/**
* Create plugin page selection before the first page render.
* @returns the registration-owned navigation store handle.
*/
function createNavigationStore() {
	return (0, _deepseek_ai_dsh_client_store.defineStore)({
		init: () => ({
			view: { kind: "list" },
			tab: "installed"
		}),
		actions: {
			setView: (draft, view) => {
				draft.view = view;
			},
			setTab: (draft, tab) => {
				draft.tab = tab;
			}
		}
	});
}
