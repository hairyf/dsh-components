// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/conversation/definition-registry.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Shared lifecycle and stable-entry storage for one Conversation Definition registry. */
var ConversationDefinitionRegistry = class {
	ctx;
	definitions = /* @__PURE__ */ new Map();
	listeners = /* @__PURE__ */ new Set();
	cached = [];
	/** @param ctx - Context whose effects own contributed Definitions. */
	constructor(ctx) {
		this.ctx = ctx;
		Object.defineProperty(this, _deepseek_ai_cordis.Service.tracker, { value: { property: "ctx" } });
	}
	/**
	* Return reference-stable Definitions in registration order.
	* @returns current Definitions.
	*/
	entries() {
		return this.cached;
	}
	/**
	* Observe low-frequency registry changes.
	* @param listener - synchronous invalidation callback.
	* @returns unsubscribe callback.
	*/
	subscribe(listener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
	/**
	* Register one uniquely keyed Definition for the caller's lifetime.
	* @param key - registry-local unique key.
	* @param definition - contributed Definition.
	* @param duplicateMessage - error raised when the key is already owned.
	* @param effectName - Cordis effect diagnostic label.
	* @returns idempotent disposer.
	*/
	registerDefinition(key, definition, duplicateMessage, effectName) {
		if (this.definitions.has(key)) throw new Error(duplicateMessage);
		const dispose = this.ctx.effect(() => {
			this.definitions.set(key, definition);
			this.refresh();
			return () => {
				if (this.definitions.get(key) !== definition) return;
				this.definitions.delete(key);
				this.refresh();
			};
		}, effectName);
		return () => {
			dispose();
		};
	}
	/** Refresh cached entries and synchronously invalidate subscribers. */
	refresh() {
		this.cached = [...this.definitions.values()];
		(0, _deepseek_ai_dsh_client_store.notifySubscribers)(this.listeners, "[ui-conversation] definition registry");
	}
};
