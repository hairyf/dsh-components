// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/Tag.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render a read-only tag.
* @param props.tone - which palette to use (default `outline`).
* @param props.className - extra class for layout placement.
* @param props.children - the localized label, owned by the render site.
* @returns the tag element.
*/
function Tag({ tone = "outline", className, children }) {
	return jsx("span", {
		className: clsx(css$14.tag, className),
		"data-tone": tone,
		children
	});
}
