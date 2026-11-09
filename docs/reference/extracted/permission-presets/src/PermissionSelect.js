// Extracted from @deepseek-ai/dsh-client-ui-permission-presets (lib/client.js); region lib/types/client/PermissionSelect.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		const permissionGlyphs = new Map([
			["read-only", (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.PermissionIconReadOnlyRegular, {})],
			["workspace-write", (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.PermissionIconWorkspaceWriteRegular, {})],
			[FULL_ACCESS_PRESET, (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.PermissionIconFullAccessRegular, {})],
			[AUTO_REVIEW_PRESET, (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.PermissionIconAutoReviewRegular, {})]
		]);
		/** Glyph for a permission option value; host-configured names outside the design set get none. */
		function permissionGlyph(value) {
			return permissionGlyphs.get(value);
		}
		function permissionLabel(value, name, t) {
			if (value === "auto") return t("auto.label");
			return displayPermissionPreset(value, name, (key) => t(key));
		}
		function optionBadge(value, t) {
			return value === "auto" ? t("auto.badge") : void 0;
		}
		/** Resolve locale-owned copy for the shipped Auto option; preserve host copy for other presets. */
		function optionDescription(option, t) {
			return option.value === "auto" ? t("auto.description") : option.description;
		}
		function PermissionSelect({ locked, select, usePermissionCatalog, useProjection, t }) {
			const selection = useProjection("permissions");
			const catalog = usePermissionCatalog((state) => state.value);
			const [pick, setPick] = (0, react.useState)(null);
			const [open, setOpen] = (0, react.useState)(false);
			const [confirmation, setConfirmation] = (0, react.useState)(null);
			const [acknowledged, setAcknowledged] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				if (!locked && selection !== void 0 && catalog !== null && (confirmation === null || catalog.options.some((option) => option.value === confirmation))) return;
				setOpen(false);
				setAcknowledged(false);
				setConfirmation(null);
			}, [
				catalog,
				confirmation,
				locked,
				selection
			]);
			if (selection === void 0 || catalog === null) return null;
			const currentValue = pick !== null && catalog.options.some((option) => option.value === pick) ? pick : selection.currentValue;
			const current = catalog.options.find((option) => option.value === currentValue);
			const currentLabel = current === void 0 ? permissionLabel(currentValue, currentValue, t) : permissionLabel(current.value, current.name, t);
			const busy = pick !== null || confirmation !== null;
			const items = catalog.options.map((option) => {
				const icon = permissionGlyph(option.value);
				const label = permissionLabel(option.value, option.name, t);
				const badge = optionBadge(option.value, t);
				return {
					id: option.value,
					label: badge === void 0 ? label : (0, react_jsx_runtime.jsxs)("span", {
						className: PermissionSelect_module_css_default.optionLabel,
						"aria-label": `${label} ${badge}`,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: PermissionSelect_module_css_default.optionLabelText,
							children: label
						}), (0, react_jsx_runtime.jsx)("span", {
							className: PermissionSelect_module_css_default.badge,
							children: badge
						})]
					}),
					...icon === void 0 ? {} : { icon }
				};
			});
			const submit = (id) => {
				setPick(id);
				select(id).catch(() => false).then(() => {
					setPick(null);
				});
			};
			const choose = (id) => {
				setOpen(false);
				if (id === selection.currentValue) return;
				if (id === "danger-full-access" || id === "auto") {
					setAcknowledged(false);
					setConfirmation(id);
					return;
				}
				submit(id);
			};
			const closeConfirmation = () => {
				setAcknowledged(false);
				setConfirmation(null);
			};
			const confirmSelection = (id) => {
				closeConfirmation();
				submit(id);
			};
			const confirmationTitle = confirmation === "auto" ? t("auto.confirm.title") : t("confirm.title");
			const confirmationDescription = confirmation === "auto" ? t("auto.confirm.description") : t("confirm.description");
			const confirmationAcknowledge = confirmation === "auto" ? t("auto.confirm.acknowledge") : t("confirm.acknowledge");
			const confirmationEnable = confirmation === "auto" ? t("auto.confirm.enable") : t("confirm.enable");
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
				open,
				items,
				selectedId: currentValue,
				onSelect: choose,
				onClose: () => {
					setOpen(false);
				},
				side: "top",
				portal: true,
				anchor: (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: PermissionSelect_module_css_default.trigger,
					"aria-label": t("mode", { name: currentLabel }),
					title: current === void 0 ? void 0 : optionDescription(current, t),
					disabled: locked || busy,
					onClick: () => {
						setOpen(!open);
					},
					children: [
						permissionGlyph(currentValue) !== void 0 && (0, react_jsx_runtime.jsx)("span", {
							className: PermissionSelect_module_css_default.triggerIcon,
							"aria-hidden": true,
							children: permissionGlyph(currentValue)
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: PermissionSelect_module_css_default.triggerLabel,
							children: currentLabel
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: clsx(PermissionSelect_module_css_default.chevron, open && PermissionSelect_module_css_default.chevronOpen),
							"aria-hidden": true,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})
						})
					]
				})
			}), confirmation !== null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.RiskConfirmation, {
				open: true,
				title: confirmationTitle,
				description: confirmationDescription,
				acknowledgeLabel: confirmationAcknowledge,
				cancelLabel: t("confirm.cancel"),
				closeLabel: t("close"),
				confirmLabel: confirmationEnable,
				acknowledged,
				disabled: locked,
				onAcknowledgedChange: setAcknowledged,
				onCancel: closeConfirmation,
				onConfirm: () => {
					confirmSelection(confirmation);
				}
			})] });
		}
