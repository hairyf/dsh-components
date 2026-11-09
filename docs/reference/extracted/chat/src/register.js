// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/conversation-nodes/register.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Register the Chat business Definitions and target builder contributed by this package.
* @param ctx - owning UI Conversation context.
*/
function registerConversationNodes(ctx) {
	registerInboxConversationNodes(ctx);
	registerMessageConversationNode(ctx);
	registerRequestPromptConversationNode(ctx);
	registerAssistantConversationNode(ctx);
	registerTurnProcess(ctx);
	registerToolConversationNode(ctx);
	registerCommandConversationNode(ctx);
	registerCompactionConversationNode(ctx);
	registerRetryConversationNode(ctx);
	registerTurnErrorConversationNode(ctx);
	registerTurnMaxTokensConversationNode(ctx);
	registerTurnTailConversationNode(ctx);
	registerUnknownConversationFallback(ctx);
	registerChatConversationView(ctx);
	ctx.uiConversation.groups.register(processGroupDefinition);
}
