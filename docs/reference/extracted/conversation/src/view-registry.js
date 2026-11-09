// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/conversation/view-registry.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Runtime registry of per-target Conversation snapshot builders. */
		var ConversationViewRegistry = class extends ConversationDefinitionRegistry {
			/**
			* Register a uniquely named view builder factory for the caller's lifetime.
			* @param definition - target builder contribution.
			* @returns idempotent disposer.
			*/
			register(definition) {
				return this.registerDefinition(definition.target, definition, `conversation view target "${definition.target}" is already registered`, `uiConversation.views.register(${JSON.stringify(definition.target)})`);
			}
		};
