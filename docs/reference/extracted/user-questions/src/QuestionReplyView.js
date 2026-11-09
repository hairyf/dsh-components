// Extracted from @deepseek-ai/dsh-client-ui-user-questions (lib/client.js); region lib/types/client/QuestionReplyView.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Settled question batches rendered with the shared user-message surface. */
/** Render recorded questions and answers without an expandable process row. */
const QuestionReplyView = (0, react.memo)(function QuestionReplyView({ node, t }) {
	return (0, react_jsx_runtime.jsx)(QuestionReplyBubble, {
		data: node.data,
		t
	});
});
/**
* Render one answered batch with questions above their corresponding answers.
* @param props - Reply data and the question locale translator.
* @returns The right-aligned, fully visible question-and-answer bubble.
*/
function QuestionReplyBubble({ data, t }) {
	const { copied, onCopy } = (0, _deepseek_ai_dsh_client_ui_primitives.useClipboardCopy)(replyClipboardText(data, t));
	return (0, react_jsx_runtime.jsxs)("div", {
		className: QuestionReplyView_module_css_default.row,
		"data-question-reply": data.callId,
		"data-reply-outcome": data.outcome,
		role: "group",
		"aria-label": t("reply.label"),
		children: [(0, react_jsx_runtime.jsx)("div", {
			className: QuestionReplyView_module_css_default.bubbleWidth,
			children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.UserMessageBubble, {
				className: QuestionReplyView_module_css_default.bubble,
				children: data.questions.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
					className: QuestionReplyView_module_css_default.text,
					children: data.text
				}) : (0, react_jsx_runtime.jsx)("dl", {
					className: QuestionReplyView_module_css_default.details,
					children: data.questions.map((question) => {
						const values = replyAnswerValues(data, question.id);
						return (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsxs)("dt", {
							className: QuestionReplyView_module_css_default.question,
							children: [question.header && question.header !== question.question && (0, react_jsx_runtime.jsx)("span", {
								className: QuestionReplyView_module_css_default.header,
								children: question.header
							}), (0, react_jsx_runtime.jsx)("span", { children: question.question })]
						}), (0, react_jsx_runtime.jsx)("dd", {
							className: QuestionReplyView_module_css_default.answer,
							children: values.length === 0 ? t("reply.skipped") : values.join(", ")
						})] }, question.id);
					})
				})
			})
		}), (0, react_jsx_runtime.jsxs)("div", {
			className: QuestionReplyView_module_css_default.actions,
			children: [(0, react_jsx_runtime.jsx)("span", {
				className: QuestionReplyView_module_css_default.time,
				children: new Intl.DateTimeFormat(void 0, {
					hour: "2-digit",
					minute: "2-digit",
					hour12: false
				}).format(data.time)
			}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: copied ? t("copied") : t("copy"),
				side: "bottom",
				children: (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: QuestionReplyView_module_css_default.action,
					"aria-label": copied ? t("copied") : t("copy"),
					onClick: onCopy,
					children: copied ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCopyOutlineRegular, {})
				})
			})]
		})]
	});
}
