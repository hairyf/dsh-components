// Extracted from @deepseek-ai/dsh-client-ui-settings-web-search (lib/client.js); region lib/types/client/web-search-card-controller.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The web-search page's staged form over three settings namespaces: `web`,
		* whose provider selection the Search API switch writes, `web-search-deepseek`
		* for Messages search, and `web-deepseek-api` for the Search and Fetch APIs.
		*
		* The switch selects `deepseek-search-api` and `deepseek-fetch-api` together, or
		* Messages search with local HTTP fetch. A selection equal to the deployment's
		* composed value clears the override instead of storing a copy of it.
		*
		* The key is the one control that does not live in a section: its literal
		* never rides a response, so the page learns only whether one is configured
		* and writes it through the credentials domain, addressed by the reference the
		* selected API's section names. It is still staged with the rest of the form,
		* so one save covers everything the page shows.
		*/
		/**
		* Namespaces this page edits. Spelled here rather than imported: a client
		* package must not depend on a Host package.
		*/
		const WEB_SEARCH_NS = "web-search-deepseek";
		/** Namespace of the DeepSeek Search and Fetch API providers. */
		const WEB_API_NS = "web-deepseek-api";
		/** Provider ids the switch writes into the web service's selection. */
		const PROVIDERS = {
			searchProvider: {
				api: "deepseek-search-api",
				messages: "deepseek-official"
			},
			fetchProvider: {
				api: "deepseek-fetch-api",
				messages: "http"
			}
		};
		/** Credential reference the providers resolve when a section names none. */
		const DEFAULT_API_KEY_REF = "DEEPSEEK_API_KEY";
		/** Form field the credential control stages under. */
		const API_KEY_FIELD = "apiKey";
		/** Bridges the three settings scopes and the credentials domain onto the page. */
		var WebSearchCardController = class {
			scopes;
			ctx;
			selection;
			messages;
			api;
			store;
			unsubscribe;
			credential = {
				ref: "",
				configured: false,
				writable: true
			};
			credentialReadQueued = false;
			credentialReadSequence = 0;
			disposed = false;
			/**
			* @param scopes - the bound settings scopes for the page's namespaces.
			* @param ctx - the page plugin's context, whose `remote.credentials` namespace
			* answers for the credential the selected section references.
			*/
			constructor(scopes, ctx) {
				this.scopes = scopes;
				this.ctx = ctx;
				this.selection = new _deepseek_ai_dsh_client_ui_primitives.SettingsFormModel(scopes.web, [(0, _deepseek_ai_dsh_client_ui_primitives.settingsTextField)("searchProvider"), (0, _deepseek_ai_dsh_client_ui_primitives.settingsTextField)("fetchProvider")], [{
					field: API_KEY_FIELD,
					write: (text) => this.writeKey(text)
				}]);
				this.messages = new _deepseek_ai_dsh_client_ui_primitives.SettingsFormModel(scopes.messages, [(0, _deepseek_ai_dsh_client_ui_primitives.settingsTextField)("baseURL"), (0, _deepseek_ai_dsh_client_ui_primitives.settingsNumberField)("maxUses")]);
				this.api = new _deepseek_ai_dsh_client_ui_primitives.SettingsFormModel(scopes.api, [(0, _deepseek_ai_dsh_client_ui_primitives.settingsTextField)("baseURL"), {
					...(0, _deepseek_ai_dsh_client_ui_primitives.settingsNumberField)("count"),
					parse: (text) => {
						if (text.trim() === "") return { kind: "clear" };
						const value = Number(text);
						return Number.isInteger(value) && value >= 1 && value <= 50 ? {
							kind: "set",
							value
						} : void 0;
					}
				}]);
				this.store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(this.projection());
				const publish = () => {
					const ref = this.ref();
					if (ref !== this.credential.ref) {
						this.resetCredentialReference(ref);
						this.queueCredentialRead();
					}
					this.store.set(this.projection());
				};
				this.unsubscribe = [...[
					this.selection,
					this.messages,
					this.api
				].map((form) => form.bind(() => form.shell()).subscribe(publish)), ...[
					scopes.web,
					scopes.messages,
					scopes.api
				].map((scope) => scope.subscribe(() => {
					this.queueCredentialRead();
				}))];
				this.readCredential();
			}
			/** Whether the Host serves both sections the switch needs. */
			switchAvailable() {
				return this.selection.shell().available && this.api.shell().available;
			}
			/** The staged switch position, read from the staged search selection. */
			searchApi() {
				return this.switchAvailable() && this.selection.field("searchProvider").text === PROVIDERS.searchProvider.api;
			}
			projection() {
				const primary = this.messages.shell();
				const served = [
					primary,
					this.selection.shell(),
					this.api.shell()
				].filter((item) => item.available);
				const shell = {
					available: primary.available,
					writable: served.every((item) => item.writable),
					dirty: served.some((item) => item.dirty),
					invalid: served.some((item) => item.invalid),
					saving: served.some((item) => item.saving),
					failed: served.some((item) => item.failed)
				};
				const searchApi = this.searchApi();
				return {
					...shell,
					apiSwitchAvailable: this.switchAvailable(),
					apiSwitchBlocked: shell.invalid || shell.failed,
					useSearchApi: searchApi,
					baseURL: (searchApi ? this.api : this.messages).field("baseURL"),
					maxUses: this.messages.field("maxUses"),
					count: this.api.field("count"),
					apiKey: this.selection.field(API_KEY_FIELD),
					apiKeyConfigured: this.credential.configured,
					apiKeyWritable: this.credential.writable
				};
			}
			/** The reference the selected API's section names, or the providers' default. */
			ref() {
				return refOf(this.searchApi() ? this.scopes.api.getSnapshot() : this.scopes.messages.getSnapshot());
			}
			/** Clear the old reference's answer and invalidate its pending reads. */
			resetCredentialReference(ref) {
				this.credential = {
					ref,
					configured: false,
					writable: true
				};
				this.credentialReadSequence++;
			}
			/** Combine settings publications, including connection-reset refreshes, into one credential read. */
			queueCredentialRead() {
				if (this.credentialReadQueued) return;
				this.credentialReadQueued = true;
				queueMicrotask(() => {
					this.credentialReadQueued = false;
					this.readCredential();
				});
			}
			/**
			* Ask the credentials domain about the reference the selected section currently names.
			*
			* Only the latest read for the selected reference publishes its answer.
			* A write's readback retains its own result even if another read starts.
			* @returns the answer for this read, or undefined after failure, disposal, or a reference change.
			*/
			async readCredential() {
				if (this.disposed) return;
				const ref = this.ref();
				if (ref !== this.credential.ref) {
					this.resetCredentialReference(ref);
					this.store.set(this.projection());
				}
				const sequence = ++this.credentialReadSequence;
				const response = await this.ctx.remote.credentials.describe([ref]);
				if (this.disposed || !response.ok || ref !== this.ref()) return;
				const view = response.value[ref];
				const next = {
					ref,
					configured: view?.configured ?? false,
					writable: view?.writable ?? true
				};
				if (sequence === this.credentialReadSequence && (next.configured !== this.credential.configured || next.writable !== this.credential.writable)) {
					this.credential = next;
					this.store.set(this.projection());
				}
				return next;
			}
			/**
			* Re-read after the Host reports a change to the reference this page watches.
			*
			* A key can be written from somewhere else — the Models page addresses the
			* same reference — and no settings section changes when it is, so without
			* this the badge keeps reporting a state the Host already replaced.
			* @param ref - the reference the Host reports as changed.
			*/
			refreshCredential(ref) {
				if (ref !== this.credential.ref) return;
				this.readCredential();
			}
			/**
			* Build the face the page's slot registration injects. `baseURL` edits the
			* selected API's endpoint; `maxUses` and `count` edit their own sections.
			* @returns the page's snapshot and its form actions.
			*/
			inject() {
				const formOf = (field) => {
					if (field === API_KEY_FIELD) return this.selection;
					if (field === "maxUses") return this.messages;
					if (field === "count") return this.api;
					return this.searchApi() ? this.api : this.messages;
				};
				return {
					hooks: { webSearchCard: this.store },
					edit: (field, text) => {
						formOf(field).actions().edit(field, text);
					},
					resetField: (field) => {
						formOf(field).actions().resetField(field);
					},
					setSearchApi: (enabled) => {
						this.select(enabled);
					},
					save: () => {
						this.save();
					},
					discard: () => {
						for (const form of [
							this.selection,
							this.messages,
							this.api
						]) form.actions().discard();
					}
				};
			}
			/**
			* Stage both provider selections for one switch position. A target equal to
			* the composed value clears the override so the deployment default keeps
			* applying.
			* @param enabled - true for the Search and Fetch APIs.
			*/
			select(enabled) {
				const base = this.scopes.web.getSnapshot().base;
				const actions = this.selection.actions();
				for (const field of ["searchProvider", "fetchProvider"]) {
					const target = PROVIDERS[field][enabled ? "api" : "messages"];
					if (base?.[field] === target) actions.resetField(field);
					else actions.edit(field, target);
				}
			}
			/**
			* Save the provider sections before the selection, so a switch takes effect
			* only after the endpoint it uses has landed. A refused section stops the
			* selection from saving and keeps every remaining draft for correction.
			* @returns settlement after every attempted write.
			*/
			async save() {
				const state = this.projection();
				if (!state.available || state.invalid || state.saving) return;
				for (const form of [this.messages, this.api]) {
					if (!form.shell().available || !form.shell().dirty) continue;
					await form.save();
					if (form.shell().failed) return;
				}
				if (this.selection.shell().dirty) await this.selection.save();
			}
			/**
			* Write the staged key, then re-read whether the Host now holds one.
			* @param value - the staged credential literal.
			* @returns whether the Host reports a configured credential afterwards.
			*/
			async writeKey(value) {
				await this.ctx.remote.credentials.set(this.ref(), value);
				return (await this.readCredential())?.configured ?? false;
			}
			/** Release subscriptions and prevent queued reads or late answers from publishing. */
			dispose() {
				this.disposed = true;
				for (const off of this.unsubscribe) off();
				for (const form of [
					this.selection,
					this.messages,
					this.api
				]) form.dispose();
			}
		};
		/**
		* The credential reference a section names, or the providers' default.
		* @param snapshot - the section's current scope snapshot.
		* @returns the reference to address.
		*/
		function refOf(snapshot) {
			const declared = snapshot.value?.apiKeyEnv;
			return declared !== void 0 && declared.length > 0 ? declared : DEFAULT_API_KEY_REF;
		}
