// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/CompactionCommandCard.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Render one manual compaction lifecycle without duplicating its checkpoint marker. */
function CompactionCommandCard({ node, compaction, t }) {
	if (compaction !== void 0) return (0, react_jsx_runtime.jsx)(CompactionItem, {
		node: compaction,
		title: t("message.compaction.commandTitle"),
		fallbackSummary: node.outcome?.text ?? null,
		t
	});
	if (node.outcome !== null) return (0, react_jsx_runtime.jsx)(GenericCommandCard, {
		node,
		t
	});
	return (0, react_jsx_runtime.jsx)(GenericCommandCard, {
		node,
		t,
		runningSummary: t("message.compaction.running")
	});
}
