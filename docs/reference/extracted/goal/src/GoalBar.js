// Extracted from @deepseek-ai/dsh-client-ui-goal (lib/client.js); region lib/types/client/GoalBar.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* GoalBar: the goal indicator docked above the message composer (input dock
		* strip). A present goal shows a goal glyph, a phase label, the truncated
		* objective, and icon actions — resume when active-disarmed, paused, or
		* blocked, edit (inline form in the same strip), and clear. Goal creation
		* lives on the `/goal` command, not here: loading (undefined), no goal
		* (null), and complete goals render nothing. Durable state arrives as the projected whole snapshot;
		* process-local activation arrives through the injected activation hook.
		*/
		/** Strip label keys per visible phase; complete goals render nothing. */
		const PHASE_LABELS = {
			active: "phase.active",
			paused: "phase.paused",
			blocked: "phase.blocked"
		};
		/** Strip label for an active goal using its process-local activation. */
		function activeLabel(activation, t) {
			if (activation === "disarmed") return t("phase.active.disarmed");
			return t(PHASE_LABELS.active);
		}
		function GoalBar({ goal, activation, onEdit, onPause, onResume, onClear, t }) {
			const [editing, setEditing] = (0, react.useState)(false);
			const [draft, setDraft] = (0, react.useState)("");
			const [pending, setPending] = (0, react.useState)(false);
			const [actionError, setActionError] = (0, react.useState)(null);
			const [clearedGoalId, setClearedGoalId] = (0, react.useState)(null);
			const pendingRef = (0, react.useRef)(false);
			const goalId = goal?.id;
			(0, react.useEffect)(() => {
				setEditing(false);
				setActionError(null);
				setClearedGoalId(null);
			}, [goalId]);
			const runAction = (0, react.useCallback)(async (action) => {
				if (pendingRef.current) return void 0;
				pendingRef.current = true;
				setPending(true);
				setActionError(null);
				const result = await action();
				pendingRef.current = false;
				setPending(false);
				if (!result.ok) setActionError(`${result.error.message} (${result.error.code})`);
				return result;
			}, []);
			const handleEdit = (0, react.useCallback)(async () => {
				const trimmed = draft.trim();
				if (trimmed === "") return;
				if ((await runAction(() => onEdit(trimmed)))?.ok) setEditing(false);
			}, [
				draft,
				onEdit,
				runAction
			]);
			const handleClear = (0, react.useCallback)(async (clearedId) => {
				if ((await runAction(onClear))?.ok) setClearedGoalId(clearedId);
			}, [onClear, runAction]);
			if (goal === void 0 || goal === null || goal.phase === "complete" || goal.id === clearedGoalId) return null;
			if (editing) return (0, react_jsx_runtime.jsx)("div", {
				className: GoalBar_module_css_default.dock,
				"data-goal-bar": true,
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: `${GoalBar_module_css_default.bar} ${GoalBar_module_css_default.editBar}`,
					children: [
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.InlineEditor, {
							value: draft,
							label: t("objective.aria"),
							onChange: setDraft,
							onSave: () => {
								handleEdit();
							},
							onCancel: () => {
								setEditing(false);
							}
						}),
						actionError !== null && (0, react_jsx_runtime.jsx)("span", {
							className: GoalBar_module_css_default.error,
							role: "alert",
							children: actionError
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: GoalBar_module_css_default.actions,
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
								portal: true,
								label: t("action.save"),
								side: "bottom",
								delayMs: 500,
								children: (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: GoalBar_module_css_default.iconBtn,
									onClick: () => {
										handleEdit();
									},
									disabled: pending || draft.trim() === "",
									"aria-label": t("action.save"),
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 14 })
								})
							}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
								portal: true,
								label: t("action.cancel"),
								side: "bottom",
								delayMs: 500,
								children: (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: GoalBar_module_css_default.iconBtn,
									onClick: () => {
										setEditing(false);
									},
									disabled: pending,
									"aria-label": t("action.cancel"),
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 14 })
								})
							})]
						})
					]
				})
			});
			const title = goal.phase === "blocked" ? goal.blockedReason?.message : void 0;
			const label = goal.phase === "active" ? activeLabel(activation, t) : t(PHASE_LABELS[goal.phase]);
			const showResume = goal.phase !== "active" || activation === "disarmed";
			return (0, react_jsx_runtime.jsx)("div", {
				className: GoalBar_module_css_default.dock,
				"data-goal-bar": true,
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: GoalBar_module_css_default.bar,
					title,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: GoalBar_module_css_default.goalGlyph,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconGoalOutlineRegular, { size: 14 })
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: GoalBar_module_css_default.label,
							children: label
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: GoalBar_module_css_default.objective,
							children: goal.objective
						}),
						actionError !== null && (0, react_jsx_runtime.jsx)("span", {
							className: GoalBar_module_css_default.error,
							role: "alert",
							children: actionError
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: GoalBar_module_css_default.actions,
							children: [
								goal.phase === "active" && activation === "armed" && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									portal: true,
									label: t("action.pause"),
									side: "bottom",
									delayMs: 500,
									children: (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: GoalBar_module_css_default.iconBtn,
										disabled: pending,
										onClick: () => {
											runAction(onPause);
										},
										"aria-label": t("action.pause"),
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPauseOutlineRegular, { size: 14 })
									})
								}),
								showResume && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									portal: true,
									label: t("action.resume"),
									side: "bottom",
									delayMs: 500,
									children: (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: GoalBar_module_css_default.iconBtn,
										disabled: pending,
										onClick: () => {
											runAction(onResume);
										},
										"aria-label": t("action.resume"),
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlayOutlineRegular, { size: 14 })
									})
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									portal: true,
									label: t("action.edit"),
									side: "bottom",
									delayMs: 500,
									children: (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: GoalBar_module_css_default.iconBtn,
										disabled: pending,
										onClick: () => {
											setDraft(goal.objective);
											setEditing(true);
										},
										"aria-label": t("action.edit"),
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular, { size: 14 })
									})
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									portal: true,
									label: t("action.clear"),
									side: "bottom",
									delayMs: 500,
									children: (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: GoalBar_module_css_default.iconBtn,
										disabled: pending,
										onClick: () => {
											handleClear(goal.id);
										},
										"aria-label": t("action.clear"),
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, { size: 14 })
									})
								})
							]
						})
					]
				})
			});
		}
		/** Dock adapter: overlays process-local activation on the durable goal projection. */
		function GoalDock({ useProjection, useGoalActivation, onEdit, onPause, onResume, onClear, t }) {
			const projection = useProjection("goal");
			const goal = projection === void 0 || projection === null ? projection : projection.goal;
			const goalId = goal?.id;
			const revision = goal?.revision;
			const activation = useGoalActivation((next) => next.id === goalId && next.revision === revision ? next.activation : void 0);
			return (0, react_jsx_runtime.jsx)(GoalBar, {
				goal,
				...activation === void 0 ? {} : { activation },
				onEdit,
				onPause,
				onResume,
				onClear,
				t
			});
		}
