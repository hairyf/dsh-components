// Extracted from @deepseek-ai/dsh-client-ui-open-in-app (lib/client.js); region lib/types/client/open-path.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Host desktop availability, file associations, and open/reveal actions over the Session Remote.
* The desktop answer is read once per page; a failed read renders no control.
*/
/** Page-lifetime desktop availability and the open/reveal carrier shared by every path control. */
var OpenInAppPathController = class {
	remote;
	/** Whether the Host desktop can open paths; null until the Host answered, false also after a failed read. */
	desktop = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(null);
	loading;
	/**
	* @param remote - the Session Remote namespace answering availability and running gestures.
	*/
	constructor(remote) {
		this.remote = remote;
	}
	/**
	* Read desktop availability once per controller life; concurrent calls share the read.
	* @returns after availability is published.
	*/
	load() {
		this.loading ??= this.run();
		return this.loading;
	}
	/**
	* Open one Host path in its default application, or reveal it in the file manager.
	* @param path - absolute path on the Host, as the file's metadata reports it.
	* @param action - default application open, or file-manager reveal.
	* @param application - registered application path for an explicit open.
	* @returns the acknowledged open or reveal, or the named failure to announce.
	*/
	async openPath(path, action, application) {
		const request = action === "reveal" ? {
			path,
			action
		} : {
			path,
			...application === void 0 ? {} : { application }
		};
		let ok = false;
		try {
			ok = (await this.remote.session.openWorkspacePath(request)).ok;
		} catch {}
		if (ok) return { kind: action === "reveal" ? "revealed" : "opened" };
		return {
			kind: "failed",
			failure: action === "open" ? "openError" : "revealError"
		};
	}
	/**
	* Refresh the file's OS associations; failures remain distinct from an empty handler list.
	* @param path - file path reported by the Host.
	* @param signal - lifetime of the requesting preview.
	* @returns application metadata, or null when the query fails.
	*/
	async applications(path, signal) {
		let result;
		try {
			result = await this.remote.session.workspacePathApplications({ path }, signal);
		} catch (_error) {
			return null;
		}
		return result.ok ? result.value : null;
	}
	async run() {
		let available = false;
		try {
			const result = await this.remote.session.canOpenWorkspacePath();
			available = result.ok && result.value;
		} catch {}
		this.desktop.set(available);
	}
};
