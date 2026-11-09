// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/turn-assistant.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Collect visible prose from one Assistant lifecycle.
* @param blocks - Assistant content blocks.
* @returns concatenated text blocks.
*/
function assistantText(blocks) {
	return blocks.flatMap((block) => block.kind === "text" ? [block.text] : []).join("");
}
