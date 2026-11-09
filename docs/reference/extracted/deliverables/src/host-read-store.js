// Extracted from @deepseek-ai/dsh-client-ui-deliverables (lib/client.js); region lib/types/client/host-read-store.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Fetch-once cache of Host-served records keyed by their authenticated URL:
* one read per URL while a state stands, cleared on connection replacement,
* cancelled on disposal. Each store decides what a response means and which
* states a later request reads again.
*/
/** One browser plugin's reads of one record kind. */
var HostReadStore = class {
	policy;
	/** Record URLs key the state across Sessions and turns. */
	state = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({});
	lifetime = new AbortController();
	/** The connection generation the current states belong to; a reset aborts it so no older read publishes. */
	generation = new AbortController();
	pending = /* @__PURE__ */ new Set();
	constructor(policy) {
		this.policy = policy;
	}
	/**
	* Read one URL unless a state the policy keeps already stands for it.
	* @param url - the record's authenticated URL.
	* @returns after the state is published.
	*/
	async loadUrl(url) {
		const current = this.state.getSnapshot()[url];
		if (this.lifetime.signal.aborted || current !== void 0 && !this.policy.retryable(current)) return;
		this.state.update((state) => {
			state[url] = this.policy.loading;
		});
		const task = this.read(url, AbortSignal.any([this.lifetime.signal, this.generation.signal]));
		this.pending.add(task);
		try {
			await task;
		} finally {
			this.pending.delete(task);
		}
	}
	/** Forget every state and abandon in-flight reads; a replaced connection may reach a Host that no longer serves them. */
	reset() {
		this.generation.abort();
		this.generation = new AbortController();
		this.state.set({});
	}
	/** Cancel outstanding reads and wait until none can publish state. */
	async dispose() {
		this.lifetime.abort();
		await Promise.all(this.pending);
	}
	async read(url, signal) {
		let next;
		try {
			next = await this.policy.decode(await fetch(url, { signal }));
		} catch {
			next = this.policy.failed;
		}
		if (!signal.aborted) this.state.update((state) => {
			state[url] = next;
		});
	}
};
