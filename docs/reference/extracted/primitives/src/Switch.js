// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/Switch.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render a toggle switch.
* @param props.checked - the current state; the control is fully controlled.
* @param props.onChange - called with the state the click asks for.
* @param props.label - localized accessible name, owned by the render site.
* @param props.disabled - whether the control refuses input; owners also set it
* while a write is in flight, not only when a deployment locks the toggle.
* @param props.title - localized hover text, typically why the toggle is locked.
* @param props.className - extra class for layout placement.
* @returns the switch element.
*/
function Switch({ checked, onChange, label, disabled = false, title, className }) {
	return jsx("button", {
		type: "button",
		role: "switch",
		"aria-checked": checked,
		"aria-label": label,
		title,
		disabled,
		className: clsx(css$16.switch, className),
		onClick: () => {
			onChange(!checked);
		},
		children: jsx("span", { className: css$16.thumb })
	});
}
