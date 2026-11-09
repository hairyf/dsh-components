// Extracted from @deepseek-ai/dsh-client-ui-settings (lib/client.js); region lib/types/client/developer-tools.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Shared preference; Host-backed features stay disabled until an accepted value arrives. */
var DeveloperToolsPreference = class {
	scope;
	/** Accepted enablement, observable through renderer-bound hooks. */
	enabled;
	/**
	* @param scope - settings-owned namespace controller.
	*/
	constructor(scope) {
		this.scope = scope;
		this.enabled = {
			getSnapshot: () => scope.getSnapshot().value?.enabled ?? false,
			subscribe: (listener) => {
				let previous = this.enabled.getSnapshot();
				return scope.subscribe(() => {
					const next = this.enabled.getSnapshot();
					if (next === previous) return;
					previous = next;
					listener();
				});
			}
		};
	}
	/**
	* Persist the choice on the Host with ordered writes.
	* @param enabled - requested developer-tool mode.
	* @returns settlement after Host acceptance; rejects after a refused write recovers.
	*/
	async setEnabled(enabled) {
		if (!await this.scope.set("enabled", enabled)) throw new Error("Developer tools preference was not saved");
	}
};
