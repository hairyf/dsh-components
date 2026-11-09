// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/input/editor/CommandChip.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Visual body of the claimed command chip: the CommandChipNode's React face.
* Pure display with the reference chip's treatment; the claim and its
* lifecycle live on the node and the shell.
*/
/**
* Render the claimed command chip.
* @param props - the token to display.
* @returns the chip body.
*/
function CommandChip({ token }) {
	return (0, react_jsx_runtime.jsx)("span", {
		className: clsx(composer_editor_module_css_default.reference, ReferenceChip_module_css_default.chip),
		children: (0, react_jsx_runtime.jsx)("span", {
			className: ReferenceChip_module_css_default.label,
			children: token
		})
	});
}
