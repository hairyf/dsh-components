// Extracted from @deepseek-ai/dsh-client-ui-approval (lib/client.js); region lib/types/client/ApprovalPanel.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render the shared card using the tool approval's one-shot decision policy.
* @param props Selector-matched request and standard Slot props.
* @returns The approval composer takeover.
*/
function ApprovalPanel(props) {
	const approval = props.matched;
	const reason = approval.displayReason === void 0 ? approval.reason : props.resolveReason(approval.displayReason);
	return props.renderFactorySlot("conversation.approval.card", {
		requestKey: approval.key,
		title: reason ?? props.t("escalation", { toolName: approval.toolName }),
		...approval.callId === void 0 ? {} : { callId: approval.callId },
		canAnswer: () => approval.answerable,
		onAllow: () => approval.answer("allowed-once"),
		onReject: () => approval.answer("rejected")
	});
}
