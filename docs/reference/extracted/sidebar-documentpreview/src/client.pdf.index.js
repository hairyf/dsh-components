// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/pdf/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** PDF metadata and keyed body share this package-local implementation identity. */
const PDF_BODY_ID = "@deepseek-ai/dsh-client-ui-sidebar-documentpreview/pdf";
/**
* Describe the builtin PDF renderer independently from its keyed body slot.
* @param title - locale-owned implementation name.
* @returns the complete-file PDF registration.
*/
function pdfBodyDefinition(title) {
	return {
		id: PDF_BODY_ID,
		extensions: ["pdf"],
		binaryExtensions: ["pdf"],
		priority: "builtin",
		title,
		loading: "bytes-complete",
		wrap: false
	};
}
/** @param ctx - context carrying the locale, document registry, and slot registry. */
function apply$4(ctx) {
	ctx.effect(() => ctx.locale.register("sidebarPdf", {
		zh: zh$3,
		en: en$3,
		ja: ja$3,
		es: es$3,
		fr: fr$3,
		de: de$3,
		ru: ru$3,
		pt: pt$3
	}));
	const t = ctx.locale.bind("sidebarPdf");
	ctx.effect(() => ctx.documentPreviews.register(pdfBodyDefinition(() => t("title"))));
	const presentation = pdfBodyRegistration(ctx);
	ctx.effect(() => ctx.slots.inject("sidebar.right.tab.document", () => ctx.slots.register({
		name: "sidebar.right.tab.document",
		key: PDF_BODY_ID,
		locale: "sidebarPdf",
		...presentation
	}, LazyPdfBody)));
}
/**
* Retain PDF viewing state for a document entry's tab lifetime.
* @param ctx - owning registration context.
* @returns the store and injection shared by ordinary and Office PDF registrations.
*/
function pdfBodyRegistration(ctx) {
	const store = createPdfStore();
	const retainTab = retainDocumentTabs(ctx);
	return {
		store,
		inject: (_sessionId, actions) => ({
			retainTab: (tabId, signal) => {
				retainTab(tabId, signal, actions.forget);
			},
			ZoomViewport,
			zoomSurfaceClass
		})
	};
}
