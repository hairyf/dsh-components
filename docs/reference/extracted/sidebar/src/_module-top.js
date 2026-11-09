// Extracted from @deepseek-ai/dsh-client-ui-sidebar (lib/client.js); module-level code outside any region.
// Compiled bundle code copied verbatim from the bundle; imports are hoisted in the original bundle, so this file is not standalone.

const NO_PANELS = [];
		/**
		* Create the in-memory panel pin list; the snapshot keeps its reference until the list changes.
		* @returns Unpinned panel ids and the pin mutation.
		*/
		function createPanelPins() {
			const store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({ unpinned: NO_PANELS });
			return {
				unpinned: {
					getSnapshot: () => store.getSnapshot().unpinned,
					subscribe: (listener) => store.subscribe(listener)
				},
				setPinned: (id, pinned) => {
					const current = store.getSnapshot().unpinned;
					if (id === "plugins" || pinned !== current.includes(id)) return;
					store.set({ unpinned: pinned ? current.filter((entry) => entry !== id) : [...current, id] });
				}
			};
		}
