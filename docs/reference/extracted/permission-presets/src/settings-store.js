// Extracted from @deepseek-ai/dsh-client-ui-permission-presets (lib/client.js); region lib/types/client/settings-store.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Permission default-settings controller. The permission descriptor comes
		* from the shared describe mirror and choices from the permission catalog; writes target
		* only `defaultPreset`, carry the descriptor revision, and fold their answer
		* back into the mirror.
		*/
		/** Permission's settings namespace on the host wire. */
		const PERMISSION_SETTINGS_NS = "permission";
		/** Resolve the new-session choices from the permission domain's catalog.
		* @param view Live configuration descriptor.
		* @param catalog Configured permission options and effective default.
		* @returns Current choice and labels for its allowed options.
		*/
		function permissionDefaultOf(view, catalog) {
			const currentValue = view.value.defaultPreset ?? catalog.defaultPreset;
			const options = catalog.defaultOptions.map((option) => ({
				id: option.value,
				label: displayPermissionPreset(option.value, option.name)
			}));
			if (!options.some((option) => option.id === currentValue)) throw new Error("permission catalog does not advertise its current default");
			return {
				currentValue,
				options
			};
		}
		/** Controller deriving the row from the shared mirror and writing the default through it. */
		var PermissionPresetSettingsController = class {
			describeFace;
			ctx;
			catalog;
			/** Row snapshot consumed through a bound selector hook. */
			store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
				status: "idle",
				error: null,
				writable: false,
				currentValue: "",
				options: [],
				revision: 0
			});
			following;
			followingCatalog;
			saving = false;
			disposed = false;
			/**
			* @param describeFace - the shared mirror's read/fold face (descriptor and schema source).
			* @param ctx - the row plugin's context, whose `remote.settings` namespace
			* carries the `defaultPreset` write.
			* @param catalog - configured permission choices and their effective default.
			*/
			constructor(describeFace, ctx, catalog) {
				this.describeFace = describeFace;
				this.ctx = ctx;
				this.catalog = catalog;
			}
			/**
			* Begin following the mirror (idempotent) and reflect its current answer.
			* @returns settlement once the snapshot reflects the mirror.
			*/
			async load() {
				if (this.disposed) return;
				this.following ??= this.describeFace.subscribe(() => {
					this.derive();
				});
				this.followingCatalog ??= this.catalog.store.subscribe(() => {
					this.derive();
				});
				this.store.update((state) => {
					state.status = "loading";
					state.error = null;
				});
				await this.describeFace.ensure();
				try {
					await this.catalog.load();
				} catch (error) {
					this.fail(error);
					return;
				}
				this.derive();
			}
			/**
			* Persist one preset as the default for subsequently created sessions.
			* A selection made while one is already saving is ignored — the row's
			* control is disabled during the save, so this only drops programmatic
			* double-submits rather than user intent.
			* @param preset - advertised preset key.
			* @returns nothing; {@link store} carries success or failure.
			*/
			async select(preset) {
				const state = this.store.getSnapshot();
				const view = this.describeFace.getSnapshot().view?.namespaces.find((entry) => entry.ns === PERMISSION_SETTINGS_NS);
				if (view === void 0 || !state.writable || this.saving) return;
				this.saving = true;
				this.store.update((draft) => {
					draft.status = "saving";
					draft.error = null;
				});
				let response;
				try {
					response = await this.ctx.remote.settings.mutate(PERMISSION_SETTINGS_NS, [{
						op: "set",
						path: ["defaultPreset"],
						value: preset
					}], view.revision);
				} finally {
					this.saving = false;
				}
				if (this.disposed) return;
				if (!response.ok) {
					this.fail(response.error);
					return;
				}
				this.describeFace.acceptView(response.value);
			}
			/** Stop following the mirror; later publishes leave the snapshot alone. */
			dispose() {
				this.disposed = true;
				this.following?.();
				this.following = void 0;
				this.followingCatalog?.();
				this.followingCatalog = void 0;
			}
			derive() {
				if (this.disposed || this.saving) return;
				const mirrored = this.describeFace.getSnapshot();
				if (mirrored.view === void 0) {
					if (mirrored.error !== null) this.fail(new Error(mirrored.error));
					return;
				}
				const view = mirrored.view.namespaces.find((entry) => entry.ns === PERMISSION_SETTINGS_NS);
				if (view === void 0) {
					this.store.update((state) => {
						state.status = "unavailable";
						state.writable = false;
						state.currentValue = "";
						state.options = [];
					});
					return;
				}
				try {
					const catalog = this.catalog.store.getSnapshot().value;
					if (catalog === null) return;
					const resolved = permissionDefaultOf(view, catalog);
					const { writable } = mirrored.view;
					this.store.update((state) => {
						state.status = "ready";
						state.error = null;
						state.writable = writable;
						state.currentValue = resolved.currentValue;
						state.options = resolved.options;
						state.revision = view.revision;
					});
				} catch (error) {
					this.fail(error);
				}
			}
			fail(error) {
				this.store.update((state) => {
					state.status = "error";
					state.error = error instanceof Error ? error.message : String(error);
				});
			}
		};
