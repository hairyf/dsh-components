// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/components/AskQuestionCard.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Render a validated ask-user transcript from plain card data.
		* @param props - Localized transcript card data.
		* @returns the readable answered or unanswered question list.
		*/
		function AskQuestionCard({ card }) {
			if (card.kind === "unanswered") return (0, react_jsx_runtime.jsxs)("div", {
				className: AskQuestionCard_module_css_default.card,
				children: [(0, react_jsx_runtime.jsx)("p", {
					className: AskQuestionCard_module_css_default.verdict,
					children: card.verdict
				}), (0, react_jsx_runtime.jsx)("ul", {
					className: AskQuestionCard_module_css_default.questionList,
					children: card.questions.map((question) => (0, react_jsx_runtime.jsx)("li", {
						className: AskQuestionCard_module_css_default.unansweredQuestion,
						children: question.question
					}, question.id))
				})]
			});
			return (0, react_jsx_runtime.jsx)("dl", {
				className: AskQuestionCard_module_css_default.card,
				children: card.questions.map((question) => (0, react_jsx_runtime.jsxs)("div", {
					className: AskQuestionCard_module_css_default.item,
					children: [(0, react_jsx_runtime.jsx)("dt", {
						className: AskQuestionCard_module_css_default.question,
						children: question.question
					}), (0, react_jsx_runtime.jsx)("dd", {
						className: AskQuestionCard_module_css_default.answer,
						children: question.answers.length === 0 ? (0, react_jsx_runtime.jsx)("span", {
							className: AskQuestionCard_module_css_default.skipped,
							children: card.skippedLabel
						}) : question.answers.map((answer, index) => (0, react_jsx_runtime.jsx)("span", {
							className: AskQuestionCard_module_css_default.answerLine,
							children: answer
						}, `${question.id}-${String(index)}`))
					})]
				}, question.id))
			});
		}
