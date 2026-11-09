// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/authorize-url.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Platform authorization links that carry the active application palette into the login page. */
		/**
		* Add the resolved application palette to a Platform authorization link without
		* dropping any parameter the Host already put on it.
		* @param authorizeUrl - authorization URL of the current account attempt.
		* @param colorScheme - resolved scheme of the active application theme.
		* @returns the authorization URL carrying `theme=light` or `theme=dark`.
		*/
		function authorizeUrlWithTheme(authorizeUrl, colorScheme) {
			const url = new URL(authorizeUrl);
			url.searchParams.set("theme", colorScheme);
			return url.href;
		}
