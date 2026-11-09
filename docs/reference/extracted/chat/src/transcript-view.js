// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/transcript-view.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Independent work-details preferences backed by the same Host configuration form. */
/** Live work-details preference consumed by Chat and its Settings row. */
var TranscriptViewPolicy = class {
	host;
	defaultMode;
	unsubscribe;
	/** Reactive current mode, including the client default before Host settings arrive. */
	mode;
	/** Reactive collapse timing, defaulting to completion until Host settings arrive. */
	collapseTiming = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(DEFAULT_COLLAPSE_TIMING);
	/** Reactive folded-reply choice, keeping every reply until Host settings arrive. */
	foldedReplies = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)("all");
	/**
	* @param host - durable Chat settings scope.
	* @param defaultMode - presentation used without an explicit saved mode.
	*/
	constructor(host, defaultMode = DEFAULT_TRANSCRIPT_VIEW_MODE) {
		this.host = host;
		this.defaultMode = defaultMode;
		this.mode = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(defaultMode);
		this.unsubscribe = host.subscribe(() => {
			this.adopt();
		});
		this.adopt();
	}
	/** Release the accepted-value subscription. */
	dispose() {
		this.unsubscribe();
	}
	/**
	* Publish and persist one explicit user choice.
	* @param mode - Compact, Standard, Detailed, or Verbose work details.
	*/
	setMode(mode) {
		if (this.mode.getSnapshot() === mode) return;
		this.mode.set(mode);
		this.host.set(TRANSCRIPT_VIEW_FIELD, mode);
	}
	/**
	* Publish and persist collapse timing without changing the work-details mode.
	* @param timing - immediate completion folding or deferred folding at the next input.
	*/
	setCollapseTiming(timing) {
		if (this.collapseTiming.getSnapshot() === timing) return;
		this.collapseTiming.set(timing);
		this.host.set(COLLAPSE_TIMING_FIELD, timing);
	}
	/**
	* Publish and persist which Assistant replies stay visible in a folded Turn.
	* @param replies - every reply, or only the final answer.
	*/
	setFoldedReplies(replies) {
		if (this.foldedReplies.getSnapshot() === replies) return;
		this.foldedReplies.set(replies);
		this.host.set(FOLDED_REPLIES_FIELD, replies);
	}
	/** Adopt the latest accepted Host section without writing it back. */
	adopt() {
		const section = this.host.getSnapshot().value;
		if (section === void 0) return;
		const saved = section.transcriptView;
		const mode = saved === "normal" || saved === "expanded" ? "detailed" : saved ?? this.defaultMode;
		if (this.mode.getSnapshot() !== mode) this.mode.set(mode);
		const timing = section.collapseTiming ?? "completion";
		if (this.collapseTiming.getSnapshot() !== timing) this.collapseTiming.set(timing);
		const replies = section.foldedReplies ?? "all";
		if (this.foldedReplies.getSnapshot() !== replies) this.foldedReplies.set(replies);
	}
};
