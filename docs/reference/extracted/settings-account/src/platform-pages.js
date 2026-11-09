// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/platform-pages.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* One native Platform view for the whole account feature. The Account settings
		* page, the frame-wide quota notice, and the desktop onboarding recharge step
		* request a page here instead of mounting their own container, because the
		* Desktop host owns a single WebContentsView and its `open` destroys whatever
		* was showing before.
		*/
		/**
		* Create the plugin-scoped request channel shared by the account surfaces and
		* the one host that renders their pages. The snapshot store supplies the
		* observable and isolates a throwing subscriber from the rest.
		* @returns the request channel.
		*/
		function createPlatformPages() {
			const store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(null);
			let owner;
			let token = null;
			return {
				getSnapshot: () => store.getSnapshot(),
				subscribe: (listener) => store.subscribe(listener),
				open(page, onClose) {
					const previous = owner;
					const own = {};
					token = own;
					owner = onClose;
					store.set({ page });
					previous?.("superseded");
					return () => {
						if (token !== own) return;
						token = null;
						owner = void 0;
						store.set(null);
					};
				},
				close() {
					if (store.getSnapshot() === null) return;
					const retiring = owner;
					token = null;
					owner = void 0;
					store.set(null);
					retiring?.("returned");
				},
				dispose() {
					token = null;
					owner = void 0;
					if (store.getSnapshot() === null) return;
					store.set(null);
				}
			};
		}
