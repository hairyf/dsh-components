// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/ReadBlock.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Content lines shown before the height cap collapses the middle. Matches
* TerminalBlock's default so a long read and a long command output cut at the
* same place in the same flow.
*/
const DEFAULT_READ_MAX_LINES = 16;
function renderSpans(spans) {
	return spans.map((span, index) => jsx("span", {
		style: span.style,
		children: span.text
	}, index));
}
/**
* Render a read tool result as a line-numbered, optionally syntax-highlighted
* file view.
* @param props - see {@link ReadBlockProps}.
* @returns the read block element.
*/
function ReadBlock({ label, labels, lines, totalLines, lang, maxLines = 16, className }) {
	const rootRef = useRef(null);
	const highlighting = useViewportHighlighting(rootRef, lang);
	const raw = useMemo(() => lines.map((line) => line.text).join("\n"), [lines]);
	const highlighted = useMemo(() => highlighting ? highlightLines(raw, lang) : void 0, [
		highlighting,
		raw,
		lang,
		useSyncExternalStore(subscribeGrammarLoaded, grammarLoadCount, grammarLoadCount)
	]);
	const [expanded, setExpanded] = useState(false);
	const [copied, setCopied] = useState(false);
	const [wrapped, setWrapped] = useState(false);
	const onCopy = useCallback(() => {
		if (copied) return;
		writeClipboard(raw).then((ok) => {
			if (!ok) return;
			setCopied(true);
			window.setTimeout(() => {
				setCopied(false);
			}, 1e3);
		});
	}, [copied, raw]);
	const onToggle = useCallback(() => {
		setExpanded((value) => !value);
	}, []);
	const hidden = lines.length - maxLines;
	const capped = hidden > 0 && !expanded;
	const headLines = Math.ceil(maxLines / 2);
	const tailLines = maxLines - headLines;
	const windowed = lines.length < totalLines;
	const rows = (slice) => slice.map(([line, spans]) => jsxs("div", {
		className: css$34.line,
		children: [jsx("span", {
			className: css$34.gutter,
			"aria-hidden": true,
			children: line.number
		}), jsx("span", {
			className: css$34.content,
			children: spans === void 0 ? line.text : renderSpans(spans)
		})]
	}, line.number));
	const gutterStyle = { "--dsl-read-gutter": `${lines.reduce((digits, line) => Math.max(digits, String(line.number).length), 3)}ch` };
	const paired = lines.map((line, index) => [line, highlighted?.[index]]);
	return jsxs("div", {
		ref: rootRef,
		className: clsx(cardCss.card, css$34.block, className),
		"data-read": "",
		"data-code-wrap": wrapped,
		style: gutterStyle,
		children: [jsx(CodeToolbar, {
			lang,
			title: label,
			status: windowed ? labels.window(lines.length, totalLines) : void 0,
			labels,
			copyLabel: labels.copy,
			copiedLabel: labels.copied,
			copied,
			wrapped,
			onCopy: lines.length > 0 ? onCopy : void 0,
			onWrap: () => {
				setWrapped((value) => !value);
			}
		}), jsxs("div", {
			className: cardCss.body,
			children: [
				rows(capped ? paired.slice(0, headLines) : paired),
				hidden > 0 && jsx(FoldToggle, {
					className: css$34.expand,
					expanded,
					hidden,
					labels,
					onToggle
				}),
				capped && rows(paired.slice(paired.length - tailLines))
			]
		})]
	});
}
