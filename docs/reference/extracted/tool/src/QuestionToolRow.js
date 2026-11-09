// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/components/QuestionToolRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Question-owned summary action and transcript disclosure. */
/**
* Render a question with its answer-panel entry point.
* @param props - Question transcript, panel action, and disclosure state.
* @returns The question's summary and optional expanded record.
*/
function QuestionToolRow({ useDisclosure, t, summary, bodyRaw, output, askQuestion, state, inspect, openPanel, panelLabel }) {
	const { expanded, toggle } = useDisclosure();
	const expandable = bodyRaw != null || output != null || askQuestion != null;
	const open = expanded && expandable;
	return (0, react_jsx_runtime.jsxs)("div", {
		className: ToolRow_module_css_default.root,
		"data-variant": "others",
		"data-tool": "ask_user_question",
		"data-state": state,
		children: [state === "running" && (0, react_jsx_runtime.jsx)("span", {
			className: ToolRow_module_css_default.visuallyHidden,
			children: t("row.running")
		}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DisclosureRow, {
			rowClassName: ToolRow_module_css_default.row,
			leadingClassName: ToolRow_module_css_default.leading,
			titleClassName: ToolRow_module_css_default.title,
			chevronClassName: ToolRow_module_css_default.chevron,
			icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconQuestionOutlineRegular, {}),
			title: t("ask.rowTitle"),
			running: state === "running",
			open,
			expandable,
			keepContentWhenOpen: true,
			onToggle: toggle,
			collapsedContent: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [summary !== "" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
				className: ToolRow_module_css_default.sep,
				"aria-hidden": true
			}), (0, react_jsx_runtime.jsx)("span", {
				className: ToolRow_module_css_default.summary,
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, {
					active: state === "running",
					children: summary
				})
			})] }), (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: QuestionToolRow_module_css_default.panelButton,
				onClick: (event) => {
					event.stopPropagation();
					if (!openPanel()) toggle();
				},
				onKeyDown: (event) => {
					if (event.key === "Enter" || event.key === " ") event.stopPropagation();
				},
				children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconQuestionOutlineRegular, {}), panelLabel]
			})] }),
			children: open && (0, react_jsx_runtime.jsxs)("div", {
				className: ToolRow_module_css_default.bodyWrap,
				children: [askQuestion != null ? (0, react_jsx_runtime.jsx)(AskQuestionCard, { card: askQuestion }) : (0, react_jsx_runtime.jsxs)("div", {
					className: ToolRow_module_css_default.ioCard,
					children: [
						bodyRaw != null && (0, react_jsx_runtime.jsxs)("div", {
							className: ToolRow_module_css_default.ioSection,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: ToolRow_module_css_default.ioLabel,
								children: t("row.input")
							}), (0, react_jsx_runtime.jsx)("span", {
								className: ToolRow_module_css_default.ioText,
								children: formatToolBody("others", bodyRaw)
							})]
						}),
						bodyRaw != null && output != null && (0, react_jsx_runtime.jsx)("span", {
							className: ToolRow_module_css_default.ioDivider,
							"aria-hidden": true
						}),
						output != null && (0, react_jsx_runtime.jsxs)("div", {
							className: ToolRow_module_css_default.ioSection,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: ToolRow_module_css_default.ioLabel,
								children: t("row.output")
							}), (0, react_jsx_runtime.jsx)("span", {
								className: ToolRow_module_css_default.ioText,
								children: output
							})]
						})
					]
				}), inspect !== void 0 && (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: ToolRow_module_css_default.inspectButton,
					onClick: inspect,
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconInspectOutlineRegular, {}), t("row.inspect")]
				})]
			})
		})]
	});
}
