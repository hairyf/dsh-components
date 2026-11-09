// Extracted from @deepseek-ai/dsh-client-ui-secret-mask (lib/client.js); region lib/types/client/secret-rule.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Create the credential matcher. Each instance owns a scanner whose memo holds
		* the last queried text until a query for another text.
		* @returns the `secret` rule; it reads no Facts, so Facts changes never invalidate its queries.
		*/
		function createSecretRule() {
			const scanner = new CredentialScanner(formatTables());
			return {
				id: "secret",
				order: 0,
				match: (text, from) => scanner.match(text, from)
			};
		}
