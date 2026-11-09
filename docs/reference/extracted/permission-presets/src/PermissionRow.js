// Extracted from @deepseek-ai/dsh-client-ui-permission-presets (lib/client.js); region lib/types/client/PermissionRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Permission preference row: the default preset for subsequently created
		* sessions. Current-session switches remain on the composer `/permission`
		* control.
		*/
		/**
		* Render the new-session Permission default selector.
		* @param props - composed slot props.
		* @returns the row, or null when the host does not expose permission settings.
		*/
		function PermissionRow({ load, select, usePermission, t }) {
			const state = usePermission((snapshot) => snapshot);
			const [open, setOpen] = (0, react.useState)(false);
			const [confirmingFullAccess, setConfirmingFullAccess] = (0, react.useState)(false);
			const [acknowledged, setAcknowledged] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				load();
			}, [load]);
			(0, react.useEffect)(() => {
				if (state.writable && state.status !== "unavailable") return;
				setOpen(false);
				setAcknowledged(false);
				setConfirmingFullAccess(false);
			}, [state.status, state.writable]);
			if (state.status === "unavailable") return null;
			const selected = state.options.find((option) => option.id === state.currentValue);
			const busy = state.status === "loading" || state.status === "saving" || confirmingFullAccess;
			const optionLabel = (option) => displayPermissionPreset(option.id, option.label, t);
			const label = selected !== void 0 ? optionLabel(selected) : busy ? t("loading") : t("unavailable");
			const description = state.error ?? t("description");
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("div", {
				className: PermissionRow_module_css_default.row,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: PermissionRow_module_css_default.rowText,
					children: [(0, react_jsx_runtime.jsx)("div", {
						className: PermissionRow_module_css_default.title,
						children: t("title")
					}), (0, react_jsx_runtime.jsx)("div", {
						className: PermissionRow_module_css_default.desc,
						role: state.error === null ? void 0 : "alert",
						children: description
					})]
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
					open,
					onClose: () => {
						setOpen(false);
					},
					items: state.options.map((option) => ({
						id: option.id,
						label: optionLabel(option)
					})),
					selectedId: state.currentValue,
					onSelect: (id) => {
						setOpen(false);
						if (id === state.currentValue) return;
						if (id === "danger-full-access") {
							setAcknowledged(false);
							setConfirmingFullAccess(true);
							return;
						}
						select(id);
					},
					align: "end",
					portal: true,
					anchor: (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: PermissionRow_module_css_default.selector,
						"aria-haspopup": "menu",
						"aria-expanded": open,
						disabled: busy || !state.writable || state.options.length === 0,
						onClick: () => {
							setOpen((value) => !value);
						},
						children: [label, (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { className: PermissionRow_module_css_default.chevron })]
					})
				})]
			}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.RiskConfirmation, {
				open: confirmingFullAccess,
				title: t("confirm.title"),
				description: t("confirm.description"),
				acknowledgeLabel: t("confirm.acknowledge"),
				cancelLabel: t("confirm.cancel"),
				closeLabel: t("close"),
				confirmLabel: t("confirm.enable"),
				acknowledged,
				disabled: !state.writable || state.status === "saving",
				onAcknowledgedChange: setAcknowledged,
				onCancel: () => {
					setAcknowledged(false);
					setConfirmingFullAccess(false);
				},
				onConfirm: () => {
					setAcknowledged(false);
					setConfirmingFullAccess(false);
					select(FULL_ACCESS_PRESET);
				}
			})] });
		}
