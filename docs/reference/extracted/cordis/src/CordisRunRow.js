// Extracted from @deepseek-ai/dsh-client-ui-cordis (lib/client.js); region lib/types/client/CordisRunRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** `cordis_run` card and the host seat for Package-owned interactive UI. */
		const READING_LABELS = {
			idle: "status.idle",
			"awaiting-approval": "status.awaitingApproval",
			failed: "status.failed",
			"client-pending": "status.clientPending",
			running: "status.running",
			removed: "status.removed",
			superseded: "status.superseded"
		};
		/** Render one activation result and, when eligible, its Package-owned view. */
		function CordisRunRow(props) {
			if (props.phase === "preparing") return (0, react_jsx_runtime.jsx)(CordisPreparingRow, {
				...props,
				icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCodeOutlineRegular, { size: 14 }),
				title: props.t("row.runTitle"),
				className: CordisRunRow_module_css_default.card,
				rowClassName: CordisRunRow_module_css_default.row,
				titleClassName: CordisRunRow_module_css_default.title
			});
			return (0, react_jsx_runtime.jsx)(StartedCordisRunRow, { ...props });
		}
		function StartedCordisRunRow({ callId, block, inspect, renderSlot, useInventory, useLoaded, useRunCards, useActiveRuns, onObserveRunCard, t }) {
			const card = cordisRunCard(block);
			const inventory = useInventory((snapshot) => snapshot);
			const loaded = useLoaded((snapshot) => snapshot);
			const latest = useRunCards((snapshot) => snapshot);
			const activeRuns = useActiveRuns((snapshot) => snapshot);
			const key = card.state === "ok" && card.pluginId !== null && card.packageId !== null && card.pluginRunId !== null && card.seq !== null ? cordisToolViewKey(card.pluginId, card.packageId) : null;
			(0, react.useEffect)(() => {
				if (key === null || card.seq === null || card.pluginRunId === null) return;
				onObserveRunCard({
					key,
					callId,
					seq: card.seq,
					pluginRunId: card.pluginRunId
				});
			}, [
				callId,
				card.pluginRunId,
				card.seq,
				key,
				onObserveRunCard
			]);
			const row = card.pluginId === null ? void 0 : inventory.rows.find((candidate) => candidate.pluginId === card.pluginId);
			const pointer = key === null ? void 0 : latest.get(key);
			const superseded = pointer !== void 0 && pointer.callId !== callId && pointer.seq >= (card.seq ?? -1);
			const activity = card.pluginId === null ? void 0 : activeRuns.get(card.pluginId);
			const attempt = card.pluginRunId !== null && row?.latestRun?.pluginRunId === card.pluginRunId ? row.latestRun : void 0;
			const awaitingApproval = attempt?.status === "awaiting-approval" || card.packageId !== null && activity?.phase === "awaiting-approval" && activity.packageId === card.packageId && (card.mode === null || activity.mode === card.mode);
			const reading = card.pluginId !== null && inventory.removed.has(card.pluginId) ? "removed" : superseded ? "superseded" : awaitingApproval ? "awaiting-approval" : attempt?.status === "failed" ? "failed" : row !== void 0 && card.packageId !== null ? cordisVisibleStatus(row, card.packageId, loaded) : "idle";
			const status = t(READING_LABELS[reading]);
			const summary = card.errorSummary ?? (card.pluginId === null ? callId : `${card.pluginId}${card.packageId === null ? "" : ` · ${card.packageId}`}`);
			const showBusiness = reading === "running" && key !== null;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: CordisRunRow_module_css_default.card,
				"data-tool": "cordis_run",
				"data-state": card.state,
				"data-cordis-plugin-id": card.pluginId ?? void 0,
				"data-cordis-package-id": card.packageId ?? void 0,
				"data-cordis-run-id": card.pluginRunId ?? void 0,
				"data-cordis-status": reading,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: CordisRunRow_module_css_default.row,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: CordisRunRow_module_css_default.icon,
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCodeOutlineRegular, { size: 14 })
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: CordisRunRow_module_css_default.title,
								children: t(card.mode === "update" ? "row.updateTitle" : "row.runTitle")
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: CordisRunRow_module_css_default.separator,
								"aria-hidden": true
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: card.errorSummary === null ? CordisRunRow_module_css_default.summary : CordisRunRow_module_css_default.error,
								children: summary
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: CordisRunRow_module_css_default.status,
								children: status
							}),
							inspect !== void 0 && (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: CordisRunRow_module_css_default.inspect,
								"aria-label": t("action.inspect"),
								onClick: inspect,
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconInspectOutlineRegular, {})
							})
						]
					}),
					reading === "removed" && (0, react_jsx_runtime.jsx)("div", {
						className: CordisRunRow_module_css_default.message,
						children: t("run.removed")
					}),
					reading === "superseded" && (0, react_jsx_runtime.jsx)("div", {
						className: CordisRunRow_module_css_default.message,
						children: t("run.superseded")
					}),
					reading === "failed" && attempt?.error !== void 0 && (0, react_jsx_runtime.jsx)("div", {
						className: CordisRunRow_module_css_default.message,
						children: attempt.error.message
					}),
					showBusiness && card.pluginId !== null && card.packageId !== null && card.pluginRunId !== null && (0, react_jsx_runtime.jsx)("div", {
						className: CordisRunRow_module_css_default.business,
						"data-cordis-business-view": key,
						children: renderSlot("tool.view.cordis", {
							pluginId: card.pluginId,
							packageId: card.packageId,
							pluginRunId: card.pluginRunId
						}, {
							entryKey: key,
							fallback: card.output === null ? null : (0, react_jsx_runtime.jsx)("pre", {
								className: CordisRunRow_module_css_default.output,
								children: card.output
							})
						})
					}),
					!showBusiness && reading !== "removed" && reading !== "superseded" && card.output !== null && (0, react_jsx_runtime.jsx)("pre", {
						className: CordisRunRow_module_css_default.output,
						children: card.output
					})
				]
			});
		}
