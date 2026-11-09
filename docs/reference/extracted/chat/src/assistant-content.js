// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/contract/assistant-content.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Test whether Assistant blocks contain a user-facing reply rather than only
* reasoning or Tool-call protocol material.
* @param blocks - Assistant content blocks.
* @returns whether the blocks contain visible reply content.
*/
function hasAssistantReplyContent(blocks) {
	return blocks.some((block) => {
		if (block.kind === "reasoning" || block.kind === "tool-call") return false;
		if (block.kind === "text") return block.text.trim() !== "";
		return true;
	});
}
