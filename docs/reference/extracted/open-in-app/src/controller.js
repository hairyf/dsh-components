// Extracted from @deepseek-ai/dsh-client-ui-open-in-app (lib/client.js); region lib/types/client/controller.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Browser availability/choice state and the launch carrier for the split button. */
		/**
		* Owns the once-per-page availability read, the persisted last choice, and
		* the launch POST. Availability and choice publish through uSES-safe sources
		* so every Session header shares one truth.
		*/
		var OpenInAppController = class {
			fetcher;
			/** Installed app ids in host menu order; null until the host answered. */
			apps = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(null);
			/** Last chosen app id, or empty before the first choice, shared across sessions and browser restarts. */
			choice = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)("", { persist: { name: "dsh.open-in-app.choice" } });
			/** Current launch, shared by pointer and keyboard gestures. */
			operation = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
				phase: "idle",
				path: null
			});
			/**
			* Resolve the remembered nameable installed application, with the button's first-app fallback.
			* @returns the installed app id, or undefined while unavailable.
			*/
			currentApp() {
				const apps = (this.apps.getSnapshot() ?? []).filter((id) => APP_LABEL_KEY[id] !== void 0);
				const choice = this.choice.getSnapshot();
				return apps.includes(choice) ? choice : apps[0];
			}
			loading;
			/**
			* @param fetcher - HTTP carrier for the apps read and the launch POST.
			*/
			constructor(fetcher = (input, init) => fetch(input, init)) {
				this.fetcher = fetcher;
			}
			/**
			* Read availability once per controller life; concurrent calls share the read.
			* A failed read publishes an empty list, which renders no button at all.
			* @returns after availability is published.
			*/
			load() {
				this.loading ??= this.run();
				return this.loading;
			}
			/**
			* Remember one picked app id.
			* @param appId - catalog id from the availability list.
			*/
			choose(appId) {
				if (this.operation.getSnapshot().phase !== "busy") this.choice.set(appId);
			}
			/**
			* Launch one installed app on a workspace directory.
			* @param appId - catalog id from the availability list.
			* @param path - the session's absolute workspace directory.
			* Concurrent gestures are ignored until the current Host request settles.
			* @returns the acknowledged handoff, or `{ kind: 'skipped' }` while another
			* launch holds the operation, or a named failure when the Host refuses or
			* cannot be reached. Host and transport failures resolve without rejecting.
			*/
			async launch(appId, path) {
				if (this.operation.getSnapshot().phase === "busy") return { kind: "skipped" };
				this.operation.set({
					phase: "busy",
					path
				});
				const body = {
					app: appId,
					path
				};
				try {
					const response = await this.fetcher(OPEN_IN_APP_OPEN_ROUTE, {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify(body)
					});
					if (!response.ok) throw new Error(`open failed: HTTP ${String(response.status)}`);
					this.operation.set({
						phase: "idle",
						path
					});
					return { kind: "opened" };
				} catch (_error) {
					this.operation.set({
						phase: "error",
						path
					});
					return {
						kind: "failed",
						failure: "openError"
					};
				}
			}
			async run() {
				let apps = [];
				try {
					const response = await this.fetcher(OPEN_IN_APP_APPS_ROUTE, { headers: { accept: "application/json" } });
					if (response.ok) {
						const payload = await response.json();
						if (Array.isArray(payload.apps)) apps = payload.apps.filter((id) => typeof id === "string");
					}
				} catch {}
				this.apps.set(apps);
			}
		};
