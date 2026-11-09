// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/TurnTailNodeView.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

function lastContent(snapshot, turn, skipWarning) {
	const keys = snapshot.locations.getTurn(turn);
	for (let index = keys.length - 1; index >= 0; index--) {
		const node = snapshot.nodes.get(keys[index]);
		if (node === void 0 || node.kind === "turn-tail" || node.kind === "turn-process" || skipWarning && node.kind === "turn-max-tokens") continue;
		return node;
	}
}
/** Turn-local actions and feature tail over the Location index, independent of Assistant placement. */
const TurnTailNodeView = (0, react.memo)(function TurnTailNodeView({ node, openFile, forkAt, renderSlot, t, useAccess, useChat, usePerformanceUsage }) {
	const detailed = usePerformanceUsage((mode) => mode) === "detailed";
	const forkAllowed = useAccess("session/fork");
	const data = node.data;
	const hasLaterChatNode = useChat((snapshot) => (lastContent(snapshot, data.turn, true)?.anchorSeq ?? -1) > (data.closing?.finalNode.seq ?? data.seq));
	const endsWithResponse = useChat((snapshot) => {
		if (snapshot.timeline.turnOrder.at(-1) !== data.turn) return false;
		const last = lastContent(snapshot, data.turn, false);
		const block = last?.kind === "assistant-step" ? last.data.blocks.findLast((candidate) => candidate.kind !== "text" && candidate.kind !== "reasoning" || candidate.text.trim() !== "") : void 0;
		return block !== void 0 && hasAssistantReplyContent([block]);
	});
	const turn = node.location.kind === "turn" || node.location.kind === "step" ? node.location.turn : void 0;
	if (turn === void 0) return null;
	const closing = data.closing;
	const tail = renderSlot("conversation.chat.turnTail", {
		turn,
		seq: closing?.finalNode.seq ?? data.seq,
		openFile
	});
	if (closing === null) return tail === null ? null : (0, react_jsx_runtime.jsx)("div", {
		className: TurnTailNodeView_module_css_default.root,
		"data-turn-tail": data.turn,
		children: tail
	});
	const messageId = closing.finalNode.messageId;
	const assistantActions = messageId === void 0 ? null : renderSlot("conversation.chat.assistant-actions", { messageId });
	return (0, react_jsx_runtime.jsxs)("div", {
		className: TurnTailNodeView_module_css_default.root,
		"data-turn-tail": data.turn,
		"data-actions-reveal": endsWithResponse ? "always" : "hover",
		children: [tail, (0, react_jsx_runtime.jsx)(MessageIconActions, {
			text: assistantText(closing.blocks),
			time: closing.time,
			clock: "end",
			onBranch: forkAllowed ? () => {
				forkAt(data.seq);
			} : void 0,
			branchUnavailable: data.branchUnavailable || hasLaterChatNode,
			className: TurnTailNodeView_module_css_default.actions,
			extraActions: assistantActions,
			usageAction: detailed && data.tokenUsage !== void 0 ? (0, react_jsx_runtime.jsx)(TurnUsagePanel, {
				usage: data.tokenUsage,
				t
			}) : null,
			t
		})]
	});
});
