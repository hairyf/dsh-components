// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/TurnTriggerNodeView.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** An independent, expandable notice explaining a non-human Turn trigger. */
const TRIGGER_ICONS = {
	request: _deepseek_ai_dsh_client_ui_primitives.IconContextInjectionOutlineRegular,
	goal: _deepseek_ai_dsh_client_ui_primitives.IconGoalOutlineRegular,
	agent: _deepseek_ai_dsh_client_ui_primitives.IconPaperPlaneOutlineRegular,
	team: _deepseek_ai_dsh_client_ui_primitives.IconAgentPresetOutlineRegular,
	subagent: _deepseek_ai_dsh_client_ui_primitives.IconAgentPresetOutlineRegular,
	github: _deepseek_ai_dsh_client_ui_primitives.IconBranchOutlineRegular,
	webhook: _deepseek_ai_dsh_client_ui_primitives.IconGlobeOutlineRegular,
	schedule: _deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular,
	job: _deepseek_ai_dsh_client_ui_primitives.IconQueueOutlineRegular,
	plugin: _deepseek_ai_dsh_client_ui_primitives.IconCordisPluginOutlineRegular
};
/** Render recorded trigger attribution above the whole-Turn disclosure. */
function TurnTriggerNodeView({ node, t }) {
	const [open, setOpen] = (0, react.useState)(false);
	const bodyId = (0, react.useId)();
	const details = turnTriggerDetails(node.data);
	const TriggerIcon = TRIGGER_ICONS[details.icon];
	const date = new Date(node.data.time);
	const time = formatMessageClock(node.data.time, t);
	return (0, react_jsx_runtime.jsxs)("section", {
		className: TurnTriggerNodeView_module_css_default.root,
		"data-turn-trigger": true,
		children: [(0, react_jsx_runtime.jsxs)("button", {
			className: TurnTriggerNodeView_module_css_default.header,
			type: "button",
			"aria-expanded": open,
			"aria-controls": bodyId,
			onClick: () => {
				setOpen(!open);
			},
			children: [
				(0, react_jsx_runtime.jsx)("span", {
					className: TurnTriggerNodeView_module_css_default.icon,
					"aria-hidden": true,
					children: (0, react_jsx_runtime.jsx)(TriggerIcon, { size: 14 })
				}),
				(0, react_jsx_runtime.jsx)("span", {
					className: TurnTriggerNodeView_module_css_default.title,
					children: t(details.title)
				}),
				(0, react_jsx_runtime.jsx)("time", {
					className: TurnTriggerNodeView_module_css_default.time,
					dateTime: date.toISOString(),
					children: time
				}),
				(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
					size: 12,
					className: open ? TurnTriggerNodeView_module_css_default.openChevron : TurnTriggerNodeView_module_css_default.chevron
				})
			]
		}), open && (0, react_jsx_runtime.jsxs)("div", {
			id: bodyId,
			className: TurnTriggerNodeView_module_css_default.body,
			children: [(0, react_jsx_runtime.jsx)("p", {
				className: TurnTriggerNodeView_module_css_default.explanation,
				children: t("message.trigger.explanation")
			}), (0, react_jsx_runtime.jsx)("div", {
				className: TurnTriggerNodeView_module_css_default.content,
				children: (0, react_jsx_runtime.jsx)(NoticeBody, {
					content: node.data.content,
					source: node.data.source,
					t
				})
			})]
		})]
	});
}
