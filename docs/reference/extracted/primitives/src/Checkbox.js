// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/Checkbox.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Controlled native checkbox with a caller-owned visible and accessible label. */
/**
* Render a labeled checkbox with native keyboard and form semantics.
* @param props.checked - current checked state.
* @param props.onChange - receives the requested checked state.
* @param props.label - localized visible and accessible label.
* @param props.disabled - whether the control refuses changes.
* @param props.title - optional localized hover text.
* @param props.className - extra class for the label's placement.
* @returns the label containing its checkbox.
*/
function Checkbox({ checked, onChange, label, disabled = false, title, className }) {
	return jsxs("label", {
		className: clsx(css$18.checkbox, className),
		title,
		children: [jsx("input", {
			type: "checkbox",
			checked,
			disabled,
			onChange: (event) => {
				onChange(event.target.checked);
			}
		}), jsx("span", { children: label })]
	});
}
