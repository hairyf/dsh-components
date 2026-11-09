// Extracted from @deepseek-ai/dsh-client-ui-theme (lib/client.js); region lib/types/client/FontSizeRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Font-size preference row: title + role description + stepper pill (centered value; hover
		* reveals the up/down arrow column anchored to the pill's right edge) + a px
		* unit label after the pill. The text row is registered into the General
		* section item slot; the code and terminal rows render inside the font
		* settings group. The displayed value follows the persisted setting, never the
		* click echo.
		*/
		/**
		* Render the font-size row.
		* @param props - composed slot props.
		* @returns the row element tree.
		*/
		function FontSizeRow({ t, role, setFontSize, useStore, expander }) {
			const fontSize = useStore((s) => s.fontSizes[role]);
			const { min, max } = FONT_SIZE_SPECS[role];
			return (0, react_jsx_runtime.jsxs)("div", {
				className: FontSizeRow_module_css_default.row,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: FontSizeRow_module_css_default.rowText,
					children: [(0, react_jsx_runtime.jsx)("div", {
						className: FontSizeRow_module_css_default.title,
						children: t(`fontSize.${role}.title`)
					}), (0, react_jsx_runtime.jsx)("div", {
						className: FontSizeRow_module_css_default.desc,
						children: t(`fontSize.${role}.description`)
					})]
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: FontSizeRow_module_css_default.control,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: FontSizeRow_module_css_default.stepper,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: FontSizeRow_module_css_default.value,
								children: fontSize
							}), (0, react_jsx_runtime.jsxs)("span", {
								className: FontSizeRow_module_css_default.arrows,
								children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: FontSizeRow_module_css_default.arrow,
									"aria-label": t(`fontSize.${role}.increase`),
									disabled: fontSize >= max,
									onClick: () => {
										setFontSize(fontSize + 1);
									},
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, { size: 9 })
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: FontSizeRow_module_css_default.arrow,
									"aria-label": t(`fontSize.${role}.decrease`),
									disabled: fontSize <= min,
									onClick: () => {
										setFontSize(fontSize - 1);
									},
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: 9 })
								})]
							})]
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: FontSizeRow_module_css_default.unit,
							children: t("fontSize.unit")
						}),
						expander !== void 0 && (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: FontSizeRow_module_css_default.expander,
							"aria-label": t("fontSize.more"),
							title: t("fontSize.more"),
							"aria-expanded": expander.open,
							"aria-controls": expander.controls,
							onClick: expander.onToggle,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: 12 })
						})
					]
				})]
			});
		}
