// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/Pill.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render a pill chip. Interactive when onClick is supplied (renders a button);
* otherwise a static span.
* @param props.active - selected/active visual state.
* @returns pill element.
*/
function Pill({ active = false, className, children, onClick, ...rest }) {
	if (!onClick) return jsx("span", {
		className: clsx(css$12.pill, active && css$12.active, className),
		children
	});
	return jsx("button", {
		type: "button",
		className: clsx(css$12.pill, css$12.interactive, active && css$12.active, className),
		onClick,
		...rest,
		children
	});
}
