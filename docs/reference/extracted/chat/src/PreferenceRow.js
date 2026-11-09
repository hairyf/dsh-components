// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/settings/PreferenceRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Localized two-column selector shared by Chat preference rows. */
/**
* Render a preference label and its menu; selection restores focus before publishing the new value.
* @param props - localized copy, selected value, choices, and mutation callback.
* @returns the settings row.
*/
function PreferenceRow({ title, description, value, selectedLabel, options, onSelect }) {
	const [open, setOpen] = (0, react.useState)(false);
	const selectorRef = (0, react.useRef)(null);
	const closeMenu = () => {
		setOpen(false);
	};
	const selectMode = (id) => {
		selectorRef.current?.focus({ preventScroll: true });
		closeMenu();
		onSelect(id);
	};
	const selector = (0, react_jsx_runtime.jsxs)("button", {
		ref: selectorRef,
		type: "button",
		className: PreferenceRow_module_css_default.selector,
		"aria-haspopup": "menu",
		"aria-expanded": open,
		onClick: () => {
			setOpen((value) => !value);
		},
		children: [selectedLabel, (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { className: PreferenceRow_module_css_default.chevron })]
	});
	return (0, react_jsx_runtime.jsxs)("div", {
		className: PreferenceRow_module_css_default.row,
		children: [(0, react_jsx_runtime.jsxs)("div", {
			className: PreferenceRow_module_css_default.rowText,
			children: [(0, react_jsx_runtime.jsx)("div", {
				className: PreferenceRow_module_css_default.title,
				children: title
			}), (0, react_jsx_runtime.jsx)("div", {
				className: PreferenceRow_module_css_default.desc,
				children: description
			})]
		}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
			open,
			onClose: closeMenu,
			items: options,
			selectedId: value,
			onSelect: selectMode,
			align: "end",
			portal: true,
			anchor: selector
		})]
	});
}
