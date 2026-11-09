// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/TurnUsagePanel.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Completed-Turn token usage action and its accounting details dialog. */
		function formatCompactCount(value, t) {
			return t("message.turnUsage.count", { count: formatTokens(value, t) });
		}
		function formatExactCount(value, t) {
			return t("message.turnUsage.count", { count: formatExactTokens(value, t) });
		}
		/**
		* Turn-usage IconActions pill with a click-open Turn-usage details dialog.
		* @param props - Turn usage buckets and locale seat.
		* @returns The trigger and, while open, its portaled dialog anchored above the trigger.
		*/
		function TurnUsagePanel({ usage, t }) {
			const { open, setOpen, rootRef, panelRef, pos } = useStatDialog();
			const cacheHit = usage.cacheReadTokens === void 0 ? null : formatCacheHitPercent(usage.cacheReadTokens, usage.totalTokens - usage.outputTokens, 1);
			const total = formatCompactCount(usage.totalTokens, t);
			const routes = usage.routes?.map((route) => `${route.provider}/${route.model}`).join(", ") ?? "";
			return (0, react_jsx_runtime.jsxs)("span", {
				ref: rootRef,
				className: TurnUsagePanel_module_css_default.root,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: TurnUsagePanel_module_css_default.trigger,
					"aria-haspopup": "dialog",
					"aria-expanded": open,
					onClick: () => {
						setOpen(!open);
					},
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDatabaseOutlineRegular, {}), (0, react_jsx_runtime.jsx)("span", {
						className: TurnUsagePanel_module_css_default.label,
						children: t("message.turnUsage.consumed", { total })
					})]
				}), open && (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)("div", {
					ref: panelRef,
					className: stat_dialog_module_css_default.panel,
					role: "dialog",
					"aria-label": t("message.turnUsage.title"),
					style: pos ?? MEASURE_STYLE,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: stat_dialog_module_css_default.title,
							children: [(0, react_jsx_runtime.jsxs)("span", {
								className: stat_dialog_module_css_default.titleLabel,
								children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDatabaseOutlineRegular, {}), t("message.turnUsage.title")]
							}), (0, react_jsx_runtime.jsx)("span", {
								className: stat_dialog_module_css_default.titleValue,
								children: formatExactCount(usage.totalTokens, t)
							})]
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: stat_dialog_module_css_default.titleRule,
							"aria-hidden": true
						}),
						(0, react_jsx_runtime.jsxs)("dl", {
							className: stat_dialog_module_css_default.details,
							"data-turn-usage-details": true,
							children: [
								routes !== "" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("message.turnUsage.model") }), (0, react_jsx_runtime.jsx)("dd", {
									className: stat_dialog_module_css_default.route,
									children: routes
								})] }),
								cacheHit !== null && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("message.turnUsage.cacheHit") }), (0, react_jsx_runtime.jsx)("dd", { children: `${cacheHit}%` })] }),
								(0, react_jsx_runtime.jsx)("dt", { children: t("message.turnUsage.input") }),
								(0, react_jsx_runtime.jsx)("dd", { children: formatExactCount(usage.uncachedInputTokens, t) }),
								usage.cacheReadTokens !== void 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("message.turnUsage.cacheRead") }), (0, react_jsx_runtime.jsx)("dd", { children: formatExactCount(usage.cacheReadTokens, t) })] }),
								usage.cacheWriteTokens !== void 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("message.turnUsage.cacheWrite") }), (0, react_jsx_runtime.jsx)("dd", { children: formatExactCount(usage.cacheWriteTokens, t) })] }),
								(0, react_jsx_runtime.jsx)("dt", { children: t("message.turnUsage.output") }),
								(0, react_jsx_runtime.jsxs)("dd", { children: [formatExactCount(usage.outputTokens, t), usage.reasoningTokens !== void 0 && (0, react_jsx_runtime.jsx)("span", {
									className: stat_dialog_module_css_default.reasoning,
									children: t("message.turnUsage.reasoning", { tokens: formatExactCount(usage.reasoningTokens, t) })
								})] })
							]
						})
					]
				}), document.body)]
			});
		}
