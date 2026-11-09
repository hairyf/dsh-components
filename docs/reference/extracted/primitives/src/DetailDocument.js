// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/DetailDocument.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* The state {@link DetailDocument} shows for an owner's read: loading until it settles, then the document, none, or the
* failure.
* @param read - the owner's read; undefined before it starts.
* @returns the state to show.
*/
function detailDocumentState(read) {
	if (read?.status === "ready") return read.markdown === void 0 ? { status: "none" } : {
		status: "found",
		markdown: read.markdown
	};
	return read?.status === "error" ? read : { status: "loading" };
}
/**
* Assemble reference-stable labels for {@link DetailDocument} from translated strings.
* @param copy - the translated strings.
* @returns labels that keep their identity while the strings stay equal.
*/
function useDetailDocumentLabels(copy) {
	const { title, loading, retry, footnotes } = copy;
	const { copy: copyLabel, copied: copiedLabel, codeBlock: codeLabel, wrap: wrapLabel, unwrap: unwrapLabel } = copy;
	const markdown = useMemo(() => ({
		code: {
			copyLabel,
			copiedLabel,
			toolbarLabels: {
				codeLabel,
				wrapLabel,
				unwrapLabel
			}
		},
		footnotes
	}), [
		copyLabel,
		copiedLabel,
		codeLabel,
		wrapLabel,
		unwrapLabel,
		footnotes
	]);
	return useMemo(() => ({
		title,
		loading,
		retry,
		markdown
	}), [
		title,
		loading,
		retry,
		markdown
	]);
}
/**
* A section showing a long Markdown description, without a heading of its own: three skeleton lines while it loads, the
* document once found, or the owner's failure message with a retry. Nothing renders for `none`. A document taller than
* the section's height limit scrolls inside it, and the scroll region, named by `labels.title`, takes keyboard focus.
* Raw HTML is omitted, relative links stay text, and only images the owner's `images` resolver accepts, or absolute
* HTTP(S) images, load.
* @param props.state - the read to show.
* @param props.labels - localized region name, placeholder name, retry text, and Markdown chrome; keep `markdown` reference-stable.
* @param props.images - resolves the document's relative image destinations to displayable URLs.
* @param props.onRetry - reads the document again after a failure.
* @returns the section, or null.
*/
function DetailDocument({ state, labels, images, onRetry }) {
	if (state.status === "none") return null;
	let body;
	switch (state.status) {
		case "found":
			body = jsx("div", {
				className: css$42.document,
				role: "region",
				"aria-label": labels.title,
				tabIndex: 0,
				children: jsx(MarkdownText, {
					text: state.markdown,
					labels: labels.markdown,
					pathImages: images,
					omitHtml: true
				})
			});
			break;
		case "error":
			body = jsxs("div", {
				className: css$42.failure,
				children: [jsxs("p", {
					className: css$42.error,
					role: "alert",
					children: [jsx(StateDot, { state: "error" }), state.message]
				}), jsx(Button, {
					variant: "outline",
					size: "sm",
					onClick: onRetry,
					children: labels.retry
				})]
			});
			break;
		case "loading":
			body = jsxs("div", {
				className: css$42.skeleton,
				role: "status",
				"aria-label": labels.loading,
				"aria-busy": "true",
				children: [
					jsx("span", { className: `${css$42.bar} ${css$42.long}` }),
					jsx("span", { className: `${css$42.bar} ${css$42.long}` }),
					jsx("span", { className: `${css$42.bar} ${css$42.short}` })
				]
			});
			break;
	}
	return jsx("section", {
		className: css$42.section,
		"data-detail-document": true,
		children: body
	});
}
