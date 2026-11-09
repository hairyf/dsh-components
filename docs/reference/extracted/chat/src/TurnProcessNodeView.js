// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/TurnProcessNodeView.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Settled Turn duration and process disclosure above its content. */
const TurnProcessNodeView = (0, react.memo)(function TurnProcessNodeView({ node, turnProcess, t }) {
	if (turnProcess === void 0) throw new Error("turn-process node requires Turn process owner state");
	const open = !turnProcess.foldable || turnProcess.open;
	const turn = node.location.kind === "turn" || node.location.kind === "step" ? node.location.turn : void 0;
	if (turn?.status !== "closed") return null;
	const canCollapse = turnProcess.foldable && turnProcess.hasContent && !turnProcessAlwaysOpen(node);
	const reason = turn.end?.data.reason.kind;
	const stopped = reason === "aborted" || reason === "interrupted";
	const elapsedMs = turn.start === void 0 || turn.end === void 0 ? void 0 : Math.max(1e3, turn.end.time - turn.start.time);
	const duration = elapsedMs === void 0 || stopped || reason === "error" ? void 0 : formatRunDuration(elapsedMs, t);
	const label = stopped ? t("message.stopped") : reason === "error" ? t("message.turnProcess.failed") : duration === void 0 ? t("message.turnProcess.worked") : t("message.turnProcess.took");
	const announcement = stopped ? t("message.stopped") : reason === "error" ? t("message.turnProcess.failed") : t("message.turnProcess.worked");
	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
		className: accessibility_module_css_default.visuallyHidden,
		role: "status",
		"aria-live": "polite",
		"aria-atomic": "true",
		children: announcement
	}), (0, react_jsx_runtime.jsxs)("button", {
		type: "button",
		className: TurnProcessNodeView_module_css_default.root,
		"data-open": open || void 0,
		"data-turn-process": node.data.turn,
		"data-turn-process-messages": node.data.messageCount,
		"data-turn-process-tool-calls": node.data.toolCallCount,
		"data-turn-process-subagents": node.data.subagentCount,
		disabled: !canCollapse,
		"aria-expanded": turnProcess.hasContent ? open : void 0,
		onClick: (event) => {
			event.currentTarget.focus();
			turnProcess.setOpen(!open);
		},
		children: [(0, react_jsx_runtime.jsxs)("span", {
			className: TurnProcessNodeView_module_css_default.label,
			children: [label, duration?.map((part, index) => (0, react_jsx_runtime.jsx)("span", {
				className: part.numeric ? TurnProcessNodeView_module_css_default.durationNumber : void 0,
				children: part.text
			}, index))]
		}), canCollapse && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { className: TurnProcessNodeView_module_css_default.chevron })]
	})] });
});
