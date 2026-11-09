// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/PathLabel.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** A single-line file path whose trailing characters remain visible in narrow toolbars. */
/**
* Render subdued directories and a primary filename, with the complete path on hover.
* Fitting text is left-aligned; overflow clips and fades at the left edge.
* The fade updates on path changes and, when ResizeObserver is available, size changes.
* @param props - File path and attributes for its outer span; callers own toolbar spacing.
* @returns the path label.
*/
function PathLabel({ path, className, ...attributes }) {
	const boxRef = useRef(null);
	const textRef = useRef(null);
	const { directory, name } = pathPartsOf(path);
	useLayoutEffect(() => {
		const outer = boxRef.current;
		const inner = textRef.current;
		const apply = () => {
			outer.toggleAttribute("data-path-clipped", inner.offsetWidth > outer.clientWidth);
		};
		apply();
		const observer = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver(apply);
		observer?.observe(outer);
		observer?.observe(inner);
		return () => {
			observer?.disconnect();
		};
	}, [path]);
	return jsx("span", {
		...attributes,
		ref: boxRef,
		className: clsx(css$15.path, className),
		title: path,
		"data-path-label": true,
		children: jsxs("span", {
			ref: textRef,
			className: css$15.text,
			children: [directory !== "" && jsx("span", {
				className: css$15.directory,
				children: directory
			}), jsx("span", {
				className: css$15.name,
				children: name
			})]
		})
	});
}
