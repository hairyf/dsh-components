// Extracted from @deepseek-ai/dsh-client-ui-plan (lib/client.js); region lib/types/client/PlanModeControl.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Plan-mode status over the host-computed `plan` projection. The chip renders
		* only while the effective target is plan mode (`pending ? !active : active`
		* — a folded host value, not client optimism) and executes /plan off.
		*/
		function PlanChip({ useProjection, locked, exitPlanMode, t }) {
			const plan = useProjection("plan");
			const [leaving, setLeaving] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const aliveRef = (0, react.useRef)(true);
			(0, react.useEffect)(() => {
				aliveRef.current = true;
				return () => {
					aliveRef.current = false;
				};
			}, []);
			if (plan === void 0) return null;
			if (!(plan.pending ? !plan.active : plan.active)) return null;
			const off = () => {
				setLeaving(true);
				setError(null);
				exitPlanMode().then((failure) => {
					if (!aliveRef.current) return;
					setLeaving(false);
					setError(failure);
				}, (reason) => {
					if (!aliveRef.current) return;
					setLeaving(false);
					setError(reason instanceof Error ? reason.message : String(reason));
				});
			};
			return (0, react_jsx_runtime.jsxs)("span", {
				className: PlanModeControl_module_css_default.wrap,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: PlanModeControl_module_css_default.chip,
					"aria-label": t("chip.on.aria"),
					title: t("chip.on.title"),
					disabled: locked || leaving,
					onClick: off,
					children: [(0, react_jsx_runtime.jsxs)("span", {
						className: PlanModeControl_module_css_default.glyph,
						"aria-hidden": true,
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlanOutlineRegular, {
							className: PlanModeControl_module_css_default.restGlyph,
							size: 14
						}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseCircleFillRegular, {
							className: PlanModeControl_module_css_default.hoverGlyph,
							size: 14
						})]
					}), t("chip.label")]
				}), error !== null && (0, react_jsx_runtime.jsx)("span", {
					className: PlanModeControl_module_css_default.error,
					role: "status",
					title: error,
					children: t("chip.exitFailed")
				})]
			});
		}
