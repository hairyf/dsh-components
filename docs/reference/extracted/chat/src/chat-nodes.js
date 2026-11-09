// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/contract/chat-nodes.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Test whether a Tool root has settled.
* @param block - Tool root lifecycle value.
* @returns whether the root carries its final result.
*/
function isSettledTool(block) {
	return "kind" in block;
}
/**
* Test whether a Tool root is still running.
* @param block - Tool root lifecycle value.
* @returns whether the root lacks a final result.
*/
function isRunningTool(block) {
	return !isSettledTool(block);
}
