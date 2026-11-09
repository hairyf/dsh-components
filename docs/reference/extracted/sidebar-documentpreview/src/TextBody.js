// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/text/TextBody.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** @param props - document contents and standard tab information. @returns source lines with navigation targets. */
function TextBody({ content, useTabInfo }) {
	const { tab } = useTabInfo();
	const params = tab.navigation.params;
	const target = params !== void 0 && "line" in params ? params.line : void 0;
	if (content.kind !== "text") return null;
	return (0, react_jsx_runtime.jsx)("div", {
		className: TextPreview_module_css_default.textDocument,
		"data-textpreview-plain": true,
		children: content.pages.map((page) => (0, react_jsx_runtime.jsx)("pre", {
			className: TextPreview_module_css_default.page,
			"data-textpreview-page": page.offset,
			children: linesOf(page).map((text, index) => {
				const number = page.offset + index;
				return (0, react_jsx_runtime.jsxs)("div", {
					className: TextPreview_module_css_default.line,
					"data-textpreview-line": number,
					...number === target ? { "data-textpreview-target": number } : {},
					children: [text, "\n"]
				}, number);
			})
		}, page.offset))
	});
}
