// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/contract/conversation.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Build a stable collision-free key for one Definition-local business identity.
		* @param kind - Definition kind.
		* @param id - Definition-local business identity.
		* @returns engine-owned Context key.
		*/
		function conversationContextKey(kind, id) {
			return `${kind.length}:${kind}${id}`;
		}
