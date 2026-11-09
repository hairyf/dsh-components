// Extracted from @deepseek-ai/dsh-client-ui-sidebar-browser (lib/client.js); region lib/types/client/definition.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Browser tab kind. */
const BROWSER_KIND = "browser";
/** Browser implementation identity and keyed Slot dispatch key. */
const BROWSER_ID = "@deepseek-ai/dsh-client-ui-sidebar-browser";
/** Build the Browser type with locale-live copy. */
function browserDefinition(t) {
	return {
		id: BROWSER_ID,
		kind: BROWSER_KIND,
		multiple: true,
		priority: "builtin",
		title: () => t("type.label"),
		guide: [{
			id: "new",
			commandId: "browser.new",
			order: 30,
			title: () => t("guide.title"),
			description: () => t("guide.description"),
			icon: _deepseek_ai_dsh_client_ui_primitives.GuideArtworkBrowser
		}]
	};
}
