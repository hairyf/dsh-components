// Extracted from @deepseek-ai/dsh-client-ui-theme (lib/client.js); region lib/types/client/FontSettingsGroup.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Font settings registered into the General section item slot: the text
* font-size row, whose disclosure button expands a region holding the font
* row for each role and the code and terminal size rows. The region starts
* collapsed on every mount.
*/
/**
* Render the text font-size row and its expandable font settings.
* @param props - composed slot props.
* @returns the text size row and, when expanded, the font rows.
*/
function FontSettingsGroup({ setFontFamily, setFontSize, ...shared }) {
	const [open, setOpen] = (0, react.useState)(false);
	const regionId = (0, react.useId)();
	const family = (role) => (0, react_jsx_runtime.jsx)(FontFamilyRow, {
		...shared,
		role,
		setFontFamily: (value) => {
			setFontFamily(role, value);
		}
	});
	const size = (role, expander) => (0, react_jsx_runtime.jsx)(FontSizeRow, {
		...shared,
		role,
		expander,
		setFontSize: (px) => {
			setFontSize(role, px);
		}
	});
	return (0, react_jsx_runtime.jsxs)("div", {
		className: FontSettingsGroup_module_css_default.group,
		children: [size("text", {
			open,
			controls: regionId,
			onToggle: () => {
				setOpen((value) => !value);
			}
		}), open && (0, react_jsx_runtime.jsxs)("div", {
			id: regionId,
			children: [
				family("text"),
				family("code"),
				size("code"),
				family("terminal"),
				size("terminal")
			]
		})]
	});
}
