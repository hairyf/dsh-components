// Extracted from @deepseek-ai/dsh-client-ui-settings (lib/client.js); region lib/types/client/settings-mirror.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Client mirror of the Host settings document: the one `settings.describe`
		* reader in the browser. Every settings consumer derives from this store —
		* shared entry forms through `ConfigForms.get`, cross-namespace
		* surfaces through the provider's shared describe face — so startup cost and
		* freshness are properties of this class, not of how many features own a
		* preference. The Host stays the fact source: the mirror re-reads on the
		* invalidations its owning plugin subscribes to and folds write answers in
		* through {@link SettingsDescribeMirror.acceptView}.
		*/
		/**
		* Serializes every Host `settings.describe` read behind one snapshot store.
		* Concurrent {@link load} calls fold into the in-flight read plus one rerun,
		* so an invalidation arriving mid-read is never lost and never duplicated.
		*/
		var SettingsDescribeMirror = class {
			ctx;
			store;
			inFlight;
			rerun = false;
			generation = 0;
			/**
			* @param ctx - the providing plugin's context, whose `remote.settings`
			* namespace answers the describe read.
			*/
			constructor(ctx) {
				this.ctx = ctx;
				this.store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
					status: "idle",
					view: void 0,
					error: null
				});
			}
			/** @returns the current sync snapshot (stable reference until the next change). */
			getSnapshot() {
				return this.store.getSnapshot();
			}
			/**
			* Observe snapshot replacements.
			* @param listener - invoked after each snapshot change.
			* @returns the disposer removing this listener.
			*/
			subscribe(listener) {
				return this.store.subscribe(listener);
			}
			/**
			* Refresh from the Host. A call during an in-flight read marks one rerun
			* after it settles instead of racing a second wire read.
			* @returns settlement after this call's freshness is reflected.
			*/
			load() {
				if (this.inFlight !== void 0) {
					this.rerun = true;
					return this.inFlight;
				}
				const run = Promise.resolve().then(() => this.run());
				this.inFlight = run;
				return run;
			}
			/**
			* Resolve once an answer is held, reading only from `idle`.
			* @returns settlement of the current or newly started read, if any.
			*/
			ensure() {
				if (this.inFlight !== void 0) return this.inFlight;
				if (this.getSnapshot().status === "idle") return this.load();
				return Promise.resolve();
			}
			/**
			* Fold one write answer's namespace view into the held view without a wire
			* read, and invalidate any read still in flight. With no held document, the
			* answer is not published as a partial document; an in-flight read reruns so
			* it cannot publish a document fetched before the write committed.
			* @param view - the namespace view a settings write answered with.
			*/
			acceptView(view) {
				const before = this.store.getSnapshot();
				this.generation += 1;
				if (this.inFlight !== void 0) this.rerun = true;
				if (before.view === void 0) return;
				const namespaces = before.view.namespaces.some((row) => row.ns === view.ns) ? before.view.namespaces.map((row) => row.ns === view.ns ? view : row) : [...before.view.namespaces, view];
				this.store.set({
					...before,
					view: {
						...before.view,
						namespaces
					}
				});
			}
			/**
			* Convenience row lookup on the held view.
			* @param ns - namespace identity.
			* @returns the namespace view, or undefined while unanswered or unregistered.
			*/
			namespace(ns) {
				return this.store.getSnapshot().view?.namespaces.find((row) => row.ns === ns);
			}
			async run() {
				try {
					do {
						const before = this.store.getSnapshot();
						if (before.status === "idle") this.store.set({
							...before,
							status: "loading"
						});
						this.rerun = false;
						const generation = ++this.generation;
						let outcome;
						try {
							const response = await this.ctx.remote.settings.describe();
							outcome = response.ok ? { view: response.value } : { failure: response.error.message };
						} catch (error) {
							outcome = { failure: error instanceof Error ? error.message : String(error) };
						}
						if (generation !== this.generation) continue;
						if ("view" in outcome) this.store.set({
							status: "ready",
							view: outcome.view,
							error: null
						});
						else {
							const held = this.store.getSnapshot();
							this.store.set({
								status: held.view === void 0 ? "idle" : "ready",
								view: held.view,
								error: outcome.failure
							});
						}
					} while (this.shouldRerun());
				} finally {
					this.inFlight = void 0;
				}
			}
			shouldRerun() {
				return this.rerun;
			}
		};
