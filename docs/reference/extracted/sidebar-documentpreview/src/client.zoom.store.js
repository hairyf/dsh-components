// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/zoom/store.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Tab-local zoom preferences for renderers without additional view state. */
/**
* Create tab-local zoom state for a document renderer registration.
* @returns a store declaration retaining zoom until its tab closes.
*/
function createZoomStore() {
	return (0, _deepseek_ai_dsh_client_store.defineStore)({
		init: () => ({ byTab: {} }),
		actions: {
			zoom: (draft, tabId, preference) => {
				draft.byTab[tabId] = preference;
			},
			forget: (draft, tabId) => {
				const { [tabId]: _closed, ...remaining } = draft.byTab;
				draft.byTab = remaining;
			}
		}
	});
}
/** Default zoom value for a tab without retained state. */
const DEFAULT_ZOOM = FIT_WIDTH;
