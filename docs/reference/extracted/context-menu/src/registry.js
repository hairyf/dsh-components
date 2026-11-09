// Extracted from @deepseek-ai/dsh-client-ui-context-menu (lib/client.js); region lib/types/client/registry.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** React-free registry; each occurrence captures the providers registered at opening. */
		var MenuRegistry = class {
			failed;
			timeoutMs;
			providers = /* @__PURE__ */ new Map();
			occurrences = /* @__PURE__ */ new Set();
			disposed = false;
			constructor(failed, timeoutMs) {
				this.failed = failed;
				this.timeoutMs = timeoutMs;
			}
			/**
			* Register actions for subsequent openings.
			* @param input - provider definition.
			* @returns removal of this contribution and its pending resolutions.
			*/
			register(input) {
				if (this.disposed) throw new Error("Menu registry is disposed");
				const key = `${encodeURIComponent(input.target)}/${encodeURIComponent(input.id)}`;
				if (this.providers.has(key)) throw new Error(`Duplicate menu contribution: ${key}`);
				const provider = {
					id: input.id,
					kind: input.target,
					order: input.order,
					lifetime: new AbortController(),
					observe: (target) => input.observe?.(target.value) ?? [],
					resolve: (target, signal) => input.resolve(target.value, signal)
				};
				this.providers.set(key, provider);
				return () => {
					if (provider.lifetime.signal.aborted) return;
					this.providers.delete(key);
					provider.lifetime.abort();
				};
			}
			/**
			* Resolve an independently owned occurrence.
			* @param target - captured clicked identity.
			* @returns presentation, selection, and disposal.
			*/
			resolve(target) {
				if (this.disposed) throw new Error("Menu registry is disposed");
				const lifetime = new AbortController();
				const source = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)([]);
				const resolved = /* @__PURE__ */ new Map();
				const callbacks = /* @__PURE__ */ new Map();
				const providers = [...this.providers.values()].filter((p) => p.kind === target.kind).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
				const refresh = () => {
					source.set(providers.flatMap((provider) => provider.lifetime.signal.aborted ? [] : resolved.get(provider) ?? []));
				};
				const cleanup = [];
				const dispose = () => {
					if (lifetime.signal.aborted) return;
					lifetime.abort();
					for (const detach of cleanup) detach();
					callbacks.clear();
					this.occurrences.delete(dispose);
				};
				this.occurrences.add(dispose);
				const pending = [];
				for (const provider of providers) {
					let preparation;
					let actionIds = [];
					let preparing;
					const clear = () => {
						for (const id of actionIds) callbacks.delete(id);
						actionIds = [];
						resolved.delete(provider);
						refresh();
					};
					const prepare = () => {
						preparation?.abort();
						const deadline = new AbortController();
						preparation = deadline;
						const signal = AbortSignal.any([
							lifetime.signal,
							provider.lifetime.signal,
							deadline.signal
						]);
						const accept = (actions) => {
							if (signal.aborted) return;
							const next = /* @__PURE__ */ new Map();
							const project = (action, parent) => {
								const id = `${parent}/${encodeURIComponent(action.id)}`;
								if (next.has(id)) throw new Error(`Duplicate menu action: ${id}`);
								next.set(id, action);
								const { run: _run, failureLabel: _failureLabel, children, ...view } = action;
								return {
									...view,
									id,
									...children === void 0 ? {} : { children: children.map((child) => project(child, id)) }
								};
							};
							const views = actions.map((action) => project(action, encodeURIComponent(provider.id)));
							for (const id of actionIds) callbacks.delete(id);
							for (const [id, action] of next) callbacks.set(id, {
								provider,
								action
							});
							actionIds = [...next.keys()];
							resolved.set(provider, views);
							refresh();
						};
						preparing = void 0;
						try {
							const result = provider.resolve(target, signal);
							if (result instanceof Promise) clear();
							preparing = result instanceof Promise ? new Promise((settle) => {
								const timer = this.timeoutMs === void 0 ? void 0 : setTimeout(() => {
									deadline.abort();
									this.failed();
								}, this.timeoutMs);
								const finish = () => {
									clearTimeout(timer);
									signal.removeEventListener("abort", finish);
									settle();
								};
								signal.addEventListener("abort", finish, { once: true });
								result.then(accept).catch(() => {
									if (!signal.aborted) this.failed();
								}).finally(finish);
							}) : void 0;
							if (!(result instanceof Promise)) accept(result);
						} catch (_error) {
							if (!signal.aborted) {
								clear();
								this.failed();
							}
						}
					};
					const subscriptions = [];
					const withdraw = () => {
						preparation?.abort();
						for (const detach of subscriptions.splice(0)) detach();
						clear();
					};
					provider.lifetime.signal.addEventListener("abort", withdraw, { once: true });
					cleanup.push(() => {
						provider.lifetime.signal.removeEventListener("abort", withdraw);
						withdraw();
					});
					try {
						for (const input of provider.observe(target)) subscriptions.push(input.subscribe(prepare));
						prepare();
					} catch (_error) {
						if (!lifetime.signal.aborted && !provider.lifetime.signal.aborted) this.failed();
					}
					pending.push((async () => {
						let current;
						do {
							current = preparing;
							await current;
						} while (current !== preparing);
					})());
				}
				return {
					source,
					dispose,
					ready: Promise.all(pending).then(() => {}),
					select: (id) => {
						const selected = callbacks.get(id);
						if (lifetime.signal.aborted || selected === void 0 || selected.provider.lifetime.signal.aborted || selected.action.disabled || selected.action.children !== void 0) return;
						const run = selected.action.run;
						dispose();
						try {
							Promise.resolve(run?.()).catch(() => {
								this.failed(selected.action.failureLabel);
							});
						} catch (_error) {
							this.failed(selected.action.failureLabel);
						}
					}
				};
			}
			/** Cancel every occurrence and reject further registrations or resolutions. */
			dispose() {
				if (this.disposed) return;
				this.disposed = true;
				for (const dispose of this.occurrences) dispose();
				for (const provider of this.providers.values()) provider.lifetime.abort();
				this.providers.clear();
			}
		};
