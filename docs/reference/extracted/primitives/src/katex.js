// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/markdown/katex.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* TeX-to-React via KaTeX, replicating the rehype-katex pipeline this renderer
* replaced: the same three-arm error chain (strict render, `strict: 'ignore'`
* retry, error span) and a DOM-identical element tree, so settled math keeps
* its exact markup. KaTeX emits an HTML string; the browser's own HTML parser
* (`DOMParser`, applying the spec's SVG/MathML foreign-content attribute
* adjustments KaTeX output relies on) turns it into a tree this module maps
* onto React elements — KaTeX output is a static span/MathML/SVG vocabulary
* with no raw user HTML, the same trust shiki's tree gets in CodeBlock.
*
* React 18 has no MathML support, so the `.katex-mathml` subtree's elements
* land in the HTML namespace — exactly as they did under the replaced
* hast-util-to-jsx-runtime pipeline. The visual arm is the `.katex-html`
* span tree; the MathML arm serves assistive technology, which reads it by
* tag name regardless of namespace.
*/
/**
* Convert one inline `style` attribute string into React's style object.
* KaTeX emits only plain kebab-case declarations (no custom properties and no
* nameless declarations), so camel-casing the property is the whole mapping.
*/
function styleObject(css) {
	const style = {};
	for (const declaration of css.split(";")) {
		const colon = declaration.indexOf(":");
		if (colon === -1) continue;
		const key = declaration.slice(0, colon).trim().replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
		style[key] = declaration.slice(colon + 1).trim();
	}
	return style;
}
/** Map one parsed DOM node onto a React element (text nodes pass through). */
function domToReact(node, key) {
	if (node.nodeType === Node.TEXT_NODE) return node.textContent;
	/* v8 ignore next 2 -- KaTeX output holds only elements and text; other
	node kinds cannot appear in its serialized vocabulary. */
	if (node.nodeType !== Node.ELEMENT_NODE) return null;
	const element = node;
	const props = { key };
	for (const attribute of element.attributes) if (attribute.name === "class") props["className"] = attribute.value;
	else if (attribute.name === "style") props["style"] = styleObject(attribute.value);
	else props[attribute.name] = attribute.value;
	const children = [...element.childNodes].map(domToReact);
	return children.length === 0 ? createElement(element.localName, props) : createElement(element.localName, props, ...children);
}
/**
* Render TeX source to React elements through KaTeX.
* @param value - The TeX source (math node value; fenced `math` blocks append
* their trailing newline to match the replaced pipeline's text extraction).
* @param displayMode - Display (block) versus inline rendering.
* @returns KaTeX's element tree, or the error span when the source does not
* parse (colored with KaTeX's stock `errorColor`, matching rehype-katex).
*/
function renderTexToReact(value, displayMode) {
	let html;
	try {
		html = katex.renderToString(value, {
			displayMode,
			throwOnError: true
		});
	} catch (error) {
		try {
			html = katex.renderToString(value, {
				displayMode,
				strict: "ignore",
				throwOnError: false
			});
		} catch {
			/* v8 ignore next 8 */
			return jsx("span", {
				className: "katex-error",
				style: { color: "#cc0000" },
				title: String(error),
				children: value
			});
		}
	}
	return [...new DOMParser().parseFromString(html, "text/html").body.childNodes].map(domToReact);
}
