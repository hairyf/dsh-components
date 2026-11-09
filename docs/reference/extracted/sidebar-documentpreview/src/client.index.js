// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** This package's copy namespace. */
const NS = "sidebarDocumentPreview";
/**
* Required browser services: the tab registry, the slot registry, copy, and the
* workspace Remote for bytes and paged text reads.
*/
const inject = [
	"slots",
	"locale",
	"sidebarRightTabs",
	"remote",
	"remote.workspaceFiles",
	"configForms",
	"resources",
	"fileDrag"
];
/**
* Client plugin body: register the type, its dictionaries, its body, and its chip title.
* @param ctx - client root context carrying the registry, slots, copy, and file readers.
*/
function apply(ctx) {
	const config = Config(globalThis.__DSH_DOCUMENT_PREVIEW_CONFIG__ ?? {});
	const previews = new DocumentPreviewRegistry();
	const disposePreviews = ctx.reflect.provide("documentPreviews", previews);
	ctx.effect(() => disposePreviews);
	ctx.effect(() => ctx.sidebarRightTabs.register(textDefinition()), "ui-sidebar-documentpreview: text type");
	ctx.effect(() => ctx.locale.register(NS, {
		zh: zh$7,
		en: en$7,
		ja: ja$7,
		es: es$7,
		fr: fr$7,
		de: de$7,
		ru: ru$7,
		pt: pt$7
	}), "ui-sidebar-documentpreview: dictionaries");
	const store = createTextStore();
	const face = textFace(createReadPage(ctx.remote), (file, signal) => ctx.remote.workspaceFiles.readBytes(file.sessionId, file.path, {}, signal), ctx.resources);
	const source = {
		getSnapshot: previews.getSnapshot,
		subscribe: previews.subscribe
	};
	ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
		name: "sidebar.right.pane.tab",
		key: TEXTPREVIEW_ID,
		locale: NS,
		store,
		children: {
			"sidebar.right.tab.document": {
				kind: "keyed",
				scope: "session",
				inject: { hooks: { tabInfo: documentTabInfoFactory } }
			},
			"sidebar.right.tab.document.actions": {
				kind: "list",
				scope: "session"
			},
			"sidebar.right.tab.document.unpreviewable": {
				kind: "list",
				scope: "session"
			},
			"sidebar.right.tab.document.action": {
				kind: "keyed",
				scope: "session",
				inject: { hooks: { tabInfo: documentTabInfoFactory } }
			}
		},
		inject: (sessionId, actions) => ({
			...face(sessionId, actions),
			hooks: { documentPreviews: source }
		})
	}, TextPreview)), "ui-sidebar-documentpreview: text body");
	ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab.title", () => ctx.slots.register({
		name: "sidebar.right.pane.tab.title",
		key: TEXTPREVIEW_ID
	}, TextTitle)), "ui-sidebar-documentpreview: text title");
	apply$9(ctx);
	apply$8(ctx);
	apply$6(ctx);
	apply$5(ctx);
	apply$4(ctx);
	apply$2(ctx, config.office);
	apply$1(ctx, config.excel);
	apply$3(ctx);
}
