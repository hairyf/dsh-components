// Extracted from @deepseek-ai/dsh-client-ui-cordis (lib/client.js); region lib/types/client/CordisDefineRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Read-only `cordis_define` card with Host and Client source tabs. */
		const READING_LABELS$1 = {
			idle: "status.idle",
			"client-pending": "status.clientPending",
			running: "status.running",
			removed: "status.removed"
		};
		function stateStatus(state) {
			switch (state) {
				case "running": return "a11y.defining";
				case "error": return "a11y.failed";
				case "stopped": return "a11y.stopped";
				default: return null;
			}
		}
		/** Render one immutable Package definition. */
		function CordisDefineRow(props) {
			if (props.phase === "preparing") return (0, react_jsx_runtime.jsx)(CordisPreparingRow, {
				...props,
				icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCodeOutlineRegular, { size: 14 }),
				title: props.t("row.defineTitle"),
				className: CordisDefineRow_module_css_default.card,
				rowClassName: CordisDefineRow_module_css_default.row,
				titleClassName: CordisDefineRow_module_css_default.title
			});
			return (0, react_jsx_runtime.jsx)(StartedCordisDefineRow, { ...props });
		}
		function StartedCordisDefineRow({ callId, block, inspect, useInventory, useLoaded, t }) {
			const card = cordisDefineCard(block);
			const inventory = useInventory((snapshot) => snapshot);
			const loaded = useLoaded((snapshot) => snapshot);
			const [expanded, setExpanded] = (0, react.useState)(false);
			const [selectedSource, setSelectedSource] = (0, react.useState)(card.clientCode !== null ? "client" : "host");
			const sourcePanelId = (0, react.useId)();
			const row = card.pluginId === null ? void 0 : inventory.rows.find((candidate) => candidate.pluginId === card.pluginId);
			const reading = card.pluginId !== null && inventory.removed.has(card.pluginId) ? "removed" : row !== void 0 && card.packageId !== null ? cordisVisibleStatus(row, card.packageId, loaded) : "idle";
			const name = card.name ?? callId;
			const expandable = card.hostCode !== null || card.clientCode !== null || card.output !== null;
			const open = expanded && expandable;
			const a11yState = stateStatus(card.state);
			const hasSource = card.clientCode !== null || card.hostCode !== null;
			const activeSource = selectedSource === "client" && card.clientCode !== null ? "client" : selectedSource === "host" && card.hostCode !== null ? "host" : card.clientCode !== null ? "client" : "host";
			const activeCode = activeSource === "client" ? card.clientCode : card.hostCode;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: CordisDefineRow_module_css_default.card,
				"data-tool": "cordis_define",
				"data-state": card.state,
				"data-terminal": reading === "removed" || void 0,
				"data-cordis-plugin-id": card.pluginId ?? void 0,
				"data-cordis-package-id": card.packageId ?? void 0,
				"data-cordis-status": reading,
				children: [a11yState !== null && (0, react_jsx_runtime.jsx)("span", {
					className: CordisDefineRow_module_css_default.visuallyHidden,
					children: t(a11yState)
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DisclosureRow, {
					rowClassName: CordisDefineRow_module_css_default.row,
					titleClassName: CordisDefineRow_module_css_default.title,
					chevronClassName: CordisDefineRow_module_css_default.chevron,
					icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCodeOutlineRegular, { size: 14 }),
					title: t("row.defineTitle"),
					open,
					expandable,
					expandOnRowClick: true,
					keepContentWhenOpen: true,
					onToggle: () => {
						setExpanded((value) => !value);
					},
					collapsedContent: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: CordisDefineRow_module_css_default.separator,
							"aria-hidden": true
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: card.errorSummary === null ? CordisDefineRow_module_css_default.name : CordisDefineRow_module_css_default.errorSummary,
							children: card.errorSummary ?? name
						}),
						card.errorSummary === null && (0, react_jsx_runtime.jsx)("span", {
							className: CordisDefineRow_module_css_default.purpose,
							children: card.purpose ?? t("purpose.missing")
						}),
						card.pluginId !== null && (0, react_jsx_runtime.jsx)("span", {
							className: CordisDefineRow_module_css_default.readout,
							children: (0, react_jsx_runtime.jsx)("span", {
								className: CordisDefineRow_module_css_default.statusLabel,
								children: t(READING_LABELS$1[reading])
							})
						})
					] }),
					children: (0, react_jsx_runtime.jsxs)("div", {
						className: CordisDefineRow_module_css_default.bodyWrap,
						children: [
							hasSource && activeCode !== null && (0, react_jsx_runtime.jsxs)("section", {
								className: CordisDefineRow_module_css_default.sourceCard,
								children: [(0, react_jsx_runtime.jsx)("div", {
									className: CordisDefineRow_module_css_default.sourceTabs,
									role: "tablist",
									"aria-label": t("body.source"),
									children: ["client", "host"].map((source) => {
										const available = source === "client" ? card.clientCode !== null : card.hostCode !== null;
										return (0, react_jsx_runtime.jsx)("button", {
											id: `${sourcePanelId}-${source}`,
											type: "button",
											role: "tab",
											"aria-controls": sourcePanelId,
											"aria-selected": activeSource === source,
											className: activeSource === source ? `${CordisDefineRow_module_css_default.sourceTab} ${CordisDefineRow_module_css_default.sourceTabActive}` : CordisDefineRow_module_css_default.sourceTab,
											disabled: !available,
											onClick: () => {
												setSelectedSource(source);
											},
											children: t(source === "client" ? "body.clientCode" : "body.hostCode")
										}, source);
									})
								}), (0, react_jsx_runtime.jsx)("div", {
									id: sourcePanelId,
									className: CordisDefineRow_module_css_default.sourcePanel,
									role: "tabpanel",
									"aria-labelledby": `${sourcePanelId}-${activeSource}`,
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.CodeBlock, {
										toolbarLabels: {
											codeLabel: t("codeBlock.title"),
											wrapLabel: t("codeBlock.wrap"),
											unwrapLabel: t("codeBlock.unwrap")
										},
										code: activeCode,
										lang: "javascript",
										copyLabel: t("body.copy"),
										copiedLabel: t("body.copied"),
										className: CordisDefineRow_module_css_default.sourceCode
									})
								})]
							}),
							card.output !== null && (0, react_jsx_runtime.jsxs)("section", {
								className: CordisDefineRow_module_css_default.codeSection,
								children: [(0, react_jsx_runtime.jsx)("div", {
									className: CordisDefineRow_module_css_default.sectionLabel,
									children: t("body.output")
								}), (0, react_jsx_runtime.jsx)("pre", {
									className: CordisDefineRow_module_css_default.output,
									"data-error": card.state === "error" || void 0,
									children: card.output
								})]
							}),
							card.pluginId !== null && (0, react_jsx_runtime.jsx)("div", {
								className: CordisDefineRow_module_css_default.panelHint,
								children: t("panel.hint")
							}),
							inspect !== void 0 && (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: CordisDefineRow_module_css_default.inspectButton,
								onClick: inspect,
								children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconInspectOutlineRegular, {}), t("action.inspect")]
							})
						]
					})
				})]
			});
		}
