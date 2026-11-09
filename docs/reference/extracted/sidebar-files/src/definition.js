// Extracted from @deepseek-ai/dsh-client-ui-sidebar-files (lib/client.js); region lib/types/client/definition.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** The tab kind this package owns. */
const FILES_KIND = "files";
/** This implementation's identity in the tab system, and the key its body registers under. */
const FILES_ID = "@deepseek-ai/dsh-client-ui-sidebar-files";
/**
* The files type's registry definition.
* @param t - namespace-bound translate, read fresh on every label call.
* @returns the definition to register.
*/
function filesDefinition(t) {
	return {
		id: FILES_ID,
		kind: FILES_KIND,
		priority: "builtin",
		title: () => t("type.label"),
		guide: [{
			id: "workspace",
			commandId: "workspace.files",
			order: 10,
			title: () => t("guide.title"),
			description: () => t("guide.description"),
			icon: _deepseek_ai_dsh_client_ui_primitives.GuideArtworkFiles
		}]
	};
}
