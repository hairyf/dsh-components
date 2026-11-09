// Extracted from @deepseek-ai/dsh-client-ui-shortcuts (lib/client.js); region lib/types/client/store.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Shortcut reference visibility and search state, shared by its entry points. */
/**
* Declare the reference dialog store.
* @returns root-scoped visibility, focus request, and search actions.
*/
function createShortcutsStore() {
	return (0, _deepseek_ai_dsh_client_store.defineStore)({
		init: () => ({
			open: false,
			query: "",
			focusRequest: 0
		}),
		actions: {
			open: (d) => {
				d.open = true;
				d.focusRequest++;
			},
			close: (d) => {
				d.open = false;
				d.query = "";
			},
			search: (d, query) => {
				d.query = query;
			}
		}
	});
}
