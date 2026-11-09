// Extracted from @deepseek-ai/dsh-client-ui-sidebar-browser (lib/client.js); region lib/types/client/electron/ElectronWebViewImpl.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Electron navigation and guest lifetime, independent from DOM placement. */
/** Owns native history and translates Electron observations into common frame state. */
var ElectronWebViewImpl = class {
	options;
	bridge;
	workspace;
	presentation;
	store;
	lifetime = new AbortController();
	guestLifetime;
	element;
	lease;
	workspaceKey;
	initializing;
	ready = false;
	pending;
	revision = 0;
	firstDocument = true;
	checkpoint;
	disposal;
	attachment;
	releases = /* @__PURE__ */ new Set();
	/**
	* @param options - saved address, persistence and source-tab opening callback.
	* @param bridge - main-process guest operations.
	* @param workspace - resolves the storage account once for this frame lifetime.
	* @param presentation - tag and Sidebar placement adapter.
	*/
	constructor(options, bridge, workspace, presentation) {
		this.options = options;
		this.bridge = bridge;
		this.workspace = workspace;
		this.presentation = presentation;
		this.checkpoint = currentBrowserTarget(options.initial);
		this.store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(emptyBrowserFrame());
	}
	/** @returns immutable carrier-neutral navigation state. */
	getSnapshot = () => this.store.getSnapshot();
	/** @param listener - state invalidation. @returns unsubscribe callback. */
	subscribe = (listener) => this.store.subscribe(listener);
	/** A physical mount may recreate a lost guest; ordinary Sidebar hiding never calls this. */
	attach() {
		if (this.lifetime.signal.aborted) return;
		this.attachment = new AbortController();
		this.pending ??= this.store.getSnapshot().target;
		if (this.pending !== void 0) {
			this.store.set({
				...this.store.getSnapshot(),
				address: "requested",
				loading: true,
				canGoBack: false,
				canGoForward: false,
				error: void 0
			});
			this.initialize();
		}
	}
	/** Invalidate pending attachment before the containing DOM is removed. */
	detach() {
		this.attachment?.abort();
		this.attachment = void 0;
		this.pending = this.store.getSnapshot().target;
		this.dropGuest();
	}
	/** @param target - validated address, loaded without replacing the guest. */
	loadUrl(target) {
		if (this.lifetime.signal.aborted) return;
		const current = this.store.getSnapshot();
		if (this.ready && current.address === "observed" && current.target?.url === target.url) {
			this.reload();
			return;
		}
		this.revision++;
		this.pending = target;
		this.store.set({
			...current,
			target,
			address: "requested",
			loading: true,
			error: void 0
		});
		this.persist(target);
		if (this.ready) this.loadPending();
		else this.initialize();
	}
	/** Move backward through Chromium history. */
	goBack() {
		if (this.store.getSnapshot().canGoBack) this.navigate("goBack");
	}
	/** Move forward through Chromium history. */
	goForward() {
		if (this.store.getSnapshot().canGoForward) this.navigate("goForward");
	}
	/** Reload the actual current page, or retry failed guest creation. */
	reload() {
		const current = this.store.getSnapshot();
		if (this.lifetime.signal.aborted || current.target === void 0) return;
		if (!this.ready || current.error !== void 0) {
			this.revision++;
			this.pending = current.target;
			this.store.set({
				...current,
				loading: true,
				error: void 0
			});
			if (this.ready) this.loadPending();
			else this.initialize();
		} else this.navigate("reload");
	}
	/** @returns after pending initialization and the owned guest have been released. */
	dispose() {
		if (this.disposal !== void 0) return this.disposal;
		this.lifetime.abort();
		this.pending = void 0;
		this.disposal = Promise.all([this.dropGuest(), this.initializing]).then(() => Promise.all(this.releases)).then(() => {});
		this.presentation.dispose();
		return this.disposal;
	}
	navigate(command) {
		if (this.lifetime.signal.aborted || !this.ready || this.element === void 0) return;
		this.revision++;
		this.pending = void 0;
		this.store.set({
			...this.store.getSnapshot(),
			loading: true,
			error: void 0
		});
		try {
			this.element[command]();
		} catch (error) {
			this.commandFailed(error);
		}
	}
	initialize() {
		const attachment = this.attachment;
		if (attachment === void 0 || this.initializing !== void 0 || this.element !== void 0 || this.lifetime.signal.aborted) return;
		const signal = AbortSignal.any([this.lifetime.signal, attachment.signal]);
		this.initializing = this.createGuest(signal).catch(async (error) => {
			await this.dropGuest();
			if (!signal.aborted) this.commandFailed(error);
		}).finally(() => {
			this.initializing = void 0;
			if (this.attachment !== attachment && this.pending !== void 0) this.initialize();
		});
	}
	async createGuest(attachmentSignal) {
		this.workspaceKey ??= await this.workspace(attachmentSignal);
		if (attachmentSignal.aborted) return;
		const reservation = await this.bridge.acquire(this.workspaceKey);
		if (attachmentSignal.aborted) {
			await this.release(reservation.lease);
			return;
		}
		this.lease = reservation.lease;
		this.guestLifetime = new AbortController();
		const signal = AbortSignal.any([attachmentSignal, this.guestLifetime.signal]);
		const element = this.presentation.createElement(reservation);
		this.element = element;
		const unsubscribeOpen = this.bridge.onOpenRequested(reservation.lease, (url) => {
			if (this.element === element && !signal.aborted) this.options.openRequested(url);
		});
		signal.addEventListener("abort", unsubscribeOpen, { once: true });
		element.addEventListener("dom-ready", () => {
			this.ready = true;
			this.observe(this.store.getSnapshot().address !== "requested");
			this.loadPending();
		}, { signal });
		element.addEventListener("did-navigate", () => {
			this.observe(true);
		}, { signal });
		element.addEventListener("did-navigate-in-page", (event) => {
			if (event.isMainFrame) this.observe(true);
		}, { signal });
		element.addEventListener("did-start-navigation", (event) => {
			if (event.isMainFrame) this.store.set({
				...this.store.getSnapshot(),
				loading: true,
				error: void 0
			});
		}, { signal });
		for (const name of [
			"did-start-loading",
			"did-stop-loading",
			"page-title-updated"
		]) element.addEventListener(name, () => {
			this.observe(name === "page-title-updated" && this.store.getSnapshot().address === "observed");
		}, { signal });
		element.addEventListener("did-fail-load", (event) => {
			const failure = event;
			if (failure.isMainFrame && failure.errorCode !== -3) this.failed({
				code: failure.errorCode,
				description: failure.errorDescription
			});
		}, { signal });
		for (const name of ["render-process-gone", "destroyed"]) element.addEventListener(name, () => {
			this.dropGuest();
			this.failed();
		}, { signal });
		this.presentation.present(element);
	}
	loadPending() {
		const target = this.pending;
		const element = this.element;
		if (!this.ready || target === void 0 || element === void 0) return;
		const revision = this.revision;
		this.pending = void 0;
		element.loadURL(target.url).catch((error) => {
			if (this.element !== element || this.lifetime.signal.aborted || this.revision !== revision) return;
			if (typeof error === "object" && error !== null && "code" in error && error.code === "ERR_ABORTED") return;
			if (this.store.getSnapshot().error === void 0) this.commandFailed(error);
		});
	}
	observe(committed) {
		if (!this.ready || this.element === void 0 || this.lifetime.signal.aborted) return;
		try {
			this.observeReady(this.element, committed);
		} catch (error) {
			this.commandFailed(error);
		}
	}
	observeReady(element, committed) {
		const current = this.store.getSnapshot();
		const parsed = committed ? parseBrowserAddress(element.getURL()) : void 0;
		if (parsed?.ok && this.firstDocument) {
			element.clearHistory();
			this.firstDocument = false;
		}
		let target = current.target;
		let address = current.address;
		if (parsed?.ok) {
			target = {
				...parsed.target,
				title: element.getTitle() || parsed.target.title
			};
			address = "observed";
			this.presentation.show(target.title);
		}
		const loading = current.error === void 0 && element.isLoading();
		const canGoBack = element.canGoBack();
		const canGoForward = element.canGoForward();
		if (target?.url !== current.target?.url || target?.title !== current.target?.title || address !== current.address || loading !== current.loading || canGoBack !== current.canGoBack || canGoForward !== current.canGoForward) this.store.set({
			...current,
			target,
			address,
			loading,
			canGoBack,
			canGoForward
		});
		if (parsed?.ok && target !== void 0) this.persist(target);
	}
	persist(target) {
		if (target.url === this.checkpoint?.url && target.title === this.checkpoint.title) return;
		this.checkpoint = target;
		this.options.persist(browserAddressCheckpoint(target, this.revision));
	}
	failed(error = {
		code: void 0,
		description: void 0
	}) {
		if (this.lifetime.signal.aborted) return;
		const current = this.store.getSnapshot();
		this.store.set({
			...current,
			loading: false,
			error,
			canGoBack: this.ready && current.canGoBack,
			canGoForward: this.ready && current.canGoForward
		});
	}
	commandFailed(error) {
		console.error("Desktop browser operation failed", error);
		this.failed();
	}
	dropGuest() {
		this.guestLifetime?.abort();
		this.guestLifetime = void 0;
		this.presentation.clear();
		this.element = void 0;
		this.ready = false;
		this.firstDocument = true;
		const lease = this.lease;
		this.lease = void 0;
		return lease === void 0 ? Promise.resolve() : this.release(lease);
	}
	release(lease) {
		const released = this.bridge.release(lease).catch((error) => {
			console.error("Desktop browser guest release failed", error);
		}).finally(() => {
			this.releases.delete(released);
		});
		this.releases.add(released);
		return released;
	}
};
