// Extracted from @deepseek-ai/dsh-client-ui-settings-session-log (lib/client.js); region lib/types/client/upload-preference.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Ordered preference writes and notices that survive the settings panel. */
/** Writes the Host setting without publishing an optimistic upload state. */
var UploadPreference = class {
	form;
	/** Observable mutation outcome. */
	state = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
		busy: false,
		notice: null,
		sequence: 0
	});
	/** @param form - Host-owned configuration form. */
	constructor(form) {
		this.form = form;
	}
	/**
	* Persist enablement; refusal or transport failure leaves the accepted value visible.
	* @param enabled - requested upload state.
	* @returns completion after the write settles.
	*/
	async setEnabled(enabled) {
		if (this.state.getSnapshot().busy) return;
		this.state.update((state) => {
			state.busy = true;
			state.notice = null;
		});
		let accepted = false;
		try {
			accepted = await this.form.set("enabled", enabled);
		} catch (_error) {}
		this.state.update((state) => {
			state.busy = false;
			state.notice = accepted ? "saved" : "failed";
			state.sequence++;
		});
	}
	/** Clear the displayed mutation notice. */
	dismiss() {
		this.state.update((state) => {
			state.notice = null;
		});
	}
};
