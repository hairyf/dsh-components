// Extracted from @deepseek-ai/dsh-client-ui-cordis (lib/client.js); region lib/types/client/CordisPanel.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Frame-wide dynamic Plugin inventory, approvals, versions, and lifecycle actions. */
		const STATUS_LABELS = {
			idle: "status.idle",
			"awaiting-approval": "status.awaitingApproval",
			"client-pending": "status.clientPending",
			running: "status.running",
			failed: "status.failed"
		};
		const RENDER_FAILURE_LABELS = {
			abdicated: "render.failedAbdicated",
			held: "render.failedHeld"
		};
		function selectedPackageIdOf({ pluginId, listed, activity }, selected) {
			const selectedPackageId = selected[pluginId];
			if (selectedPackageId !== void 0 && listed?.packages.some((pkg) => pkg.packageId === selectedPackageId)) return selectedPackageId;
			return listed?.nextPackageId ?? listed?.currentPackageId ?? listed?.packages.at(-1)?.packageId ?? activity?.packageId;
		}
		function visiblePanelStatus(view, selectedPackageId, loaded) {
			const { listed, activity } = view;
			const latest = listed?.latestRun;
			if (activity?.phase === "awaiting-approval" || latest?.status === "awaiting-approval") return "awaiting-approval";
			if (latest?.status === "failed" && latest.packageId === selectedPackageId) return "failed";
			if (listed?.activeRun === void 0) return "idle";
			return cordisVisibleStatus(listed, listed.activeRun.packageId, loaded);
		}
		function panelDotState(status, busy) {
			if (busy) return "ongoing";
			switch (status) {
				case "idle": return "idle";
				case "client-pending": return "ongoing";
				case "running": return "done";
				case "awaiting-approval": return "warning";
				case "failed": return "error";
			}
		}
		function blockingFirst(rows) {
			return [...rows.filter((row) => row.activity?.phase === "awaiting-approval"), ...rows.filter((row) => row.activity?.phase !== "awaiting-approval")];
		}
		function RowAction({ label, children, ...props }) {
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label,
				side: "bottom",
				delayMs: 500,
				children: (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: CordisPanel_module_css_default.actionButton,
					"aria-label": label,
					...props,
					children
				})
			});
		}
		function DoubleCheckIcon() {
			return (0, react_jsx_runtime.jsxs)("span", {
				className: CordisPanel_module_css_default.doubleCheck,
				"aria-hidden": true,
				children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 12 }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 12 })]
			});
		}
		/** Render the inventory panel and its unified footer action. */
		function CordisPanel({ wide, useSessions, useInventory, useActiveRuns, useRunErrors, useLoaded, useRenderFailures, onApprove, onDecline, onRun, onStop, onRemove, onRefresh, t }) {
			const inventory = useInventory((snapshot) => snapshot);
			const activeRuns = useActiveRuns((snapshot) => snapshot);
			const errors = useRunErrors((snapshot) => snapshot);
			const loaded = useLoaded((snapshot) => snapshot);
			const renderFailures = useRenderFailures((snapshot) => snapshot);
			const current = useSessions((state) => Object.values(state.byId).find((session) => (session.retainedBy.mainView ?? 0) > 0)?.id);
			const [open, setOpen] = (0, react.useState)(false);
			const [selected, setSelected] = (0, react.useState)({});
			const [pending, setPending] = (0, react.useState)(/* @__PURE__ */ new Set());
			const [actionErrors, setActionErrors] = (0, react.useState)(/* @__PURE__ */ new Map());
			const visibleRequests = (0, react.useRef)(/* @__PURE__ */ new Set());
			const rootRef = (0, react.useRef)(null);
			const [anchor, setAnchor] = (0, react.useState)();
			(0, react.useLayoutEffect)(() => {
				if (!open) return;
				const place = () => {
					const rect = rootRef.current?.getBoundingClientRect();
					if (rect !== void 0) setAnchor({
						left: rect.left,
						bottom: window.innerHeight - rect.top + 8
					});
				};
				place();
				window.addEventListener("resize", place);
				return () => {
					window.removeEventListener("resize", place);
				};
			}, [open]);
			(0, _deepseek_ai_dsh_client_ui_primitives.useDismissOnOutsidePointer)(rootRef, open, setOpen);
			(0, react.useEffect)(() => {
				const now = /* @__PURE__ */ new Set();
				for (const activity of activeRuns.values()) if (activity.phase === "awaiting-approval") now.add(activity.requestId);
				const discovered = [...now].some((requestId) => !visibleRequests.current.has(requestId));
				visibleRequests.current = now;
				if (discovered) setOpen(true);
			}, [activeRuns]);
			(0, react.useEffect)(() => {
				onRefresh();
			}, [onRefresh]);
			(0, react.useEffect)(() => {
				if (open) onRefresh();
			}, [onRefresh, open]);
			const byPlugin = /* @__PURE__ */ new Map();
			for (const listed of inventory.rows) {
				const activity = activeRuns.get(listed.pluginId);
				byPlugin.set(listed.pluginId, {
					pluginId: listed.pluginId,
					agentId: activity?.agentId ?? listed.agentId,
					listed,
					...activity === void 0 ? {} : { activity }
				});
			}
			for (const [pluginId, activity] of activeRuns) {
				if (byPlugin.has(pluginId)) continue;
				byPlugin.set(pluginId, {
					pluginId,
					agentId: activity.agentId,
					activity
				});
			}
			const all = [...byPlugin.values()];
			const mine = blockingFirst(all.filter((row) => current !== void 0 && row.agentId === current));
			const theirs = blockingFirst(all.filter((row) => current === void 0 || row.agentId !== current));
			const approvals = [...activeRuns.values()].filter((activity) => activity.phase === "awaiting-approval").length;
			const running = all.filter((view) => visiblePanelStatus(view, selectedPackageIdOf(view, selected), loaded) === "running").length;
			if (all.length === 0) return null;
			const runAction = async (pluginId, action) => {
				if (pending.has(pluginId)) return;
				setPending((currentPending) => new Set(currentPending).add(pluginId));
				setActionErrors((currentErrors) => {
					const next = new Map(currentErrors);
					next.delete(pluginId);
					return next;
				});
				try {
					const result = await action();
					if (result !== void 0 && !result.ok) setActionErrors((currentErrors) => new Map(currentErrors).set(pluginId, result.message ?? "operation failed"));
				} catch (error) {
					setActionErrors((currentErrors) => new Map(currentErrors).set(pluginId, error instanceof Error ? error.message : String(error)));
				} finally {
					setPending((currentPending) => {
						const next = new Set(currentPending);
						next.delete(pluginId);
						return next;
					});
					onRefresh();
				}
			};
			const renderRow = (view) => {
				const { pluginId, listed, activity } = view;
				const selectedPackageId = selectedPackageIdOf(view, selected);
				const selectedPackage = listed !== void 0 && selectedPackageId !== void 0 ? packageOf(listed, selectedPackageId) : void 0;
				const activePackage = listed?.activeRun === void 0 ? void 0 : packageOf(listed, listed.activeRun.packageId);
				const name = selectedPackage?.name ?? (activity?.phase === "awaiting-approval" ? activity.name : pluginId);
				const purpose = selectedPackage?.purpose ?? (activity?.phase === "awaiting-approval" ? activity.purpose : "");
				const latest = listed?.latestRun;
				const awaiting = activity?.phase === "awaiting-approval" ? activity.requestId : latest?.status === "awaiting-approval" ? latest.approvalRequestId : void 0;
				const status = visiblePanelStatus(view, selectedPackageId, loaded);
				const busy = pending.has(pluginId) || activity?.phase === "orchestrating";
				const failure = errors.get(pluginId);
				const hostFailure = latest?.status === "failed" ? latest.error : void 0;
				const renderFailure = renderFailures.get(pluginId);
				const actionError = actionErrors.get(pluginId);
				const nextPackageId = listed?.nextPackageId !== void 0 && listed.nextPackageId !== listed.currentPackageId ? listed.nextPackageId : void 0;
				const currentPackageId = listed?.currentPackageId;
				const runMode = listed?.currentPackageId !== void 0 && selectedPackageId !== listed.currentPackageId ? "update" : "run";
				return (0, react_jsx_runtime.jsxs)("li", {
					className: CordisPanel_module_css_default.row,
					"data-cordis-row": pluginId,
					"data-cordis-status": status,
					"data-cordis-awaiting": awaiting !== void 0 || void 0,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: CordisPanel_module_css_default.rowHead,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: CordisPanel_module_css_default.rowId,
									children: pluginId
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: CordisPanel_module_css_default.rowName,
									children: name
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: CordisPanel_module_css_default.rowStatus,
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: panelDotState(status, busy) }), (0, react_jsx_runtime.jsx)("span", { children: t(STATUS_LABELS[status]) })]
								})
							]
						}),
						listed !== void 0 && listed.packages.length > 1 && selectedPackageId !== void 0 && (0, react_jsx_runtime.jsxs)("label", {
							className: CordisPanel_module_css_default.versionPicker,
							children: [(0, react_jsx_runtime.jsx)("span", { children: t("panel.version") }), (0, react_jsx_runtime.jsx)("select", {
								value: selectedPackageId,
								disabled: busy,
								onChange: (event) => {
									setSelected((currentSelected) => ({
										...currentSelected,
										[pluginId]: event.target.value
									}));
								},
								children: listed.packages.map((pkg) => (0, react_jsx_runtime.jsx)("option", {
									value: pkg.packageId,
									children: `${pkg.name} · ${pkg.packageId}`
								}, pkg.packageId))
							})]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: CordisPanel_module_css_default.rowDetail,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: CordisPanel_module_css_default.rowPurpose,
								children: purpose
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: CordisPanel_module_css_default.rowActions,
								children: [
									awaiting !== void 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
										(0, react_jsx_runtime.jsx)(RowAction, {
											label: t("action.approveOnce"),
											"data-cordis-approve": awaiting,
											disabled: busy,
											onClick: () => {
												runAction(pluginId, async () => {
													await onApprove(awaiting, false);
													setOpen(false);
												});
											},
											children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 14 })
										}),
										(0, react_jsx_runtime.jsx)(RowAction, {
											label: t("action.approvePlugin"),
											"data-cordis-approve-plugin": awaiting,
											disabled: busy,
											onClick: () => {
												runAction(pluginId, async () => {
													await onApprove(awaiting, true);
													setOpen(false);
												});
											},
											children: (0, react_jsx_runtime.jsx)(DoubleCheckIcon, {})
										}),
										(0, react_jsx_runtime.jsx)(RowAction, {
											label: t("action.decline"),
											"data-cordis-decline": awaiting,
											disabled: busy,
											onClick: () => {
												runAction(pluginId, async () => {
													await onDecline(awaiting);
													setOpen(false);
												});
											},
											children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 14 })
										})
									] }),
									awaiting === void 0 && listed !== void 0 && selectedPackageId !== void 0 && listed.activeRun === void 0 && (0, react_jsx_runtime.jsx)(RowAction, {
										label: t("action.run"),
										"data-cordis-switch": "run",
										disabled: busy,
										onClick: () => {
											runAction(pluginId, () => onRun({
												agentId: listed.agentId,
												pluginId,
												packageId: selectedPackageId,
												mode: runMode,
												hasClientHalf: selectedPackage?.hasClientHalf === true
											}));
										},
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlayOutlineRegular, { size: 14 })
									}),
									awaiting === void 0 && listed !== void 0 && listed.activeRun !== void 0 && selectedPackageId !== listed.activeRun.packageId && selectedPackage !== void 0 && (0, react_jsx_runtime.jsx)(RowAction, {
										label: t("action.run"),
										"data-cordis-switch": "run",
										disabled: busy,
										onClick: () => {
											runAction(pluginId, () => onRun({
												agentId: listed.agentId,
												pluginId,
												packageId: selectedPackage.packageId,
												mode: runMode,
												hasClientHalf: selectedPackage.hasClientHalf
											}));
										},
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlayOutlineRegular, { size: 14 })
									}),
									awaiting === void 0 && listed !== void 0 && listed.activeRun !== void 0 && status === "client-pending" && activePackage !== void 0 && selectedPackageId === listed.activeRun.packageId && (0, react_jsx_runtime.jsx)(RowAction, {
										label: t("action.run"),
										"data-cordis-switch": "run",
										disabled: busy,
										onClick: () => {
											runAction(pluginId, () => onRun({
												agentId: listed.agentId,
												pluginId,
												packageId: activePackage.packageId,
												mode: "run",
												hasClientHalf: true
											}));
										},
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlayOutlineRegular, { size: 14 })
									}),
									awaiting === void 0 && listed !== void 0 && listed.activeRun !== void 0 && (0, react_jsx_runtime.jsx)(RowAction, {
										label: t("action.stop"),
										"data-cordis-switch": "stop",
										disabled: busy,
										onClick: () => {
											runAction(pluginId, () => onStop(listed.agentId, pluginId));
										},
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconStopFillRegular, { size: 14 })
									}),
									awaiting === void 0 && listed !== void 0 && (0, react_jsx_runtime.jsx)(RowAction, {
										label: t("action.remove"),
										"data-cordis-remove": pluginId,
										disabled: busy,
										onClick: () => {
											runAction(pluginId, () => onRemove(listed.agentId, pluginId));
										},
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, { size: 14 })
									})
								]
							})]
						}),
						awaiting === void 0 && nextPackageId !== void 0 && listed !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
							className: CordisPanel_module_css_default.transition,
							children: [
								(0, react_jsx_runtime.jsx)("span", { children: currentPackageId === void 0 ? "" : t("panel.current", { packageId: currentPackageId }) }),
								(0, react_jsx_runtime.jsx)("span", { children: t("panel.next", { packageId: nextPackageId }) }),
								(0, react_jsx_runtime.jsxs)("div", {
									className: CordisPanel_module_css_default.transitionActions,
									children: [(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: busy,
										onClick: () => {
											runAction(pluginId, () => onRun({
												agentId: listed.agentId,
												pluginId,
												packageId: nextPackageId,
												mode: currentPackageId === void 0 ? "run" : "update",
												hasClientHalf: packageOf(listed, nextPackageId)?.hasClientHalf === true
											}));
										},
										children: t("action.retry")
									}), currentPackageId !== void 0 && (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: busy,
										onClick: () => {
											runAction(pluginId, () => onRun({
												agentId: listed.agentId,
												pluginId,
												packageId: currentPackageId,
												mode: "run",
												hasClientHalf: packageOf(listed, currentPackageId)?.hasClientHalf === true
											}));
										},
										children: t("action.rollback")
									})]
								})
							]
						}),
						failure !== void 0 && (0, react_jsx_runtime.jsx)("div", {
							className: CordisPanel_module_css_default.rowError,
							role: "alert",
							children: `${failure.message} (${failure.reason})`
						}),
						failure === void 0 && hostFailure !== void 0 && (0, react_jsx_runtime.jsx)("div", {
							className: CordisPanel_module_css_default.rowError,
							role: "alert",
							children: `${hostFailure.message} (${hostFailure.phase})`
						}),
						actionError !== void 0 && (0, react_jsx_runtime.jsx)("div", {
							className: CordisPanel_module_css_default.rowError,
							role: "alert",
							children: actionError
						}),
						renderFailure !== void 0 && (0, react_jsx_runtime.jsx)("div", {
							className: CordisPanel_module_css_default.rowError,
							role: "alert",
							"data-cordis-render-failure": renderFailure.slot,
							"data-cordis-render-abdicated": renderFailure.abdicated || void 0,
							children: `${t(RENDER_FAILURE_LABELS[renderFailure.abdicated ? "abdicated" : "held"], { slot: renderFailure.slot })} ${renderFailure.message}`
						}),
						activePackage !== void 0 && activePackage.packageId !== selectedPackageId && (0, react_jsx_runtime.jsx)("span", {
							className: CordisPanel_module_css_default.activeVersion,
							children: `${t("status.running")}: ${activePackage.name} · ${activePackage.packageId}`
						})
					]
				}, pluginId);
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: wide ? CordisPanel_module_css_default.layer : `${CordisPanel_module_css_default.layer} ${CordisPanel_module_css_default.rail}`,
				children: [open && anchor !== void 0 && (0, react_jsx_runtime.jsxs)("section", {
					className: CordisPanel_module_css_default.panel,
					style: anchor,
					"data-cordis-panel": true,
					"aria-label": t("panel.title"),
					children: [(0, react_jsx_runtime.jsx)("header", {
						className: CordisPanel_module_css_default.header,
						children: (0, react_jsx_runtime.jsx)("span", {
							className: CordisPanel_module_css_default.title,
							children: t("panel.title")
						})
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: CordisPanel_module_css_default.body,
						children: [
							inventory.error !== void 0 && (0, react_jsx_runtime.jsx)("p", {
								className: CordisPanel_module_css_default.readError,
								role: "alert",
								children: t("panel.readFailed", { message: inventory.error })
							}),
							!inventory.read && inventory.error === void 0 && (0, react_jsx_runtime.jsx)("p", {
								className: CordisPanel_module_css_default.note,
								children: t("panel.loading")
							}),
							inventory.read && all.length === 0 && (0, react_jsx_runtime.jsx)("p", {
								className: CordisPanel_module_css_default.note,
								children: t("panel.empty")
							}),
							mine.length > 0 && (0, react_jsx_runtime.jsxs)("section", { children: [(0, react_jsx_runtime.jsx)("h3", {
								className: CordisPanel_module_css_default.group,
								children: t("panel.group.current")
							}), (0, react_jsx_runtime.jsx)("ul", {
								className: CordisPanel_module_css_default.rows,
								children: mine.map(renderRow)
							})] }),
							theirs.length > 0 && (0, react_jsx_runtime.jsxs)("section", { children: [(0, react_jsx_runtime.jsx)("h3", {
								className: CordisPanel_module_css_default.group,
								children: t("panel.group.others")
							}), (0, react_jsx_runtime.jsx)("ul", {
								className: CordisPanel_module_css_default.rows,
								children: theirs.map(renderRow)
							})] })
						]
					})]
				}), (0, react_jsx_runtime.jsx)("div", {
					className: CordisPanel_module_css_default.footerButtons,
					children: (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: CordisPanel_module_css_default.badge,
						"data-cordis-badge": all.length,
						"data-cordis-approval-badge": approvals,
						"data-active": approvals > 0 || void 0,
						"aria-label": t("panel.plugins.aria"),
						"aria-expanded": open,
						onClick: () => {
							setOpen((value) => !value);
						},
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCordisPluginOutlineRegular, { size: wide ? 16 : 18 }), wide && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
							className: CordisPanel_module_css_default.badgeLabel,
							children: t("panel.trigger")
						}), (0, react_jsx_runtime.jsx)("span", {
							className: CordisPanel_module_css_default.badgeCount,
							children: t("panel.runningCount", { count: running })
						})] })]
					})
				})]
			});
		}
