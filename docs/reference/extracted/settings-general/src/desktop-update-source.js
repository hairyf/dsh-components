// Extracted from @deepseek-ai/dsh-client-ui-settings-general (lib/client.js); region lib/types/client/desktop-update-source.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Client-owned observation of the optional Desktop preload. */
/** Owns one preload subscription across both sidebar locations. */
var DesktopUpdateSource = class {
	bridge;
	/** Framework-observed carrier status shared by both sidebar controls. */
	store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
		failed: false,
		opening: false
	});
	live = true;
	received = false;
	unsubscribe;
	/** @param bridge - Optional isolated Electron API, absent in ordinary browsers. */
	constructor(bridge) {
		this.bridge = bridge;
		this.unsubscribe = bridge?.subscribe((presentation) => {
			if (!this.live) return;
			this.received = true;
			this.store.set({
				...this.store.getSnapshot(),
				presentation,
				failed: false
			});
		});
		bridge?.status().then((presentation) => {
			if (this.live && !this.received) this.store.set({
				...this.store.getSnapshot(),
				presentation
			});
		}, () => {
			if (this.live && !this.received) this.store.set({
				...this.store.getSnapshot(),
				failed: true
			});
		});
	}
	/** Invoke one user action; subsequent clicks join the shell-owned operation. */
	open() {
		if (!this.live || this.bridge === void 0) return;
		const state = this.store.getSnapshot();
		if (state.opening || state.presentation !== void 0 && [
			"checking",
			"downloading",
			"verifying",
			"installing"
		].includes(state.presentation.phase)) return;
		this.store.set({
			...state,
			opening: true
		});
		this.bridge.open().catch(() => {
			if (this.live) this.store.set({
				...this.store.getSnapshot(),
				failed: true
			});
		}).finally(() => {
			if (this.live) this.store.set({
				...this.store.getSnapshot(),
				opening: false
			});
		});
	}
	/** Detach the carrier and ignore any pending status or action completion. */
	dispose() {
		this.live = false;
		this.unsubscribe?.();
	}
};
