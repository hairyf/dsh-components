// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/toolviews/bash-sample.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

const BASH_ICON = (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconApiOutlineRegular, { size: 14 });
/** Visually hidden status for the color-only running sweep and error tone. */
function stateStatus(state, t) {
	switch (state) {
		case "preparing": return t("row.preparing");
		case "running": return t("bash.running");
		case "error": return t("bash.failed");
		case "stopped": return t("bash.stopped");
		default: return null;
	}
}
/**
* Render expandable Bash output with an accessible lifecycle label. While the
* call is preparing the row shows the description streamed so far and cannot expand.
* @param props - tool call, Session sources, locale, and inspection callback.
* @returns the Bash output row.
*/
const BashRow = (0, react.memo)(function BashRow({ toolName, block, sessionId, useSessions, inspect, useDisclosure, t }) {
	const model = (0, react.useMemo)(() => toolRowModel(toolName, block), [toolName, block]);
	const cwd = useSessions((list) => list.byId[sessionId]?.cwd);
	const terminalModel = (0, react.useMemo)(() => terminalCardModel(block, cwd), [block, cwd]);
	const terminal = (0, react.useMemo)(() => terminalModel === null ? null : localizeTerminalCardModel(terminalModel, t), [terminalModel, t]);
	const labels = (0, react.useMemo)(() => terminalBlockLabels(t), [t]);
	const state = model.state === "ok" && terminalModel !== null && terminalFailed(terminalModel) ? "error" : model.state;
	const status = stateStatus(state, t);
	const { expanded, toggle: toggleExpand } = useDisclosure();
	const background = isBackgroundShellCall(block);
	const genericBody = terminal === null && (model.state === "error" || isSettledPersistentShellCall(block) || isSpilledShellCall(block) || background) && (model.bodyRaw !== null || model.output !== null);
	const expandable = terminal !== null || genericBody;
	const open = expanded && expandable;
	const body = (0, react.useMemo)(() => open && genericBody && model.bodyRaw !== null ? formatToolBody(model.variant, model.bodyRaw) : null, [
		genericBody,
		model.bodyRaw,
		model.variant,
		open
	]);
	const normalSummary = terminal?.description ?? model.summary;
	const exitLabel = terminalExitLabel(terminalModel, t);
	const settlementLine = exitLabel !== null ? null : state === "error" ? model.errorSummary ?? normalSummary : state === "stopped" ? t("bash.stopped") : null;
	const running = state === "running" || state === "preparing";
	const toggleFromKeyboard = (0, react.useCallback)((event) => {
		if (!expandable || event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		toggleExpand();
	}, [expandable, toggleExpand]);
	const leading = open ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, { className: bash_sample_module_css_default.chevron }) : expandable ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
		className: bash_sample_module_css_default.iconIdle,
		children: BASH_ICON
	}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { className: clsx(bash_sample_module_css_default.chevron, bash_sample_module_css_default.chevronHover) })] }) : BASH_ICON;
	return (0, react_jsx_runtime.jsxs)("div", {
		className: bash_sample_module_css_default.card,
		children: [(0, react_jsx_runtime.jsxs)("div", {
			className: bash_sample_module_css_default.root,
			"data-sample": "bash",
			"data-variant": "bash",
			"data-state": state,
			"data-expandable": expandable || void 0,
			role: expandable ? "button" : void 0,
			tabIndex: expandable ? 0 : void 0,
			"aria-expanded": expandable ? open : void 0,
			onClick: expandable ? toggleExpand : void 0,
			onKeyDown: expandable ? toggleFromKeyboard : void 0,
			children: [
				(0, react_jsx_runtime.jsx)("span", {
					className: bash_sample_module_css_default.leading,
					children: leading
				}),
				status !== null && (0, react_jsx_runtime.jsx)("span", {
					className: bash_sample_module_css_default.visuallyHidden,
					children: status
				}),
				(0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, {
					active: running,
					children: [
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, {
							className: bash_sample_module_css_default.title,
							children: t(model.titleKey)
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: bash_sample_module_css_default.sep,
							"data-shimmer-decoration": true,
							"aria-hidden": true
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: clsx(bash_sample_module_css_default.summary, exitLabel === null && state === "error" && bash_sample_module_css_default.errorSummary, exitLabel === null && state === "stopped" && bash_sample_module_css_default.stoppedSummary),
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, { children: settlementLine ?? normalSummary })
						}),
						exitLabel !== null && (0, react_jsx_runtime.jsx)(ExitCodeBadge, { label: exitLabel })
					]
				})
			]
		}), open && (0, react_jsx_runtime.jsxs)("div", {
			className: bash_sample_module_css_default.bodyWrap,
			children: [terminal !== null ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TerminalBlock, {
				...terminal.card,
				maxLines: Infinity,
				labels,
				className: bash_sample_module_css_default.terminal
			}) : (0, react_jsx_runtime.jsxs)("div", {
				className: bash_sample_module_css_default.ioCard,
				children: [
					body !== null && (0, react_jsx_runtime.jsxs)("div", {
						className: bash_sample_module_css_default.ioSection,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: bash_sample_module_css_default.ioLabel,
							children: t("row.input")
						}), background ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.CommandText, {
							className: bash_sample_module_css_default.commandInput,
							text: body,
							label: t("row.commandArguments")
						}) : (0, react_jsx_runtime.jsx)("span", {
							className: bash_sample_module_css_default.ioText,
							children: body
						})]
					}),
					body !== null && model.output !== null && (0, react_jsx_runtime.jsx)("span", {
						className: bash_sample_module_css_default.ioDivider,
						"aria-hidden": true
					}),
					model.output !== null && (0, react_jsx_runtime.jsxs)("div", {
						className: bash_sample_module_css_default.ioSection,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: bash_sample_module_css_default.ioLabel,
							children: t("row.output")
						}), (0, react_jsx_runtime.jsx)("span", {
							className: bash_sample_module_css_default.ioText,
							"data-error": state === "error" || void 0,
							children: model.output
						})]
					})
				]
			}), inspect !== void 0 && (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: bash_sample_module_css_default.inspectButton,
				onClick: inspect,
				children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconInspectOutlineRegular, {}), t("row.inspect")]
			})]
		})]
	});
});
/** Registers the standalone Bash conversation-row sample. */
const bashToolviewSample = {
	name: "bash-toolview-sample",
	inject: ["slots"],
	apply(ctx) {
		ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
			name: "tool.call.toolview",
			key: "bash",
			locale: CONVERSATION_NS
		}, BashRow));
	}
};
