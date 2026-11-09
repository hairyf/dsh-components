// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/contract/snapshot.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Empty Conversation value used before a Session binding is available. */
const EMPTY_CONVERSATION_SNAPSHOT = {
	views: {
		get: () => void 0,
		grouped: () => void 0
	},
	activeTargets: /* @__PURE__ */ new Set()
};
/**
* Resolve the shell phase without adding Conversation data to the Session snapshot.
* @param session - current Session lifecycle state.
* @param conversation - current target-neutral Conversation state.
* @returns the phase used by the header, View ring, and composer layout.
*/
function conversationPhase(session, conversation) {
	return conversation.activeTargets.size > 0 || !session.blank && !session.awaitingFirstTurn || session.running ? "active" : session.promptAttempted ? "engaging" : "blank";
}
