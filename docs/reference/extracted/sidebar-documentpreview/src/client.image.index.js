// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/image/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Image implementation identity, shared by metadata and the keyed slot. */
const IMAGE_BODY_ID = "@deepseek-ai/dsh-client-ui-sidebar-documentpreview/image";
/** File suffixes rendered by the builtin image body. */
const IMAGE_EXTENSIONS = [
	"png",
	"jpg",
	"jpeg",
	"gif",
	"webp",
	"bmp",
	"ico",
	"svg"
];
/** Bitmap suffixes whose bytes are unreadable as text; SVG stays out because its XML source is worth reading. */
const BINARY_IMAGE_EXTENSIONS = [
	"png",
	"jpg",
	"jpeg",
	"gif",
	"webp",
	"bmp",
	"ico"
];
/**
* Describe the builtin image renderer independently from its keyed body slot.
* @param title - locale-owned implementation name.
* @returns metadata for complete image files.
*/
function imageBodyDefinition(title) {
	return {
		id: IMAGE_BODY_ID,
		extensions: IMAGE_EXTENSIONS,
		binaryExtensions: BINARY_IMAGE_EXTENSIONS,
		priority: "builtin",
		title,
		loading: "bytes-complete",
		wrap: false
	};
}
/**
* Register the image dictionary, metadata, and body with reversible effects.
* @param ctx - owning plugin context.
*/
function apply$5(ctx) {
	const t = ctx.locale.bind("sidebarImage");
	ctx.effect(() => ctx.locale.register("sidebarImage", {
		zh: zh$4,
		en: en$4,
		ja: ja$4,
		es: es$4,
		fr: fr$4,
		de: de$4,
		ru: ru$4,
		pt: pt$4
	}), "document-image: dictionaries");
	ctx.effect(() => ctx.documentPreviews.register(imageBodyDefinition(() => t("title"))), "document-image: metadata");
	const store = createZoomStore();
	const retainTab = retainDocumentTabs(ctx);
	ctx.effect(() => ctx.slots.inject("sidebar.right.tab.document", () => ctx.slots.register({
		name: "sidebar.right.tab.document",
		key: IMAGE_BODY_ID,
		locale: "sidebarImage",
		store,
		inject: (_sessionId, actions) => ({
			fileDrag: ctx.fileDrag.actions,
			retainTab: (tabId, signal) => {
				retainTab(tabId, signal, actions.forget);
			}
		})
	}, ImageBody)), "document-image: body");
}
