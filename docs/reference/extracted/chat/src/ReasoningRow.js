// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/ReasoningRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Assistant reasoning disclosure, independent of Tool-call presentation. */
const THINK_ICON = (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconThinkOutlineRegular, { size: 14 });
function firstLine(text) {
	const newline = text.indexOf("\n");
	return newline === -1 ? text : text.slice(0, newline);
}
function latestCompletedParagraphFirstLine(text) {
	let summary = "";
	let paragraphStart = 0;
	const separator = /\r?\n(?:[\t ]*\r?\n)+/g;
	while (true) {
		const nextParagraph = separator.exec(text);
		const paragraphEnd = nextParagraph === null ? text.length : nextParagraph.index + nextParagraph[0].indexOf("\n");
		const newline = text.indexOf("\n", paragraphStart);
		if (newline !== -1 && newline <= paragraphEnd) {
			const candidate = text.slice(paragraphStart, newline).trim();
			if (candidate !== "") summary = candidate;
		}
		if (nextParagraph === null) return summary;
		paragraphStart = nextParagraph.index + nextParagraph[0].length;
	}
}
/**
* Render one assistant reasoning block collapsed until the reader opens it. The
* collapsed summary omits double-asterisk markers; expanded content renders
* the complete Markdown with secondary typography. A streaming preview advances
* when a paragraph's first line completes. Mode changes toggle CSS display without unmounting
* collapsed summaries. The Body Slot receives both original and display-ready text.
* @param props.text - complete or streaming reasoning text.
* @param props.running - whether this block is the streaming tail.
* @param props.usePresentation - live display-policy selector for this reasoning row.
* @param props.useDisclosure - independent open state with enclosing-Turn resets.
* @param props.renderSlot - framework renderer for the standard reasoning Body Slot.
* @param props.t - conversation locale seat for the disclosure and running status.
* @returns the reasoning disclosure.
*/
const ReasoningRow = (0, react.memo)(function ReasoningRow({ text: rawText, running, textInteractionSource = false, usePresentation, useDisclosure, renderSlot, t }) {
	const { expanded, toggle } = useDisclosure();
	const { text, hidden } = (0, react.useMemo)(() => {
		const text = reasoningText(rawText);
		return {
			text,
			hidden: text !== rawText && text.trim() === ""
		};
	}, [rawText]);
	const summaryText = running ? latestCompletedParagraphFirstLine(text) : firstLine(text);
	const summary = (0, react.useMemo)(() => summaryText.replaceAll("**", ""), [summaryText]);
	const preview = usePresentation((policy) => !expanded && summary !== "" && (running || policy.settledReasoningPreview));
	const collapsedContent = (0, react.useMemo)(() => (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
		className: ReasoningRow_module_css_default.separator,
		"data-shimmer-decoration": true,
		"aria-hidden": true
	}), (0, react_jsx_runtime.jsx)("span", {
		className: ReasoningRow_module_css_default.summary,
		"data-streaming": running || void 0,
		children: (0, react_jsx_runtime.jsx)("span", {
			className: ReasoningRow_module_css_default.summaryText,
			children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, { children: summary })
		})
	})] }), [running, summary]);
	const content = (0, react.useMemo)(() => expanded ? (0, react_jsx_runtime.jsx)("div", {
		className: ReasoningRow_module_css_default.thinkBody,
		"data-text-interaction-source": textInteractionSource && !running ? "" : void 0,
		children: renderSlot("conversation.chat.reasoning.body", {
			rawText,
			text,
			running
		})
	}) : void 0, [
		expanded,
		renderSlot,
		running,
		rawText,
		text,
		textInteractionSource
	]);
	if (hidden) return null;
	return (0, react_jsx_runtime.jsxs)("div", {
		className: ReasoningRow_module_css_default.root,
		"data-variant": "think",
		"data-state": running ? "running" : "ok",
		"data-expanded": expanded || void 0,
		"data-preview": preview || void 0,
		children: [running && (0, react_jsx_runtime.jsx)("span", {
			className: accessibility_module_css_default.visuallyHidden,
			children: t("row.running")
		}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DisclosureRow, {
			rowClassName: ReasoningRow_module_css_default.row,
			leadingClassName: ReasoningRow_module_css_default.leading,
			titleClassName: ReasoningRow_module_css_default.title,
			icon: THINK_ICON,
			title: t("message.think"),
			running,
			open: expanded,
			expandable: true,
			expandOnRowClick: true,
			onToggle: toggle,
			collapsedContent,
			children: content
		})]
	});
});
