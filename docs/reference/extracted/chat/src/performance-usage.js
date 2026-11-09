// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/performance-usage.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Performance detail preference, live immediately and reconciled with accepted Host settings. */
/** Shared live preference for the settings row and chat statistics. */
var PerformanceUsagePolicy = class {
	host;
	unsubscribe;
	/** Current choice, reconciled with accepted Host settings when available. */
	mode = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(DEFAULT_PERFORMANCE_USAGE);
	/** @param host - Chat settings scope persisted through the Host. */
	constructor(host) {
		this.host = host;
		const adopt = () => {
			const accepted = host.getSnapshot().value?.performanceUsage;
			if (accepted !== void 0) this.mode.set(accepted);
		};
		this.unsubscribe = host.subscribe(adopt);
		adopt();
	}
	/** Release the accepted-value subscription. */
	dispose() {
		this.unsubscribe();
	}
	/**
	* Publish a choice immediately and queue its Host write.
	* @param mode - Statistics detail selected by the user.
	*/
	setMode(mode) {
		if (mode === this.mode.getSnapshot()) return;
		this.mode.set(mode);
		this.host.set("performanceUsage", mode);
	}
};
