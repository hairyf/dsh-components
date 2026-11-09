// Extracted from @deepseek-ai/dsh-client-ui-sidebar-right (lib/client.js); region lib/types/client/tab-inventory.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Metadata inventory of saved and adopted layouts without mounting their content. */
		/** Derived membership only; layout stores remain the persisted authority. */
		var SidebarTabInventory = class {
			sessions = /* @__PURE__ */ new Map();
			snapshot = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)([]);
			/** Read-only metadata observable shared with content providers. */
			source = this.snapshot;
			/** Read saved layouts once before the root service is published. */
			constructor() {
				try {
					if (typeof localStorage === "undefined") return;
					const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
					for (const key of keys) {
						if (key === null || !key.startsWith(`dsh.sidebar-right.v1.`)) continue;
						const sessionId = key.slice(21);
						const saved = readSidebarLayout(sessionId);
						if (saved !== void 0) this.sessions.set(sessionId, Object.values(saved.layout.tabs).map((tab) => ({
							sessionId,
							tabId: tab.id,
							kind: tab.kind,
							contentId: tab.contentId
						})));
					}
					this.publish();
				} catch (_storageUnavailable) {}
			}
			/**
			* Replace membership from the authoritative in-window store.
			* @param sessionId - adopted Session.
			* @param tabs - current committed records.
			*/
			update(sessionId, tabs) {
				this.sessions.set(sessionId, tabs.map((tab) => ({
					sessionId,
					tabId: tab.id,
					kind: tab.kind,
					contentId: tab.contentId
				})));
				this.publish();
			}
			/**
			* Forget a permanently cleared scope.
			* @param sessionId - removed Session scope.
			*/
			remove(sessionId) {
				this.sessions.delete(sessionId);
				this.publish();
			}
			publish() {
				const next = [...this.sessions.values()].flat();
				if (JSON.stringify(next) !== JSON.stringify(this.snapshot.getSnapshot())) this.snapshot.set(next);
			}
		};
