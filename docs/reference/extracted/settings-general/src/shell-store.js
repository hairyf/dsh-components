// Extracted from @deepseek-ai/dsh-client-ui-settings-general (lib/client.js); region lib/types/client/shell-store.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Shared settings viewing state for its mouse and command entry points. */
/**
* Declare the settings dialog state and its complete mutation API.
* @returns one root-scoped store handle for the settings shell.
*/
function createSettingsShellStore() {
	return (0, _deepseek_ai_dsh_client_store.defineStore)({
		init: () => ({
			open: false,
			activeId: void 0
		}),
		actions: {
			open: (d) => {
				d.open = true;
			},
			close: (d) => {
				d.open = false;
				d.activeId = void 0;
			},
			select: (d, id) => {
				d.activeId = id;
			},
			openSection: (d, id) => {
				d.activeId = id;
				d.open = true;
			}
		}
	});
}
