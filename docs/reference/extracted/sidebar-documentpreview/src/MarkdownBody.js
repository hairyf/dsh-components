// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/markdown/MarkdownBody.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** One retained Markdown renderer over the document owner's accumulated text. */
/** Show the verbatim frontmatter when the field-list chunk cannot load. */
function FrontmatterFallback({ fallback }) {
	return fallback;
}
const FrontmatterFields = (0, react.lazy)(() => require.async("./client.frontmatter-fields.js").then((module) => ({ default: module.FrontmatterFields }), () => ({ default: FrontmatterFallback })));
/**
* Render one accumulated document; EOF completes the primitive's full parse.
* A leading YAML frontmatter block renders as a field list instead of Markdown; its
* verbatim source stands in while the field-list chunk loads or when it fails.
* @param props - owner-loaded contents and localized primitive labels.
* @returns Markdown content, or nothing for a non-text delivery.
*/
function MarkdownBody({ content, resourceAddress, useResource, t }) {
	const absolutePath = useResource(resourceAddress).value?.absolutePath;
	const pathImages = (0, react.useMemo)(() => ({ resolve: (value) => markdownImageUrl(document.baseURI, absolutePath, value) }), [absolutePath]);
	const copyLabel = t("code.copy");
	const copiedLabel = t("code.copied");
	const footnotes = t("footnotes");
	const codeLabel = t("codeBlock.title");
	const wrapLabel = t("codeBlock.wrap");
	const unwrapLabel = t("codeBlock.unwrap");
	const labels = (0, react.useMemo)(() => ({
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
		footnotes,
		codeLabel,
		wrapLabel,
		unwrapLabel
	]);
	const text = content.kind === "text" ? content.text : "";
	const split = (0, react.useMemo)(() => splitFrontmatter(text), [text]);
	if (content.kind !== "text") return null;
	return (0, react_jsx_runtime.jsxs)("div", {
		className: MarkdownBody_module_css_default.document,
		"data-document-markdown": true,
		children: [split === void 0 ? null : (0, react_jsx_runtime.jsx)(FrontmatterBox, { source: split.source }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
			text: split?.body ?? text,
			streaming: !content.eof,
			labels,
			pathImages
		})]
	});
}
/**
* Frame one frontmatter block and choose its field list or verbatim source.
* @param props - YAML between the frontmatter delimiters.
* @returns the metadata box; it collapses when the document has no content.
*/
function FrontmatterBox({ source }) {
	const verbatim = (0, react_jsx_runtime.jsx)("pre", {
		className: MarkdownBody_module_css_default.frontmatterSource,
		children: source
	});
	return (0, react_jsx_runtime.jsx)("div", {
		className: MarkdownBody_module_css_default.frontmatter,
		"data-document-frontmatter": true,
		children: (0, react_jsx_runtime.jsx)(react.Suspense, {
			fallback: verbatim,
			children: (0, react_jsx_runtime.jsx)(FrontmatterFields, {
				source,
				fallback: verbatim
			})
		})
	});
}
