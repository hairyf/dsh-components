// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/markdown/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Implementation identity shared by metadata and the document slot. */
const MARKDOWN_BODY_ID = "@deepseek-ai/dsh-client-ui-sidebar-documentpreview/markdown";
/**
* Describe the Markdown implementation without taking ownership of loading.
* @param title - locale-owned implementation name.
* @returns builtin Markdown registration metadata.
*/
function markdownDefinition(title) {
	return {
		id: MARKDOWN_BODY_ID,
		extensions: ["md", "markdown"],
		priority: "builtin",
		title,
		loading: "text-pages",
		wrap: false
	};
}
/**
* Register locale, metadata, and the document body for the owning plugin lifetime.
* @param ctx - plugin context carrying locale, document registry, and slots.
*/
function apply$8(ctx) {
	const t = ctx.locale.bind("documentMarkdown");
	ctx.effect(() => ctx.locale.register("documentMarkdown", {
		zh: zh$6,
		en: en$6,
		ja: ja$6,
		es: es$6,
		fr: fr$6,
		de: de$6,
		ru: ru$6,
		pt: pt$6
	}), "document-markdown: dictionaries");
	ctx.effect(() => ctx.documentPreviews.register(markdownDefinition(() => t("viewer.label"))), "document-markdown: metadata");
	ctx.effect(() => ctx.slots.inject("sidebar.right.tab.document", () => ctx.slots.register({
		name: "sidebar.right.tab.document",
		key: MARKDOWN_BODY_ID,
		locale: "documentMarkdown"
	}, MarkdownBody)), "document-markdown: body");
}
