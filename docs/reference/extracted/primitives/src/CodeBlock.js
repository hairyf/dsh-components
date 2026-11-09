// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/markdown/CodeBlock.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* The `pre` attributes shiki's HTML arm emits for the css-variables theme,
* mirrored so the streaming arm's tree is interchangeable with the settled
* swap (`tests/streaming-code-block.client.spec.tsx` pins the two arms'
* parity).
*/
const SHIKI_PRE_PROPS = {
	className: "shiki css-variables",
	style: {
		backgroundColor: "var(--shiki-background)",
		color: "var(--shiki-foreground)"
	},
	tabIndex: 0
};
/** Completed-line group size; React reconciles groups while the DOM remains line-for-line identical. */
const STREAMING_LINE_GROUP_SIZE = 32;
function renderLine(line, index) {
	return jsxs(Fragment$1, { children: [index > 0 && "\n", jsx("span", {
		className: "line",
		children: line.map((span, spanIndex) => jsx("span", {
			style: span.style,
			children: span.text
		}, spanIndex))
	})] }, index);
}
function CodeBlock({ code, lang, streaming, className, contentRef, lineNumbers = false, showHeader = true, copyLabel, copiedLabel, toolbarLabels, wrap }) {
	const trimmed = code.endsWith("\n") ? code.slice(0, -1) : code;
	const sourceLines = lineNumbers ? trimmed.split("\n") : void 0;
	const rootRef = useRef(null);
	const highlighting = useViewportHighlighting(rootRef, lang);
	const loaded = useSyncExternalStore(subscribeGrammarLoaded, grammarLoadCount, grammarLoadCount);
	const sessionRef = useRef(null);
	const lineCacheRef = useRef(null);
	const settledRef = useRef(false);
	const streamedBody = useMemo(() => {
		if (!highlighting) {
			sessionRef.current = null;
			lineCacheRef.current = null;
			settledRef.current = false;
			return;
		}
		if (streaming !== true) {
			const previous = lineCacheRef.current;
			if (previous !== null && previous.code === trimmed && previous.lang === lang) {
				settledRef.current = true;
				return previous.body;
			}
			sessionRef.current = null;
			lineCacheRef.current = null;
			settledRef.current = true;
			return;
		}
		if (settledRef.current) {
			sessionRef.current = null;
			lineCacheRef.current = null;
			settledRef.current = false;
		}
		sessionRef.current ??= new StreamingHighlightSession();
		const frame = sessionRef.current.updateFrame(trimmed, lang);
		if (frame === void 0) {
			lineCacheRef.current = null;
			return;
		}
		const previous = lineCacheRef.current;
		if (previous?.frame === frame && previous.code === trimmed && previous.lang === lang) return previous.body;
		const sameGeneration = previous?.generation === frame.generation;
		const groups = sameGeneration ? [...previous.groups] : [];
		let pending = sameGeneration ? [...previous.pending] : [];
		let nextLine = sameGeneration ? previous.nextLine : 0;
		for (const line of frame.appended) {
			pending.push(renderLine(line, nextLine));
			nextLine += 1;
			if (pending.length !== STREAMING_LINE_GROUP_SIZE) continue;
			const start = nextLine - pending.length;
			groups.push(jsx(Fragment$1, { children: pending }, start));
			pending = [];
		}
		const tail = frame.tail.map((line, index) => renderLine(line, nextLine + index));
		const tailGroup = jsx(Fragment$1, { children: [...pending, ...tail] }, nextLine - pending.length);
		const body = jsx("pre", {
			...SHIKI_PRE_PROPS,
			children: jsxs("code", { children: [groups, tailGroup] })
		});
		lineCacheRef.current = {
			code: trimmed,
			lang,
			generation: frame.generation,
			frame,
			groups,
			pending,
			nextLine,
			body
		};
		return body;
	}, [
		streaming,
		highlighting,
		trimmed,
		lang,
		loaded
	]);
	const html = useMemo(() => highlighting && streaming !== true && streamedBody === void 0 ? highlightToHtml(trimmed, lang) : void 0, [
		streaming,
		highlighting,
		streamedBody,
		trimmed,
		lang,
		loaded
	]);
	const [copied, setCopied] = useState(false);
	const [localWrapped, setWrapped] = useState(true);
	const wrapped = wrap ?? localWrapped;
	const onCopy = useCallback(() => {
		if (copied) return;
		writeClipboard(rootRef.current?.querySelector("pre")?.textContent ?? trimmed).then((ok) => {
			if (!ok) return;
			setCopied(true);
			window.setTimeout(() => {
				setCopied(false);
			}, 1e3);
		});
	}, [copied, trimmed]);
	const body = streamedBody !== void 0 ? streamedBody : html === void 0 ? jsx("pre", {
		className: css$37.plain,
		children: jsx("code", { children: sourceLines === void 0 ? trimmed : sourceLines.map((line, index) => jsxs(Fragment$1, { children: [index > 0 && "\n", jsx("span", {
			className: "line",
			children: line
		})] }, index)) })
	}) : jsx("div", { dangerouslySetInnerHTML: { __html: html } });
	return jsxs("div", {
		ref: rootRef,
		className: clsx(css$37.block, "md-code-block", lineNumbers && css$37.numbered, toolbarLabels !== void 0 && css$37.card, className),
		"data-line-numbers": lineNumbers || void 0,
		"data-code-wrap": toolbarLabels === void 0 ? void 0 : wrapped,
		style: sourceLines === void 0 ? void 0 : { "--dsl-code-block-line-number-width": `${Math.max(2, String(sourceLines.length).length)}ch` },
		children: [showHeader && jsx("div", {
			className: css$37.bannerWrap,
			children: toolbarLabels !== void 0 ? jsx(CodeToolbar, {
				lang,
				labels: toolbarLabels,
				copyLabel,
				copiedLabel,
				copied,
				wrapped,
				onCopy,
				onWrap: wrap === void 0 ? () => {
					setWrapped((value) => !value);
				} : void 0
			}) : jsxs("div", {
				className: css$37.banner,
				"data-code-block-banner": true,
				children: [jsx("div", {
					className: css$37.infostring,
					"data-text-interaction-exclude": "",
					children: lang ?? ""
				}), jsx("div", {
					className: css$37.action,
					children: jsx("button", {
						type: "button",
						className: css$37.copyButton,
						onClick: onCopy,
						children: copied ? copiedLabel : copyLabel
					})
				})]
			})
		}), jsx("div", {
			ref: contentRef,
			className: css$37.content,
			"data-code-block-content": true,
			children: body
		})]
	});
}
