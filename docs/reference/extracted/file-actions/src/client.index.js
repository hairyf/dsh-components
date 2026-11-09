// Extracted from @deepseek-ai/dsh-client-ui-file-actions (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Original-file actions independent of menu or image component ownership. */
/** The native adapter is optional; Web uses its own download and save capabilities. */
const inject = [];
/** @param ctx - plugin-owned Client context. */
function apply(ctx) {
	const desktop = window.dshDesktop?.fileActions;
	const actions = new BrowserFileActions(desktop);
	ctx.provide("fileActions", actions);
	ctx.effect(() => () => {
		actions.dispose();
	}, "file actions: lifetime");
	ctx.inject([
		"contextMenus",
		"slots",
		"locale",
		"remote",
		"remote.workspaceFiles",
		"remote.session"
	], (child) => {
		child.effect(() => child.locale.register("fileActions", {
			zh,
			en,
			ja,
			es,
			fr,
			de,
			ru,
			pt
		}), "file actions: locale");
		child.slots.inject("contextMenu.icon", function* () {
			for (const [key, Icon] of Object.entries({
				"file-actions.copy": _deepseek_ai_dsh_client_ui_primitives.IconCopyOutlineRegular,
				"file-actions.download": _deepseek_ai_dsh_client_ui_primitives.IconDownloadOutlineRegular,
				"file-actions.save": _deepseek_ai_dsh_client_ui_primitives.IconSaveOutlineRegular
			})) yield child.slots.register({
				name: "contextMenu.icon",
				key
			}, Icon);
		});
		registerFileMenus(child, actions, child.locale.bind("fileActions"));
	});
}
