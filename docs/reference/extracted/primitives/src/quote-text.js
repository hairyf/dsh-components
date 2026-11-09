// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/markdown/quote-text.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Shared Markdown blockquote formatting for browser text. */
/**
* Project selected visible text as an ordinary Markdown blockquote.
* @param text - selected visible text without quote markers.
* @returns one `> `-prefixed line per normalized input line.
*/
function formatQuoteText(text) {
	return text.replace(/\r\n?/gu, "\n").split("\n").map((line) => `> ${line}`).join("\n");
}
