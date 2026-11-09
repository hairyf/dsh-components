// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/CommandText.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Selectable command text with keyboard access while horizontally overflowing. */
/**
* Render command text without adding Tab stops for content that fits.
* @param props - Text, localized scrollport name, and owner styling.
* @returns A horizontal text scrollport, named and keyboard-focusable only when overflowing.
*/
function CommandText({ text, label, className }) {
	const ref = useRef(null);
	const [overflow, setOverflow] = useState(false);
	useLayoutEffect(() => {
		const element = ref.current;
		/* v8 ignore next -- the span is rendered unconditionally. */
		if (element === null) return void 0;
		const measure = () => {
			setOverflow(element.scrollWidth > element.clientWidth);
		};
		measure();
		const observer = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver(measure);
		observer?.observe(element);
		const fonts = "fonts" in element.ownerDocument ? element.ownerDocument.fonts : void 0;
		fonts?.addEventListener("loadingdone", measure);
		return () => {
			observer?.disconnect();
			fonts?.removeEventListener("loadingdone", measure);
		};
	}, [text]);
	return jsx("span", {
		ref,
		className: clsx(css$33.text, className),
		"data-command-text": true,
		tabIndex: overflow ? 0 : void 0,
		role: overflow ? "group" : void 0,
		"aria-label": overflow ? label : void 0,
		children: text
	});
}
