// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/input/editor/ReferenceChip.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Visual body of one inline reference chip: the DecoratorNode's React
* face. Pure display — identity, invalidation, and lifecycle live on the
* ReferenceChipNode; this component renders whatever the node carries.
*/
/**
* Render one inline reference chip.
* @param props - label, optional domain glyph, and the invalid bit.
* @returns the chip body (icon + truncating label).
*/
function ReferenceChip({ label, appearance, invalid }) {
	return (0, react_jsx_runtime.jsxs)("span", {
		className: clsx(composer_editor_module_css_default.reference, ReferenceChip_module_css_default.chip, appearance === "file" && !invalid && composer_editor_module_css_default.openable, invalid && ReferenceChip_module_css_default.invalid),
		title: label,
		children: [appearance === void 0 ? (0, react_jsx_runtime.jsx)("span", {
			className: ReferenceChip_module_css_default.marker,
			"aria-hidden": true,
			children: "@"
		}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ReferenceIconRegular, {
			kind: appearance,
			size: 14,
			className: ReferenceChip_module_css_default.icon
		}), (0, react_jsx_runtime.jsx)("span", {
			className: ReferenceChip_module_css_default.label,
			children: label
		})]
	});
}
