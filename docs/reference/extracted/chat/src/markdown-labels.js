// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/markdown-labels.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Localized copy adapters for Cordis-free Markdown primitives. */
/**
* Build the complete Markdown chrome copy for one locale revision.
* @param t - Chat locale seat.
* @returns Labels for code fences and footnotes.
*/
function markdownLabels(t) {
	return {
		code: {
			copyLabel: t("copy"),
			copiedLabel: t("copied"),
			toolbarLabels: {
				codeLabel: t("codeBlock.title"),
				wrapLabel: t("codeBlock.wrap"),
				unwrapLabel: t("codeBlock.unwrap")
			}
		},
		footnotes: t("markdown.footnotes")
	};
}
