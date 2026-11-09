// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/conversation-nodes/compaction.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

function fallbackState$3(context) {
	const summary = context.matches.find((match) => match.event.type === "compaction/summary");
	const checkpoint = context.matches.find((match) => compactSource(match.event) !== void 0);
	return {
		...summary === void 0 ? {} : { summary },
		...checkpoint === void 0 ? {} : { checkpoint }
	};
}
/** Automatic compaction lifecycle and landed checkpoint Definition. */
const compactionDefinition = {
	kind: "compaction",
	target: "chat",
	match: (event) => {
		const checkpoint = compactSource(event);
		if (checkpoint !== void 0 && checkpoint.sourceCommandId === void 0) return {
			id: checkpoint.compactionId,
			role: "update"
		};
		if (event.type === "compaction/start" || event.type === "compaction/summary" || event.type === "compaction/end") {
			if (event.data.sourceCommandId !== void 0) return null;
			const compactionId = event.data.compactionId;
			if (typeof compactionId !== "string" || compactionId === "") return null;
			return {
				id: compactionId,
				role: event.type === "compaction/start" ? "start" : "update"
			};
		}
		return null;
	},
	start: () => ({}),
	update: (context, match) => updateCompactionState(context.state, match),
	buildViewNode: (context) => {
		const state = context.state ?? fallbackState$3(context);
		if (state.checkpoint === void 0) return null;
		const marker = compactSummary(state.summary, state.checkpoint);
		return chatNode(context, "compaction", marker.seq, marker);
	}
};
/**
* Register the automatic-compaction business contribution.
* @param ctx - owning UI Conversation context.
*/
function registerCompactionConversationNode(ctx) {
	ctx.uiConversation.events.register(compactionDefinition);
}
