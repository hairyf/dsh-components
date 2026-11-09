// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/code/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

const ID = "@deepseek-ai/dsh-client-ui-sidebar-documentpreview/code";
const NS$1 = "sidebarCodePreview";
/** @param ctx - owning plugin context. Register localized metadata and the matching keyed document body. */
function apply$3(ctx) {
	ctx.effect(() => ctx.locale.register(NS$1, {
		zh: zh$2,
		en: en$2,
		ja: ja$2,
		es: es$2,
		fr: fr$2,
		de: de$2,
		ru: ru$2,
		pt: pt$2
	}));
	const t = ctx.locale.bind(NS$1);
	ctx.effect(() => ctx.documentPreviews.register({
		id: ID,
		extensions: _deepseek_ai_dsh_client_ui_primitives.CODE_HIGHLIGHT_EXTENSIONS,
		priority: "builtin",
		title: () => t("title"),
		loading: "text-pages",
		wrap: true,
		sourceLines: true
	}));
	ctx.effect(() => ctx.slots.inject("sidebar.right.tab.document", () => ctx.slots.register({
		name: "sidebar.right.tab.document",
		key: ID,
		locale: NS$1
	}, CodeBody)));
}
