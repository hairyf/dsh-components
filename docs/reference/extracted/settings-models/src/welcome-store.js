// Extracted from @deepseek-ai/dsh-client-ui-settings-models (lib/client.js); region lib/types/client/welcome-store.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Welcome-notice state derived from the welcome settings scope: the notice
* follows the Host section and records its acknowledgement through it.
*/
/* v8 ignore next 3 -- closed-union default only defends future source widening */
function assertNever(_value) {
	throw new Error("unexpected welcome settings status");
}
/** Coordinates the durable Host acknowledgement. */
var WelcomeNoticeStore = class {
	scope;
	/** uSES-safe state source shared by the registered welcome step. */
	store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
		status: "idle",
		acknowledged: false,
		error: null
	});
	saving = false;
	following;
	constructor(scope) {
		this.scope = scope;
	}
	/**
	* Begin following the bound scope (idempotent) and publish its current answer.
	* @returns settlement after the current answer is published.
	*/
	load() {
		this.following ??= this.scope.subscribe(() => {
			this.derive();
		});
		this.derive();
		return Promise.resolve();
	}
	/**
	* Persist this copy version through the scope. Success is judged against the
	* state the write left behind, so a refused or failed write reports false
	* after its recovery read settles.
	* @returns true when the Host holds the acknowledgement.
	*/
	async acknowledge() {
		this.saving = true;
		this.store.update((state) => {
			state.status = "saving";
			state.error = null;
		});
		try {
			await this.scope.set(WELCOME_NOTICE_ACK_FIELD, WELCOME_NOTICE_VERSION);
		} finally {
			this.saving = false;
		}
		this.derive();
		const { acknowledged } = this.store.getSnapshot();
		if (!acknowledged) this.store.update((state) => {
			state.status = "error";
			state.error = "the acknowledgement did not persist";
		});
		return acknowledged;
	}
	/** Stop following the scope. */
	dispose() {
		this.following?.();
		this.following = void 0;
	}
	derive() {
		if (this.saving) return;
		const scope = this.scope.getSnapshot();
		switch (scope.status) {
			case "loading":
				this.store.update((state) => {
					state.status = "loading";
					state.error = null;
				});
				return;
			case "unavailable":
				this.store.update((state) => {
					state.status = "error";
					state.acknowledged = false;
					state.error = "welcome acknowledgement settings are unavailable";
				});
				return;
			case "ready": {
				const acknowledged = scope.value?.[WELCOME_NOTICE_ACK_FIELD] === WELCOME_NOTICE_VERSION;
				this.store.update((state) => {
					state.status = "ready";
					state.acknowledged = acknowledged;
					state.error = null;
				});
				return;
			}
			/* v8 ignore next -- every current settings scope status is handled above */
			default: return assertNever(scope.status);
		}
	}
};
