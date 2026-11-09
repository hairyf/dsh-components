// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/view-pins.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** In-memory pin choices for the Conversation View tabs. */
/** View whose tab always shows and never enters the customization list. */
const FIXED_VIEW_ID = "chat";
const NO_VIEWS = [];
/**
* Create the in-memory View pin list; the snapshot keeps its reference until the list changes.
* @returns Unpinned View ids and the pin mutation.
*/
function createViewPins() {
	const store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({ unpinned: NO_VIEWS });
	return {
		unpinned: {
			getSnapshot: () => store.getSnapshot().unpinned,
			subscribe: (listener) => store.subscribe(listener)
		},
		setPinned: (id, pinned) => {
			const current = store.getSnapshot().unpinned;
			if (id === "chat" || pinned !== current.includes(id)) return;
			store.set({ unpinned: pinned ? current.filter((entry) => entry !== id) : [...current, id] });
		}
	};
}
