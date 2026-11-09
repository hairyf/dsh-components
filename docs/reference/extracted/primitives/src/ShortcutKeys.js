// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/ShortcutKeys.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Shared shortcut keycaps; callers supply the effective platform presentation. */
/**
* Render one command's keycaps without owning binding defaults or localized copy.
* @param props - effective key labels, presentation variant and optional interaction styling.
* @returns unboxed keys by default, or tooltip keycaps with plus-separated combinations grouped together.
*/
function ShortcutKeys({ keys, variant = "plain", className }) {
	return jsx("span", {
		className: clsx(css$7.keys, variant === "tooltip" && css$7.tooltip, variant === "tooltip" && keys.includes("+") && css$7.joined, className),
		children: keys.map((key, index) => jsx("kbd", {
			className: key === "+" ? css$7.separator : css$7.key,
			children: key
		}, index))
	});
}
