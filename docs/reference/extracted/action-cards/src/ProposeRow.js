// Extracted from @deepseek-ai/dsh-client-ui-action-cards (lib/client.js); region lib/types/client/ProposeRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** One-line process row for a `propose_action` call: the card title and whether the card was shown. */
		function stateOf(props) {
			if (props.phase === "preparing") return "preparing";
			if (props.phase === "start") return "running";
			if (props.block.error?.code === "interrupted") return "stopped";
			return props.block.isError ? "error" : "ok";
		}
		/**
		* Render a `propose_action` call from its recorded arguments and result. Only a refused call expands, to show
		* why no card followed the answer.
		* @param props - tool call and localized status copy.
		* @returns the status row.
		*/
		function ProposeRow(props) {
			const { block, inspect, t } = props;
			const [expanded, setExpanded] = (0, react.useState)(false);
			const state = stateOf(props);
			const title = block.args.text("title") ?? "";
			const reason = props.phase === "result" && props.block.isError ? props.block.content.flatMap((item) => item.type === "text" ? [item.text] : []).join("\n") : "";
			return (0, react_jsx_runtime.jsx)("div", {
				"data-tool": "propose_action",
				"data-state": state,
				children: (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.DisclosureRow, {
					title: t("row.title"),
					icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconAppsAddOutlineRegular, { size: 14 }),
					running: state === "preparing" || state === "running",
					open: expanded && reason !== "",
					expandable: reason !== "",
					expandOnRowClick: true,
					keepContentWhenOpen: true,
					onToggle: () => {
						setExpanded((value) => !value);
					},
					collapsedContent: (0, react_jsx_runtime.jsxs)("span", {
						className: ProposeRow_module_css_default.summary,
						children: [(0, react_jsx_runtime.jsx)("span", { children: t(`row.${state}`) }), (0, react_jsx_runtime.jsx)("span", {
							className: ProposeRow_module_css_default.title,
							children: title
						})]
					}),
					children: [(0, react_jsx_runtime.jsx)("pre", {
						className: ProposeRow_module_css_default.reason,
						children: reason
					}), inspect && (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: ProposeRow_module_css_default.inspect,
						onClick: inspect,
						children: t("row.inspect")
					})]
				})
			});
		}
