// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/stores.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Per-session Conversation store shared by the shell body and header. */
		const CONVERSATION_STORE_KEY = "dsh.conversation";
		/**
		* Declare per-session draft persistence and View selection.
		* @returns the store handle.
		*/
		function createConversationStore() {
			return (0, _deepseek_ai_dsh_client_store.defineStore)({
				init: () => ({
					draft: "",
					view: null,
					viewRequest: null
				}),
				persist: CONVERSATION_STORE_KEY,
				actions: {
					setDraft: (d, text) => {
						d.draft = text;
					},
					setView: (d, view) => {
						d.view = view;
					},
					openView: (d, view, focus) => {
						d.view = view;
						d.viewRequest = {
							view,
							focus
						};
					},
					completeViewRequest: (d) => {
						d.viewRequest = null;
					}
				}
			});
		}
		/**
		* Read a Session's draft before its input source is published to React.
		* @param sessionId - Session-scoped persistence suffix.
		* @returns saved semantic content, or an empty document when storage is absent or invalid.
		*/
		function readConversationDraft(sessionId) {
			const empty = {
				text: "",
				references: []
			};
			if (typeof localStorage === "undefined") return empty;
			try {
				const raw = localStorage.getItem(`${CONVERSATION_STORE_KEY}.${sessionId}`);
				if (raw === null) return empty;
				const stored = JSON.parse(raw);
				if (typeof stored !== "object" || stored === null || !("draft" in stored)) return empty;
				return parseStoredDraft(stored.draft) ?? empty;
			} catch (_error) {
				return empty;
			}
		}
		/**
		* Read the persisted View preference before the Slot store is materialized.
		* @param sessionId - Session-scoped persistence suffix.
		* @returns the preferred View id, or null when storage has no usable value.
		*/
		function readConversationViewPreference(sessionId) {
			if (typeof localStorage === "undefined") return null;
			try {
				const raw = localStorage.getItem(`${CONVERSATION_STORE_KEY}.${sessionId}`);
				if (raw === null) return null;
				const stored = JSON.parse(raw);
				if (typeof stored !== "object" || stored === null || !("view" in stored)) return null;
				return typeof stored.view === "string" ? stored.view : null;
			} catch {
				return null;
			}
		}
