// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/conversation-nodes/fallback.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Unclaimed append-surface fallback Definition. */
const unknownFallbackDefinition = {
	kind: "unknown-surface",
	target: "chat",
	match: (event) => event.type !== "assistant/live-chunk" && isAppendSurfaceEvent(event) ? {
		id: String(event.seq),
		role: "start"
	} : null,
	start: (_context, match) => ({
		kind: "unknown",
		seq: match.event.seq,
		time: match.event.time,
		type: match.event.type,
		data: match.event.data
	}),
	update: (context) => context.state,
	buildViewNode: (context) => context.state === void 0 ? null : chatNode(context, "unknown", context.state.seq, context.state)
};
/**
* Register the unmatched append-surface fallback contribution.
* @param ctx - owning UI Conversation context.
*/
function registerUnknownConversationFallback(ctx) {
	ctx.uiConversation.events.registerFallback(unknownFallbackDefinition);
}
