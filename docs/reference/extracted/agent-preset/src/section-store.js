// Extracted from @deepseek-ai/dsh-client-ui-agent-preset (lib/client.js); region lib/types/client/section-store.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		const INITIAL = {
			status: "idle",
			error: null,
			saving: false,
			rows: [],
			view: null
		};
		const message = (error) => error instanceof Error ? error.message : String(error);
		/** Loads the roster, writes the default, and reads one composition at a time. */
		var AgentPresetSectionController = class {
			ctx;
			/** Observable roster, selection and viewer state. */
			store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(INITIAL);
			loading;
			pendingSave;
			viewRequest = 0;
			constructor(ctx) {
				this.ctx = ctx;
			}
			set(patch) {
				this.store.set({
					...this.store.getSnapshot(),
					...patch
				});
			}
			/** Refresh the roster; concurrent calls share one read.
			* @returns Once the roster read settles.
			*/
			load() {
				return this.loading ??= this.readRoster().finally(() => {
					this.loading = void 0;
				});
			}
			async readRoster() {
				try {
					const result = await this.ctx.remote.agentPresets.list();
					if (!result.ok) throw new Error(result.error.message);
					this.set({
						status: "ready",
						error: null,
						rows: result.value.presets
					});
				} catch (error) {
					this.set({
						status: "error",
						error: message(error)
					});
				}
			}
			/** Open one preset's declared composition in the viewer.
			* @param id Preset to read.
			* @returns Once the read settles; a current failure lands in `error`, while a read superseded by close or another read is ignored.
			*/
			async view(id) {
				const request = ++this.viewRequest;
				this.set({
					error: null,
					view: null
				});
				try {
					const result = await this.ctx.remote.agentPresets.read(id);
					if (request !== this.viewRequest) return;
					if (!result.ok) throw new Error(result.error.message);
					const { name, content } = result.value;
					this.set({ view: {
						id,
						title: name ?? id,
						content
					} });
				} catch (error) {
					if (request === this.viewRequest) this.set({ error: message(error) });
				}
			}
			/** Close the viewer. */
			closeView() {
				this.viewRequest++;
				this.set({ view: null });
			}
			/** Set the default and synchronize the current blank task when supplied.
			* @param id Selected default.
			* @param sync Blank-session synchronization callback.
			* @returns Once saved and refreshed.
			*/
			async makeDefault(id, sync) {
				await this.save(() => writeDefaultPreset(this.ctx, id), sync);
			}
			/** Replace a hidden built-in default after accepted Coding Tools changes.
			* @param shouldReset Rechecked after waiting; false when tools are enabled or this owner is disposed.
			* @returns Once the conditional save settles; errors remain visible in the section.
			*/
			async reconcileCodingTools(shouldReset) {
				while (this.pendingSave !== void 0) await this.pendingSave;
				if (!shouldReset()) return;
				const settings = this.ctx.configForms.get(AGENT_PRESET_SETTINGS_NS).getSnapshot();
				if (settings.status !== "ready" || !settings.writable || settings.revision === void 0) return;
				await this.load();
				if (!shouldReset() || this.store.getSnapshot().status !== "ready") return;
				const rows = this.store.getSnapshot().rows;
				if (!requiresCodingTools(rows.find((row) => row.isDefault))) return;
				if (!rows.some((row) => row.id === "standard" && row.broken === void 0)) {
					this.set({ error: this.ctx.locale.bind("settings.agentPreset")("standardUnavailable") });
					return;
				}
				await this.save(() => writeDefaultPreset(this.ctx, "standard", settings.revision));
			}
			async save(write, sync) {
				if (this.store.getSnapshot().saving) return;
				const completion = Promise.withResolvers();
				this.pendingSave = completion.promise;
				this.set({
					saving: true,
					error: null
				});
				try {
					const error = await write();
					await this.load();
					if (error !== void 0) throw new Error(error);
					const selected = this.store.getSnapshot().rows.find((row) => row.isDefault);
					if (selected !== void 0) {
						const error = await sync?.(selected.id);
						if (error !== void 0) throw new Error(error);
					}
				} catch (error) {
					this.set({ error: message(error) });
				} finally {
					this.pendingSave = void 0;
					this.set({ saving: false });
					completion.resolve();
				}
			}
		};
