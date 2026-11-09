// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/input/blocks.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Composer blocks: the one way another plugin stops a session's input.
*
* The composer cannot read the plugins that would know — the dependency runs
* ui-model-selection → ui-conversation, never back — so a blocker pushes here and the
* bar reads its own session's store. A block carries the localized reason it
* exists, because the plugin that raised it owns that copy; the composer only
* knows how to render an inert textarea with a placeholder, exactly as it
* already does for a session with no workspace.
*
* This is an affordance, not enforcement: the Host refuses a prompt it cannot
* route regardless of what any client disables.
*/
/** The per-session composer-block registry (one instance per plugin fiber). */
var ComposerBlockRegistry = class {
	stores = /* @__PURE__ */ new Map();
	/** @inheritdoc */
	set(sessionId, block) {
		const store = this.storeFor(sessionId);
		if (store.getSnapshot()?.reason === block?.reason) return;
		store.set(block);
	}
	/** @inheritdoc */
	storeFor(sessionId) {
		const existing = this.stores.get(sessionId);
		if (existing !== void 0) return existing;
		const created = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(void 0);
		this.stores.set(sessionId, created);
		return created;
	}
	/** @inheritdoc */
	forget(sessionId) {
		this.stores.delete(sessionId);
	}
};
