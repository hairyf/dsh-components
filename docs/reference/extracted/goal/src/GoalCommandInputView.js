// Extracted from @deepseek-ai/dsh-client-ui-goal (lib/client.js); region lib/types/client/GoalCommandInputView.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		const GOAL_COMMANDS = [{
			start: 0,
			end: 5,
			name: GOAL_COMMAND
		}];
		/**
		* Right-aligned `/goal` input bubble without ordinary message actions. The
		* echoed line decorates its leading `/goal` token as a command chip — the run
		* this Node projects is the fact that that token was a command — and keeps
		* the objective, `/goal` mentions included, as plain text.
		*/
		const GoalCommandInputView = (0, react.memo)(function GoalCommandInputView({ node, t, renderFactorySlot }) {
			const data = node.data;
			return (0, react_jsx_runtime.jsx)("div", {
				className: GoalCommandInputView_module_css_default.row,
				"data-command-input": "",
				role: "group",
				"aria-label": t("commandInput.aria"),
				children: (0, react_jsx_runtime.jsx)("div", {
					className: GoalCommandInputView_module_css_default.stack,
					children: (0, react_jsx_runtime.jsx)("div", {
						className: GoalCommandInputView_module_css_default.bubble,
						children: renderFactorySlot("conversation.user.text", {
							text: data.text,
							facts: { commands: GOAL_COMMANDS },
							interactive: false
						})
					})
				})
			});
		});
