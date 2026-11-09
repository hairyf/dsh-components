// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/reasoning-text.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Display text preparation for model reasoning. */
/**
* Prepare complete or streaming reasoning for display.
* @param text - original complete or streaming reasoning.
* @returns display text, or empty text when no displayable content is available.
*/
function reasoningText(text) {
	if (text[0] !== "<") return text;
	/* v8 ignore start -- Custom rendering behavior is outside unit coverage. */
	const opening = "<signature>";
	if (opening.startsWith(text)) return "";
	if (!text.startsWith(opening)) return text;
	const end = text.indexOf("</signature>", 11);
	if (end === -1) return "";
	let start = end + 12;
	while (start < text.length) if (text[start] === "\n") start++;
	else if (text[start] === "\r" && text[start + 1] === "\n") start += 2;
	else break;
	return text.slice(start);
	/* v8 ignore stop */
}
