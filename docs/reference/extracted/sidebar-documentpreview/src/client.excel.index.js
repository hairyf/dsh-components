// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/excel/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Register the browser Excel viewer and its lifecycle-owned slot.
* @param ctx - Preview and locale registries.
* @param limits - Resolved parser limits.
*/
function apply$1(ctx, limits) {
	const id = "@deepseek-ai/dsh-client-ui-sidebar-documentpreview/excel";
	ctx.effect(() => ctx.locale.register("sidebarExcel", {
		zh,
		en,
		ja,
		es,
		fr,
		de,
		ru,
		pt
	}));
	const t = ctx.locale.bind("sidebarExcel");
	ctx.effect(() => ctx.documentPreviews.register({
		id,
		extensions: [
			"xlsx",
			"xls",
			"csv",
			"tsv"
		],
		binaryExtensions: ["xlsx", "xls"],
		priority: "builtin",
		title: () => t("title"),
		loading: "bytes-complete",
		wrap: false
	}));
	ctx.effect(() => ctx.slots.inject("sidebar.right.tab.document", () => ctx.slots.register({
		name: "sidebar.right.tab.document",
		key: id,
		locale: "sidebarExcel",
		inject: () => ({ limits })
	}, LazyExcelBody)));
}
