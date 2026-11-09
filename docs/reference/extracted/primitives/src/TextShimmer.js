// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/TextShimmer.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Text activity animation shared by a row and its nested text fragments. */
const DecorativeCopy = createContext(void 0);
function TextContent({ children, className }) {
	const generated = useContext(DecorativeCopy) === true && typeof children === "string";
	return jsx("span", {
		className: clsx(css$2.text, className),
		"data-shimmer-text": generated ? children : void 0,
		children: generated ? null : children
	});
}
/**
* Render text with one shared highlight while retaining selectable, accessible content.
* Nested instances inherit the outer animation. Keep icons outside; mark decorative
* separators with data-shimmer-decoration so their background follows the highlight.
* Active children also render in an inert, clipped decoration; supply only presentation.
* @param props - localized text, running state, and owner styling.
* @returns retained text and its optional decorative highlight.
*/
const TextShimmer = memo(function TextShimmer({ children, active = false, className, contentClassName }) {
	if (useContext(DecorativeCopy) !== void 0) return jsx(TextContent, {
		className,
		children
	});
	const content = typeof children === "string" ? jsx(TextContent, { children }) : children;
	return jsxs("span", {
		className: clsx(css$2.root, className),
		"data-shimmer": active || void 0,
		children: [jsx(DecorativeCopy.Provider, {
			value: false,
			children: jsx("span", {
				className: clsx(css$2.content, contentClassName),
				children: content
			})
		}), active && jsx("span", {
			className: css$2.decoration,
			"aria-hidden": "true",
			inert: "",
			children: jsx("span", {
				className: css$2.sweep,
				children: jsx(DecorativeCopy.Provider, {
					value: true,
					children: jsx("span", {
						className: clsx(css$2.content, css$2.highlight, contentClassName),
						children: content
					})
				})
			})
		})]
	});
});
