// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.frontmatter-fields.js); region lib/types/client/markdown/frontmatter-fields.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Field list for a Markdown document's leading YAML frontmatter. The Markdown
		* body loads this module lazily so the YAML parser stays out of the startup
		* chunk.
		*/
		/**
		* Resolve top-level mapping fields from the YAML syntax tree.
		* @param source - YAML between the frontmatter delimiters.
		* @returns the fields, `[]` for a document without content, or `undefined` for invalid YAML and non-mapping documents.
		*/
		function parseFields(source) {
			const parsed = parseDocument(source);
			if (parsed.errors.length > 0) return void 0;
			if (parsed.contents === null) return [];
			if (!isMap(parsed.contents)) return void 0;
			return parsed.contents.items.map(({ key, value }) => ({
				key: nodeText(source, key),
				value: nodeText(source, value),
				block: isNode(value) && !isScalar(value)
			}));
		}
		function nodeText(source, node) {
			if (isScalar(node) && typeof node.value === "string") return node.value.trimEnd();
			if (!isNode(node)) return "";
			/* v8 ignore next -- parsed nodes always carry their source range. */
			const [start, end] = node.range ?? [0, 0];
			const indent = start - source.lastIndexOf("\n", start - 1) - 1;
			return source.slice(start, end).replace(new RegExp(`\\n {0,${indent}}`, "gu"), "\n").trimEnd();
		}
		/**
		* Render frontmatter fields, or the owner's verbatim block when the YAML is not a mapping.
		* @param props - frontmatter source and its verbatim fallback.
		* @returns the field list, the fallback, or nothing for a document without content.
		*/
		function FrontmatterFields({ source, fallback }) {
			const fields = (0, react.useMemo)(() => parseFields(source), [source]);
			if (fields === void 0) return fallback;
			if (fields.length === 0) return null;
			return (0, react_jsx_runtime.jsx)("dl", {
				className: frontmatter_fields_module_css_default.fields,
				children: fields.map((field, index) => (0, react_jsx_runtime.jsxs)("div", {
					className: frontmatter_fields_module_css_default.field,
					children: [(0, react_jsx_runtime.jsx)("dt", {
						className: frontmatter_fields_module_css_default.key,
						children: field.key
					}), (0, react_jsx_runtime.jsx)("dd", {
						className: field.block ? frontmatter_fields_module_css_default.block : frontmatter_fields_module_css_default.value,
						children: field.value
					})]
				}, index))
			});
		}
