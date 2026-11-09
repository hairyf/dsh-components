// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/CompactionItem.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Renders the model-history compaction marker.
* @param props - the marker node off the snapshot cache.
* @returns the marker row, with the summary disclosure when one is available.
*/
const CompactionItem = (0, react.memo)(function CompactionItem({ node, title, fallbackSummary, t }) {
	const [expanded, setExpanded] = (0, react.useState)(false);
	const labels = (0, react.useMemo)(() => markdownLabels(t), [t]);
	const expandable = node.summary !== null;
	const open = expandable && expanded;
	const summary = node.shadowedItemCount !== null && node.shadowedTokenCount !== null ? t("message.compaction.completed", {
		items: node.shadowedItemCount,
		tokens: node.shadowedTokenCount
	}) : fallbackSummary ?? (expandable ? t("message.compaction.expand") : t("message.compaction.unavailable"));
	return (0, react_jsx_runtime.jsxs)("div", {
		className: MessageItem_module_css_default.compactionRow,
		children: [(0, react_jsx_runtime.jsxs)("button", {
			type: "button",
			className: MessageItem_module_css_default.compactionButton,
			disabled: !expandable,
			"aria-expanded": expandable ? open : void 0,
			onClick: () => {
				setExpanded((value) => !value);
			},
			children: [
				(0, react_jsx_runtime.jsxs)("span", {
					className: MessageItem_module_css_default.compactionLeading,
					"aria-hidden": true,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: MessageItem_module_css_default.compactionContextIcon,
						"data-compaction-icon": "context",
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconApiOutlineRegular, {})
					}), (0, react_jsx_runtime.jsx)("span", {
						className: MessageItem_module_css_default.compactionDisclosureIcon,
						"data-compaction-disclosure": open ? "expanded" : "collapsed",
						children: open ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {})
					})]
				}),
				(0, react_jsx_runtime.jsx)("span", {
					className: MessageItem_module_css_default.compactionTitle,
					children: title ?? t("message.compaction")
				}),
				(0, react_jsx_runtime.jsx)("span", {
					className: MessageItem_module_css_default.compactionSep,
					"aria-hidden": true
				}),
				(0, react_jsx_runtime.jsx)("span", {
					className: MessageItem_module_css_default.compactionSummary,
					children: summary
				})
			]
		}), open && node.summary !== null && (0, react_jsx_runtime.jsx)("div", {
			className: MessageItem_module_css_default.compactionBody,
			children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
				text: node.summary,
				labels
			})
		})]
	});
});
