// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/Button.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render a button.
* @param props.variant - visual family (default 'ghost'); outlined buttons use a DPR-aware inset stroke.
* @param props.size - 'md' 36px control with 12px corners or 'sm' 28px control with 8px corners.
* @param props.icon - optional leading 16px icon node.
* @param ref - native button for focus management and overlay anchors.
* @returns the button element; native button attributes pass through.
*/
const Button = forwardRef(function Button({ variant = "ghost", size = "md", icon, className, children, ...rest }, ref) {
	return jsxs("button", {
		ref,
		type: "button",
		className: clsx(css$6.button, css$6[variant], css$6[size], className),
		...rest,
		children: [icon != null && jsx("span", {
			className: css$6.icon,
			children: icon
		}), children]
	});
});
