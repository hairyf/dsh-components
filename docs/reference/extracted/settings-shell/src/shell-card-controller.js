// Extracted from @deepseek-ai/dsh-client-ui-settings-shell (lib/client.js); region lib/types/client/shell-card-controller.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** The shell page's staged form over the composed shell executor entry. */
/** Profile entry id of the POSIX shell executor; the base bundle composes it off Windows. */
const BASH_NS = "bash-sandbox";
/** Profile entry id of the PowerShell executor; the base bundle composes it on Windows. */
const PWSH_NS = "pwsh-sandbox";
/** Bridges one shell executor entry's form onto the page's staged form. */
var ShellCardController = class {
	form;
	store;
	/** @param scope - the shared configuration form of the composed shell executor entry. */
	constructor(scope) {
		this.form = new _deepseek_ai_dsh_client_ui_primitives.SettingsFormModel(scope, [(0, _deepseek_ai_dsh_client_ui_primitives.settingsNumberField)("timeoutMs"), (0, _deepseek_ai_dsh_client_ui_primitives.settingsNumberField)("maxOutputBytes")]);
		this.store = this.form.bind(() => this.projection());
	}
	projection() {
		return {
			...this.form.shell(),
			timeoutMs: this.form.field("timeoutMs"),
			maxOutputBytes: this.form.field("maxOutputBytes")
		};
	}
	/**
	* Build the face the page's slot registration injects.
	* @returns the page's snapshot and its form actions.
	*/
	inject() {
		return {
			hooks: { shellCard: this.store },
			...this.form.actions()
		};
	}
	/** Release the form subscription. */
	dispose() {
		this.form.dispose();
	}
};
