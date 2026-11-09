// Extracted from @deepseek-ai/dsh-client-ui-cordis (lib/client.js); region lib/types/client/CordisActionRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Localized cards for `cordis_stop` and `cordis_undefine`. */
		/** Render one Stop or Remove call with Cordis-owned localized copy. */
		function CordisActionRow(props) {
			if (props.phase === "preparing") {
				const remove = props.toolName === "cordis_undefine";
				return (0, react_jsx_runtime.jsx)(CordisPreparingRow, {
					...props,
					icon: remove ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, { size: 14 }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconStopFillRegular, { size: 14 }),
					title: props.t(remove ? "row.removeTitle" : "row.stopTitle"),
					className: CordisRunRow_module_css_default.card,
					rowClassName: CordisRunRow_module_css_default.row,
					titleClassName: CordisRunRow_module_css_default.title
				});
			}
			return (0, react_jsx_runtime.jsx)(StartedCordisActionRow, { ...props });
		}
		function StartedCordisActionRow({ callId, toolName, block, inspect, t }) {
			const card = cordisActionCard(block);
			const remove = toolName === "cordis_undefine";
			const summary = card.errorSummary ?? card.pluginId ?? callId;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: CordisRunRow_module_css_default.card,
				"data-tool": toolName,
				"data-state": card.state,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: CordisRunRow_module_css_default.row,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: CordisRunRow_module_css_default.icon,
							children: remove ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, { size: 14 }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconStopFillRegular, { size: 14 })
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: CordisRunRow_module_css_default.title,
							children: t(remove ? "row.removeTitle" : "row.stopTitle")
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: CordisRunRow_module_css_default.separator,
							"aria-hidden": true
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: card.errorSummary === null ? CordisRunRow_module_css_default.summary : CordisRunRow_module_css_default.error,
							children: summary
						}),
						inspect !== void 0 && (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: CordisRunRow_module_css_default.inspect,
							"aria-label": t("action.inspect"),
							onClick: inspect,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconInspectOutlineRegular, {})
						})
					]
				}), card.output !== null && (0, react_jsx_runtime.jsx)("pre", {
					className: CordisRunRow_module_css_default.output,
					children: card.output
				})]
			});
		}
