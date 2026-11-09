// Extracted from @deepseek-ai/dsh-client-ui-commands (lib/client.js); region lib/types/client/resolution.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Select the input spelling for a menu-picked command.
		* @param descriptor - effective Host descriptor.
		* @param t - command-namespace translator.
		* @returns localized spelling for a known definition, otherwise its registered name.
		*/
		function claimToken(descriptor, t) {
			const name = builtinCommandName(descriptor);
			return name === void 0 ? descriptor.name : t(`token.${name}`);
		}
