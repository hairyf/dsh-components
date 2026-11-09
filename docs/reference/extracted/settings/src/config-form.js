// Extracted from @deepseek-ai/dsh-client-ui-settings (lib/client.js); region lib/types/client/config-form.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Shared entry values and ordered writes over the Host configuration mirror. */
		/**
		* One namespace's derived view over the shared describe mirror, plus that
		* namespace's serialized Host writes. Writes carry the latest known namespace
		* revision, fold their answers back into the mirror, and teardown waits for
		* the operation already crossing the wire.
		*/
		var ConfigFormController = class {
			ctx;
			spec;
			mirror;
			schema;
			store;
			tail = Promise.resolve();
			writeGeneration = 0;
			disposed = false;
			unsubscribe;
			/**
			* Revision answered by a superseded write still ahead of the mirror: the
			* mirror only folds the LATEST settlement in, so a queued successor takes
			* its fence from here first.
			*/
			pendingRevision;
			/**
			* @param ctx - the providing plugin's context, whose `remote.settings`
			* namespace carries this form's writes (reads ride the mirror).
			* @param spec - namespace identity and optional narrowing decoder.
			* @param mirror - the shared describe mirror this form derives from.
			* @param schema - settings-owned schema operations.
			*/
			constructor(ctx, spec, mirror, schema) {
				this.ctx = ctx;
				this.spec = spec;
				this.mirror = mirror;
				this.schema = schema;
				this.store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
					status: "loading",
					value: void 0,
					base: void 0,
					user: void 0,
					revision: void 0,
					writable: false
				});
				this.unsubscribe = mirror.subscribe(() => {
					this.derive();
				});
				this.derive();
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
			* Queue one field write; see {@link ConfigForm.set} for the ordering,
			* revision, and recovery contract.
			* @param field - scalar field inside the namespace section.
			* @param value - JSON-shaped value selected by the user.
			* @returns whether the Host accepted the write, after any recovery read.
			*/
			set(field, value) {
				return this.mutate([{
					op: "set",
					path: [field],
					value
				}]);
			}
			/**
			* Queue one field clear; see {@link ConfigForm.unset} for the ordering,
			* revision, and recovery contract.
			* @param field - scalar field inside the namespace section.
			* @returns whether the Host accepted the clear, after any recovery read.
			*/
			unset(field) {
				return this.mutate([{
					op: "unset",
					path: [field]
				}]);
			}
			/**
			* Queue one atomic namespace mutation; see {@link ConfigForm.mutate}.
			* @param ops - ordered field operations copied when queued.
			* @param expectedRevision - optional fixed revision read by the domain editor.
			* @returns whether the Host accepted the mutation, after any recovery read.
			*/
			mutate(ops, expectedRevision) {
				const ownedOps = structuredClone(ops);
				const generation = ++this.writeGeneration;
				return this.enqueue(async () => {
					const revision = expectedRevision ?? this.pendingRevision ?? this.getSnapshot().revision;
					const response = await this.ctx.remote.settings.mutate(this.spec.namespace, ownedOps, revision);
					if (!response.ok) {
						await this.recover(generation);
						return false;
					}
					if (this.disposed) return true;
					if (generation === this.writeGeneration) {
						this.pendingRevision = void 0;
						this.mirror.acceptView(response.value);
					} else this.pendingRevision = response.value.revision;
					return true;
				});
			}
			/** Reload Host state for the latest failed write; superseded failures leave recovery to it. */
			async recover(generation) {
				if (this.disposed || generation !== this.writeGeneration) return;
				this.pendingRevision = void 0;
				await this.mirror.load();
			}
			/**
			* Stop queued operations, stop deriving, and wait for the current wire call
			* to settle.
			* @returns settlement after the controller reaches quiescence.
			*/
			async dispose() {
				this.disposed = true;
				this.writeGeneration += 1;
				this.unsubscribe();
				await this.tail;
			}
			enqueue(operation) {
				if (this.disposed) return Promise.resolve(false);
				const task = this.tail.then(async () => {
					if (this.disposed) return false;
					return await operation();
				});
				this.tail = task.then(() => {}, () => {});
				return task;
			}
			derive() {
				if (this.disposed) return;
				const mirrored = this.mirror.getSnapshot();
				if (mirrored.view === void 0) return;
				const { writable } = mirrored.view;
				const view = mirrored.view.namespaces.find((candidate) => candidate.ns === this.spec.namespace);
				if (view === void 0) {
					this.store.update((draft) => {
						draft.status = "unavailable";
						draft.writable = writable;
					});
					return;
				}
				const decoded = this.decode(view);
				this.store.update((draft) => {
					draft.revision = view.revision;
					draft.base = view.base;
					draft.user = view.user;
					draft.writable = writable;
					if (decoded === void 0) return;
					draft.status = "ready";
					draft.value = decoded;
				});
			}
			decode(view) {
				if (this.spec.decode !== void 0) return this.spec.decode(view.value);
				if (typeof view.value !== "object" || view.value === null || Array.isArray(view.value)) return void 0;
				let failure;
				try {
					failure = this.schema.validate(this.schema.rehydrate(view.schema), view.value);
				} catch (_malformedSchemaEnvelope) {
					return;
				}
				return failure === void 0 ? view.value : void 0;
			}
		};
		/**
		* The settings domain's base service. Features that own a preference reach the
		* settings transport through this service rather than a shared function: the
		* client bundle purity gate forbids cross-plugin value imports and directs
		* cross-plugin collaboration through cordis services
		* (`packages/client/tsdown.client.ts`).
		*/
		var ConfigForms = class extends _deepseek_ai_cordis.Service {
			forms = /* @__PURE__ */ new Map();
			/** Shared developer-tool preference owned by this settings provider. */
			developerTools;
			mirror;
			schema;
			/**
			* The PROVIDING fiber, kept because a Service reads `ctx` as its *consumer's*
			* fiber: letting a shared form write through the caller's context would make
			* every caller declare `remote.settings` in its own `inject`.
			*/
			owner;
			/**
			* @param ctx - the providing plugin's context.
			* @param config - the shared describe mirror every shared form derives from
			* and the settings-owned schema operations.
			*/
			constructor(ctx, config) {
				super(ctx, "configForms");
				this.mirror = config.mirror;
				this.schema = config.schema;
				this.owner = ctx;
				this.developerTools = new DeveloperToolsPreference(this.get(DEVELOPER_TOOLS_NAMESPACE));
				ctx.effect(() => async () => {
					await Promise.all([...this.forms.values()].map((form) => form.dispose()));
					this.forms.clear();
				}, "ui-settings: configuration forms");
			}
			/**
			* The shared mirror's read/fold face for cross-namespace surfaces (schema
			* introspection, the served-namespace directory). Per-namespace consumers
			* use {@link get}; both derive from the same snapshot, so they can never
			* disagree about the document.
			* @returns the describe face over the shared mirror.
			*/
			describe() {
				return this.mirror;
			}
			/** Get the shared form values and write queue for one Host plugin entry.
			* @param entryId Unique Host plugin entry id.
			* @returns The entry's form, owned by this provider.
			*/
			get(entryId) {
				const existing = this.forms.get(entryId);
				if (existing !== void 0) return existing;
				const form = new ConfigFormController(this.owner, { namespace: entryId }, this.mirror, this.schema);
				this.forms.set(entryId, form);
				this.mirror.ensure();
				return form;
			}
			/**
			* Keep a registration alive while the Host serves any of some namespaces:
			* `register` runs once one of them is in the describe mirror, and its
			* disposer runs when none is or when the returned disposer runs. A plugin
			* whose page edits a namespace another plugin owns registers the page
			* through this, so a deployment that never composed the owner shows no
			* trace of the page. The caller owns the returned disposer and wraps it in
			* `ctx.effect`; unlike {@link bind}, nothing is registered on the caller's
			* context here.
			* @param namespaces - the settings namespaces the registration follows.
			* @param register - registers the contribution, given every namespace the Host serves; returns its disposer.
			* @returns the disposer ending the watch and any live registration.
			*/
			whileServed(namespaces, register) {
				let off;
				const sync = () => {
					const served = new Set(this.mirror.getSnapshot().view?.namespaces.map((view) => view.ns) ?? []);
					const watched = namespaces.some((namespace) => served.has(namespace));
					if (watched && off === void 0) off = register(served);
					else if (!watched && off !== void 0) {
						off();
						off = void 0;
					}
				};
				const unsubscribe = this.mirror.subscribe(sync);
				this.mirror.ensure();
				sync();
				return () => {
					unsubscribe();
					off?.();
					off = void 0;
				};
			}
		};
