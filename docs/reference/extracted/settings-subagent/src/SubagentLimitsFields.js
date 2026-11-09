// Extracted from @deepseek-ai/dsh-client-ui-settings-subagent (lib/client.js); region lib/types/client/SubagentLimitsFields.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render the depth and capacity fields with their original validation and reset behavior.
* @param props - Locale, staged fields, and edit callbacks.
* @returns Two responsive fields and their application rules.
*/
function SubagentLimitsFields(props) {
	const { t, state } = props;
	return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: (0, react_jsx_runtime.jsxs)("div", {
		className: SubagentLimitsFields_module_css_default.limits,
		children: [(0, react_jsx_runtime.jsx)("div", {
			className: SubagentLimitsFields_module_css_default.limit,
			children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsValueField, {
				id: "plugin-config-subagent-depth",
				label: t("subagentMaxDepth"),
				help: {
					label: t("subagentDepthHelpLabel"),
					content: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						(0, react_jsx_runtime.jsx)("p", { children: t("subagentDepthHelp") }),
						(0, react_jsx_runtime.jsx)("table", {
							className: SubagentLimitsFields_module_css_default.depthTable,
							"aria-label": t("subagentDepthHelpLabel"),
							children: (0, react_jsx_runtime.jsxs)("tbody", { children: [(0, react_jsx_runtime.jsxs)("tr", { children: [(0, react_jsx_runtime.jsx)("th", {
								scope: "row",
								children: 0
							}), (0, react_jsx_runtime.jsx)("td", { children: t("subagentDepthZero") })] }), (0, react_jsx_runtime.jsxs)("tr", { children: [(0, react_jsx_runtime.jsx)("th", {
								scope: "row",
								children: 1
							}), (0, react_jsx_runtime.jsx)("td", { children: t("subagentDepthOne") })] })] })
						}),
						(0, react_jsx_runtime.jsx)("p", { children: t("subagentDepthOverride") })
					] })
				},
				overriddenLabel: t("overridden"),
				resetLabel: t("reset"),
				invalidLabel: t("subagentDepthInvalid"),
				numeric: true,
				disabled: !state.writable || state.saving,
				...state.maxDepth,
				onEdit: (text) => {
					props.edit("maxDepth", text);
				},
				onReset: () => {
					props.resetField("maxDepth");
				}
			})
		}), (0, react_jsx_runtime.jsx)("div", {
			className: SubagentLimitsFields_module_css_default.limit,
			children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsValueField, {
				id: "plugin-config-subagent-capacity",
				label: t("subagentMaxActive"),
				help: {
					label: t("subagentCapacityHelpLabel"),
					content: (0, react_jsx_runtime.jsx)("p", { children: t("subagentCapacityHelp") })
				},
				overriddenLabel: t("overridden"),
				resetLabel: t("reset"),
				invalidLabel: t("subagentCapacityInvalid"),
				numeric: true,
				disabled: !state.writable || state.saving,
				...state.maxActiveSubagents,
				onEdit: (text) => {
					props.edit("maxActiveSubagents", text);
				},
				onReset: () => {
					props.resetField("maxActiveSubagents");
				}
			})
		})]
	}) });
}
