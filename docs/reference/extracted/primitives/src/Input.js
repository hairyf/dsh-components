// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/Input.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render a text input with an optional leading icon.
* @param props.icon - optional 16px leading icon node.
* @param ref - the native input, cleared when it unmounts.
* @returns wrapper span containing the native input; input attributes pass through.
*/
const Input = forwardRef(function Input({ icon, className, ...rest }, ref) {
	return jsxs("span", {
		className: clsx(css$19.wrap, className),
		children: [icon != null && jsx("span", {
			className: css$19.icon,
			children: icon
		}), jsx("input", {
			ref,
			className: css$19.input,
			...rest
		})]
	});
});
