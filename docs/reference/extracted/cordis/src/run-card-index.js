// Extracted from @deepseek-ai/dsh-client-ui-cordis (lib/client.js); region lib/types/client/run-card-index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Session-local ownership index for Package business views on `cordis_run` cards. */
		function createStore() {
			const pointers = /* @__PURE__ */ new Map();
			const listeners = /* @__PURE__ */ new Set();
			let cache;
			return {
				getSnapshot: () => cache ??= new Map(pointers),
				subscribe: (listener) => {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				},
				observe: (pointer) => {
					const current = pointers.get(pointer.key);
					if (current !== void 0 && current.seq >= pointer.seq) return;
					pointers.set(pointer.key, pointer);
					cache = void 0;
					for (const listener of [...listeners]) listener();
				}
			};
		}
		/** Page-lifetime registry that gives all cards of one session the same Store. */
		var CordisRunCardRegistry = class {
			sessions = /* @__PURE__ */ new Map();
			/**
			* Return the persistent page-local Store for a session.
			* @param sessionId - session whose cards share supersession state.
			* @returns the page-local Store retained for that session.
			*/
			forSession(sessionId) {
				let store = this.sessions.get(sessionId);
				if (store === void 0) {
					store = createStore();
					this.sessions.set(sessionId, store);
				}
				return store;
			}
		};
		/**
		* Build the Package business-view key shared by registrations and Run cards.
		* @param pluginId - stable Plugin identity.
		* @param packageId - immutable Package identity.
		* @returns the shared business-view key.
		*/
		function cordisToolViewKey(pluginId, packageId) {
			return `${pluginId}.${packageId}`;
		}
