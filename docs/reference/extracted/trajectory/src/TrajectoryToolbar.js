// Extracted from @deepseek-ai/dsh-client-ui-trajectory (lib/client.js); region lib/types/client/TrajectoryToolbar.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render the sticky trajectory toolbar.
* @param props - rendered counts and whole-list fold state.
* @returns the toolbar element.
*/
function TrajectoryToolbar({ actualDuration, onActualDurationChange, actualTime, onActualTimeChange, allTurnsCollapsed, onToggleAllTurns, allAssistantsCollapsed, onToggleAllAssistants, allSubCallsCollapsed, onToggleAllSubCalls, searchQuery, onSearchQueryChange, t }) {
	return (0, react_jsx_runtime.jsx)("div", {
		className: TrajectoryToolbar_module_css_default.root,
		role: "toolbar",
		"aria-label": t("toolbar.aria"),
		children: (0, react_jsx_runtime.jsxs)("div", {
			className: TrajectoryToolbar_module_css_default.inner,
			children: [(0, react_jsx_runtime.jsxs)("div", {
				className: TrajectoryToolbar_module_css_default.actions,
				children: [
					(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: TrajectoryToolbar_module_css_default.toggle,
						"aria-label": t("toolbar.useActualDuration"),
						"aria-pressed": actualDuration,
						title: actualDuration ? t("toolbar.useEqualWidth") : t("toolbar.useActualDuration"),
						onClick: () => {
							onActualDurationChange(!actualDuration);
						},
						children: [(0, react_jsx_runtime.jsxs)("svg", {
							className: TrajectoryToolbar_module_css_default.toggleIcon,
							viewBox: "0 0 16 16",
							fill: "none",
							"aria-hidden": "true",
							children: [(0, react_jsx_runtime.jsx)("circle", {
								cx: "8",
								cy: "8",
								r: "5.25"
							}), (0, react_jsx_runtime.jsx)("path", { d: "M8 4.75V8l2.25 1.5" })]
						}), t("toolbar.duration")]
					}),
					(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: TrajectoryToolbar_module_css_default.control,
						role: "switch",
						"aria-checked": actualTime,
						hidden: true,
						onClick: () => {
							onActualTimeChange(!actualTime);
						},
						children: [(0, react_jsx_runtime.jsx)("span", { children: t("toolbar.actualTime") }), (0, react_jsx_runtime.jsx)("span", {
							className: TrajectoryToolbar_module_css_default.controlTrack,
							"data-on": actualTime || void 0,
							"aria-hidden": "true",
							children: (0, react_jsx_runtime.jsx)("span", { className: TrajectoryToolbar_module_css_default.controlThumb })
						})]
					}),
					(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: TrajectoryToolbar_module_css_default.action,
						"aria-label": allTurnsCollapsed ? t("toolbar.expandTurns") : t("toolbar.collapseTurns"),
						"aria-pressed": allTurnsCollapsed,
						title: allTurnsCollapsed ? t("toolbar.expandTurns") : t("toolbar.collapseTurns"),
						onClick: onToggleAllTurns,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: TrajectoryToolbar_module_css_default.actionIcon,
							"aria-hidden": "true",
							children: allTurnsCollapsed ? "⊞" : "⊟"
						}), t("toolbar.turns")]
					}),
					(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: TrajectoryToolbar_module_css_default.action,
						"aria-label": allAssistantsCollapsed ? t("toolbar.expandCalls") : t("toolbar.collapseCalls"),
						"aria-pressed": allAssistantsCollapsed,
						title: allAssistantsCollapsed ? t("toolbar.expandCalls") : t("toolbar.collapseCalls"),
						onClick: onToggleAllAssistants,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: TrajectoryToolbar_module_css_default.actionIcon,
							"aria-hidden": "true",
							children: allAssistantsCollapsed ? "⊞" : "⊟"
						}), t("toolbar.calls")]
					}),
					(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: TrajectoryToolbar_module_css_default.action,
						"aria-label": allSubCallsCollapsed ? t("toolbar.expandSubCalls") : t("toolbar.collapseSubCalls"),
						"aria-pressed": allSubCallsCollapsed,
						title: allSubCallsCollapsed ? t("toolbar.expandSubCalls") : t("toolbar.collapseSubCalls"),
						onClick: onToggleAllSubCalls,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: TrajectoryToolbar_module_css_default.actionIcon,
							"aria-hidden": "true",
							children: allSubCallsCollapsed ? "⊞" : "⊟"
						}), t("toolbar.subCalls")]
					})
				]
			}), (0, react_jsx_runtime.jsxs)("div", {
				className: TrajectoryToolbar_module_css_default.search,
				children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutlineRegular, {
					size: 11,
					className: TrajectoryToolbar_module_css_default.searchIcon
				}), (0, react_jsx_runtime.jsx)("input", {
					type: "search",
					className: TrajectoryToolbar_module_css_default.searchInput,
					"aria-label": t("toolbar.search"),
					placeholder: t("toolbar.searchPlaceholder"),
					value: searchQuery,
					onChange: (event) => {
						onSearchQueryChange(event.currentTarget.value);
					}
				})]
			})]
		})
	});
}
