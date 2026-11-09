// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/html/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** HTML implementation identity, shared by metadata and the keyed slot. */
const HTML_BODY_ID = "@deepseek-ai/dsh-client-ui-sidebar-documentpreview/html";
/**
* Describe the builtin HTML renderer's file types and loading mode.
* @param title - locale-owned implementation name.
* @returns metadata for complete HTML documents.
*/
function htmlBodyDefinition(title) {
	return {
		id: HTML_BODY_ID,
		extensions: ["html", "htm"],
		priority: "builtin",
		title,
		loading: "bytes-complete",
		wrap: false
	};
}
/**
* Register the HTML dictionary, metadata and body with reversible effects.
* @param ctx - owning plugin context.
*/
function apply$6(ctx) {
	const t = ctx.locale.bind("documentHtml");
	ctx.effect(() => ctx.locale.register("documentHtml", {
		zh: zh$5,
		en: en$5,
		ja: ja$5,
		es: es$5,
		fr: fr$5,
		de: de$5,
		ru: ru$5,
		pt: pt$5
	}));
	ctx.effect(() => ctx.documentPreviews.register(htmlBodyDefinition(() => t("title"))));
	ctx.effect(() => ctx.slots.inject("sidebar.right.tab.document", () => ctx.slots.register({
		name: "sidebar.right.tab.document",
		key: HTML_BODY_ID,
		locale: "documentHtml",
		inject: () => ({
			hooks: { interactivePreview: ctx.configForms.developerTools.enabled },
			readRelated: (address, relativePath, signal) => {
				const file = hostFileOf(address);
				return ctx.remote.workspaceFiles.readBytes(file.sessionId, relativePath, { baseFile: file.path }, signal);
			}
		})
	}, HtmlBody)));
}
