// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/QuotePreview.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Shared compact presentation for draft and sent text quotes. */
function QuoteMarkIcon({ className }) {
	return jsx("svg", {
		width: 16,
		height: 16,
		className,
		viewBox: "0 0 16 16",
		fill: "none",
		"aria-hidden": true,
		children: jsxs("g", {
			transform: "translate(6.8 2.4)",
			children: [jsx("path", {
				d: "M2.8125 0.583008L3.2002 1.16602C2.43912 1.6713 1.88491 2.41238 1.60547 3.25684H2.98926V6.70605H0V4.52148C1.96593e-05 2.70313 0.9109 1.00575 2.42578 0L2.8125 0.583008Z",
				fill: "currentColor"
			}), jsx("path", {
				d: "M7.50781 0.583008L7.89551 1.16602C7.13443 1.6713 6.58022 2.41238 6.30078 3.25684H7.68457V6.70605H4.69531V4.52148C4.69533 2.70313 5.60621 1.00575 7.12109 0L7.50781 0.583008Z",
				fill: "currentColor"
			})]
		})
	});
}
/**
* Render one width-capped quote preview shared by editable drafts and sent messages.
* Clipped excerpts open a content-sized, scrollable popover that fits within the viewport.
* @param props - selected text and optional localized removal action.
* @returns a non-navigating quote preview with a full-text popover only while clipped.
*/
function QuotePreview({ text, removal }) {
	const sourceRef = useRef(null);
	const [truncated, setTruncated] = useState(false);
	useLayoutEffect(() => {
		const source = sourceRef.current;
		/* v8 ignore next -- the ref is attached before layout effects run. */
		if (source === null) return;
		const measure = () => {
			setTruncated(source.scrollWidth > source.clientWidth);
		};
		measure();
		if (typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver(measure);
		observer.observe(source);
		return () => {
			observer.disconnect();
		};
	}, [text]);
	const remove = (event) => {
		event.preventDefault();
		event.stopPropagation();
		removal?.onRemove();
	};
	const preview = jsxs("span", {
		className: css$43.quote,
		"data-quote-preview": "",
		"data-removable": removal === void 0 ? void 0 : "",
		children: [removal === void 0 ? jsx("span", {
			className: css$43.marker,
			"aria-hidden": true,
			children: jsx(QuoteMarkIcon, { className: css$43.quoteMark })
		}) : jsxs("button", {
			type: "button",
			className: css$43.remove,
			"aria-label": removal.label,
			onPointerDown: (event) => {
				event.preventDefault();
				event.stopPropagation();
			},
			onKeyDown: (event) => {
				event.stopPropagation();
			},
			onClick: remove,
			children: [jsx(QuoteMarkIcon, { className: css$43.quoteMark }), jsx(IconCloseOutlineRegular, {
				size: 12,
				className: css$43.closeMark
			})]
		}), jsx("span", {
			ref: sourceRef,
			className: css$43.source,
			"data-quote-preview-text": "",
			children: text
		})]
	});
	return jsx(HoverCard, {
		inline: true,
		grouped: true,
		fitContent: true,
		openDelayMs: 0,
		disabled: !truncated,
		anchor: preview,
		content: jsx("span", {
			className: css$43.popoverText,
			"data-quote-popover": "",
			"aria-hidden": "true",
			children: text
		})
	});
}
