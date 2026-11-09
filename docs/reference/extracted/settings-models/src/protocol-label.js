// Extracted from @deepseek-ai/dsh-client-ui-settings-models (lib/client.js); region lib/types/client/protocol-label.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Product names for the wire protocols a pi-ai route may speak. The pickers
		* show these instead of the schema identifiers (`openai-completions`), which
		* are what `settings.yaml` carries and what the option values stay.
		*/
		/** The protocols this page names, keyed by their schema identifier. */
		const PROTOCOL_LABEL_KEYS = {
			"openai-completions": "protocolOpenAiCompletions",
			"openai-responses": "protocolOpenAiResponses",
			"anthropic-messages": "protocolAnthropicMessages"
		};
		/**
		* The picker text for one protocol identifier.
		* @param t - section copy.
		* @param protocol - the schema identifier of the protocol.
		* @returns the product name this page knows the protocol by; a protocol the
		* adapter adds before this page names it shows its identifier, the spelling
		* `settings.yaml` needs anyway.
		*/
		function protocolLabel(t, protocol) {
			const key = PROTOCOL_LABEL_KEYS[protocol];
			return key === void 0 ? protocol : t(key);
		}
