// Extracted from @deepseek-ai/dsh-client-ui-theme (lib/client.js); region lib/types/client/FontFamilyRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Font-family preference row rendered inside the font settings group, once
		* per font role: title + role description + a text field holding the
		* comma-separated family list. Blur or Enter normalizes and commits the list;
		* an empty field restores the built-in stack. The field shows the persisted
		* list and resets whenever that list changes.
		*/
		/**
		* Render one font-family row.
		* @param props - composed slot props.
		* @returns the row element tree.
		*/
		function FontFamilyRow({ t, role, setFontFamily, useStore }) {
			const value = useStore((s) => s.fontFamilies[role]);
			const title = t(`fontFamily.${role}.title`);
			const commit = (input) => {
				input.value = normalizeFontFamily(input.value);
				setFontFamily(input.value);
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: clsx(FontSizeRow_module_css_default.row, FontSizeRow_module_css_default.stacked),
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: FontSizeRow_module_css_default.rowText,
					children: [(0, react_jsx_runtime.jsx)("div", {
						className: FontSizeRow_module_css_default.title,
						children: title
					}), (0, react_jsx_runtime.jsx)("div", {
						className: FontSizeRow_module_css_default.desc,
						children: t(`fontFamily.${role}.description`)
					})]
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
					className: FontFamilyRow_module_css_default.field,
					defaultValue: value,
					placeholder: t("fontFamily.placeholder"),
					"aria-label": title,
					spellCheck: false,
					autoComplete: "off",
					onBlur: (event) => {
						commit(event.currentTarget);
					},
					maxLength: 200,
					onKeyDown: (event) => {
						if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
						if (event.key === "Enter") event.currentTarget.blur();
					}
				}, value)]
			});
		}
