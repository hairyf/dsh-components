// Extracted from @deepseek-ai/dsh-client-ui-schedule (lib/client.js); region lib/types/client/editor-store.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Unsaved task forms survive navigation without persisting business records. */
const editorActions = {
	setDraft: (state, key, draft) => {
		state.drafts[key] = draft;
	},
	clearDraft: (state, key) => {
		state.drafts = Object.fromEntries(Object.entries(state.drafts).filter(([id]) => id !== key));
	}
};
/**
* Declare drafts retained by the framework for one entry's scope.
* @returns the entry's store handle.
*/
function createEditorStore() {
	return (0, _deepseek_ai_dsh_client_store.defineStore)({
		init: () => ({ drafts: {} }),
		actions: editorActions
	});
}
