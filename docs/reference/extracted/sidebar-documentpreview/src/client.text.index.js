// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/text/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Stable plain-text implementation identity within this package. */
const PLAIN_BODY_ID = "@deepseek-ai/dsh-client-ui-sidebar-documentpreview/text";
/**
* Describe the plain-text fallback.
* @param title - locale-owned implementation name.
* @returns plain-text registration metadata.
*/
function textBodyDefinition(title) {
	return {
		id: PLAIN_BODY_ID,
		extensions: [],
		priority: "builtin",
		title,
		loading: "text-pages",
		wrap: true,
		sourceLines: true
	};
}
/** @param ctx - owning plugin context. Register the fallback metadata and keyed body. */
function apply$9(ctx) {
	const t = ctx.locale.bind("sidebarDocumentPreview");
	ctx.effect(() => ctx.documentPreviews.register(textBodyDefinition(() => t("viewer.text"))));
	ctx.effect(() => ctx.slots.inject("sidebar.right.tab.document", () => ctx.slots.register({
		name: "sidebar.right.tab.document",
		key: PLAIN_BODY_ID
	}, TextBody)));
}
