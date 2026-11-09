// Extracted from @deepseek-ai/dsh-client-ui-context-menu (lib/client.js); region lib/types/client/store.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Single-popup viewing state and feedback retained outside trigger components. */
/**
* Create the root popup store.
* @returns the presentation and its mutation actions.
*/
function createMenuStore() {
	return (0, _deepseek_ai_dsh_client_store.defineStore)({
		init: () => ({
			occurrence: 0,
			closing: false,
			replacing: false,
			target: null,
			point: {
				x: 0,
				y: 0
			},
			items: [],
			notice: null
		}),
		actions: {
			open(draft, target, point) {
				draft.occurrence++;
				draft.closing = false;
				draft.replacing = false;
				draft.target = target;
				draft.point = point;
				draft.items = [];
			},
			items(draft, items) {
				draft.items = items;
			},
			exit(draft, replacing) {
				draft.closing = true;
				draft.replacing = replacing;
			},
			close(draft) {
				draft.target = null;
				draft.items = [];
			},
			notify(draft, notice) {
				draft.notice = notice;
			}
		}
	});
}
