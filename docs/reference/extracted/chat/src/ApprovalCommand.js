// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/ApprovalCommand.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Extract a shell command from a correlated Tool call when its arguments carry one.
* @param call - Tool call arguments, when a correlated call exists.
* @returns command text, or undefined for absent, malformed, or unrelated arguments.
*/
function commandOf(call) {
	if (call === void 0) return void 0;
	try {
		const args = JSON.parse(call.argsRaw);
		return typeof args.command === "string" ? args.command : void 0;
	} catch {
		return;
	}
}
/**
* Render the command of the Chat Tool node correlated with an approval.
* @param props - Approval identity and Session-standard Chat selector hook.
* @returns command text when the correlated call carries one.
*/
function ApprovalCommand({ callId, useChat }) {
	return useChat((snapshot) => {
		for (const node of snapshot.nodes.values()) {
			const root = node.kind === "tool-call" ? node.data.root : void 0;
			if (root !== void 0 && root.callId === callId && !("kind" in root) && root.phase === "start") return commandOf(root);
		}
	}) ?? null;
}
