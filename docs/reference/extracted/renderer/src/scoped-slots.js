// Extracted from @deepseek-ai/dsh-client-ui-renderer (lib/client.js); region lib/types/client/scoped-slots.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* React renderer for declarative slots. Per-entry bindings enforce child
		* authorization, and entry boundaries contain registrant failures.
		*/
		const factoryRenderCache = /* @__PURE__ */ new WeakMap();
		function boundRenderFactorySlot(caller) {
			let render = factoryRenderCache.get(caller);
			if (render !== void 0) return render;
			render = ((name, props, options) => (0, react_jsx_runtime.jsx)(FactoryOutlet, {
				name,
				inputProps: props,
				slots: options?.slots,
				fallback: options?.fallback,
				caller
			}));
			factoryRenderCache.set(caller, render);
			return render;
		}
		/**
		* Per-entry renderSlot bindings. The binding is identity-stable per entry
		* (memoized components must not resubscribe on unrelated re-renders) and dies
		* with the entry: a retained closure calling after the entry's disposal hits
		* the in-ledger check and throws.
		*/
		const renderSlotCache = /* @__PURE__ */ new WeakMap();
		function boundRenderSlot(host, entry) {
			let binding = renderSlotCache.get(entry);
			if (!binding) {
				binding = (key, owner, opts) => {
					if (!host.isLive(entry)) throw new _deepseek_ai_dsh_client_ui_slots.StaleAuthorizationError(`renderSlot('${key}') from a disposed registration`);
					const declared = entry.children?.[key];
					if (declared === void 0) throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`slot '${key}' is not declared by this entry's children`);
					if (declared.kind === "chain") throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`slot '${key}' is declared 'chain' — use renderSlotChain`);
					return (0, react_jsx_runtime.jsx)(SlotOutlet, {
						slotKey: key,
						ownerProps: owner,
						opts,
						declaredInline: declared.inline === true
					});
				};
				renderSlotCache.set(entry, binding);
			}
			return binding;
		}
		/**
		* Per-entry renderSlotChain bindings: identity-stable per entry (same cache
		* axis as renderSlot — a per-frame dispatch must not rebuild the binding) and
		* dead with the entry. The chain-kind check is the plain-JS backstop twin of
		* the declaration check; typed callers are narrowed to chain keys.
		*/
		const renderSlotChainCache = /* @__PURE__ */ new WeakMap();
		function boundRenderSlotChain(host, entry) {
			let binding = renderSlotChainCache.get(entry);
			if (!binding) {
				binding = (key, owner, opts) => {
					if (!host.isLive(entry)) throw new _deepseek_ai_dsh_client_ui_slots.StaleAuthorizationError(`renderSlotChain('${key}') from a disposed registration`);
					const declared = entry.children?.[key];
					if (declared === void 0) throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`slot '${key}' is not declared by this entry's children`);
					if (declared.kind !== "chain") throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`slot '${key}' is declared '${declared.kind}', not 'chain' — use renderSlot`);
					return (0, react_jsx_runtime.jsx)(SlotOutlet, {
						slotKey: key,
						ownerProps: owner,
						opts,
						declaredInline: declared.inline === true
					});
				};
				renderSlotChainCache.set(entry, binding);
			}
			return binding;
		}
		const factoryRenderSlotCache = /* @__PURE__ */ new WeakMap();
		const factoryRenderSlotChainCache = /* @__PURE__ */ new WeakMap();
		function boundFactoryRenderSlot(host, definition) {
			let binding = factoryRenderSlotCache.get(definition);
			if (binding !== void 0) return binding;
			binding = (key, owner, opts) => {
				if (!host.isFactoryLive(definition)) throw new _deepseek_ai_dsh_client_ui_slots.StaleAuthorizationError(`renderSlot('${key}') from a disposed Factory`);
				const declared = definition.children?.[key];
				if (declared === void 0) throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`slot '${key}' is not declared by this Factory`);
				if (declared.kind === "chain") throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`slot '${key}' is declared 'chain' — use renderSlotChain`);
				return (0, react_jsx_runtime.jsx)(SlotOutlet, {
					slotKey: key,
					ownerProps: owner,
					opts,
					declaredInline: declared.inline === true
				});
			};
			factoryRenderSlotCache.set(definition, binding);
			return binding;
		}
		function boundFactoryRenderSlotChain(host, definition) {
			let binding = factoryRenderSlotChainCache.get(definition);
			if (binding !== void 0) return binding;
			binding = (key, owner, opts) => {
				if (!host.isFactoryLive(definition)) throw new _deepseek_ai_dsh_client_ui_slots.StaleAuthorizationError(`renderSlotChain('${key}') from a disposed Factory`);
				const declared = definition.children?.[key];
				if (declared === void 0) throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`slot '${key}' is not declared by this Factory`);
				if (declared.kind !== "chain") throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`slot '${key}' is declared '${declared.kind}', not 'chain' — use renderSlot`);
				return (0, react_jsx_runtime.jsx)(SlotOutlet, {
					slotKey: key,
					ownerProps: owner,
					opts,
					declaredInline: declared.inline === true
				});
			};
			factoryRenderSlotChainCache.set(definition, binding);
			return binding;
		}
		/**
		* Inject results cache: root entries per entry, session entries per
		* (entry x scope binding). WeakMap keys are entry/binding objects (both
		* identity-stable per registration/session scope), so cache lifetime rides
		* the same axes as the values it memoizes.
		*/
		const rootInjectCache = /* @__PURE__ */ new WeakMap();
		const sessionInjectCache = /* @__PURE__ */ new WeakMap();
		const sessionMaybeInjectCache = /* @__PURE__ */ new WeakMap();
		const EMPTY_INJECTED_PROPS = {};
		function runInject(entry, binding, actions) {
			const inject = entry.inject;
			if (!inject) return EMPTY_INJECTED_PROPS;
			const args = [];
			if (binding !== void 0) args.push(binding.key);
			if (actions !== void 0) args.push(actions);
			return bindInjectSources(inject(...args));
		}
		/** Bind one entry-owned inject face on its existing cache axis. */
		function bindInjectSources(face) {
			const sources = face["hooks"];
			const keyedSources = face["keyedHooks"];
			if (sources === void 0 && keyedSources === void 0) return face;
			const { hooks: _hooks, keyedHooks: _keyedHooks, ...rest } = face;
			const bound = rest;
			for (const [name, source] of Object.entries(sources ?? {})) {
				const hookName = (0, _deepseek_ai_dsh_client_ui_slots.standardHookPropName)(name);
				bound[hookName] = observableHook(source);
			}
			for (const [name, source] of Object.entries(keyedSources ?? {})) {
				const hookName = (0, _deepseek_ai_dsh_client_ui_slots.standardHookPropName)(name);
				bound[hookName] = keyedObservableHook(source);
			}
			return bound;
		}
		const slotInjectCache = /* @__PURE__ */ new WeakMap();
		const EMPTY_SLOT_INJECT = { props: EMPTY_INJECTED_PROPS };
		/** Normalize one dispatcher-owned inject face by its stable object identity. */
		function cachedSlotInject(face) {
			if (face === void 0) return EMPTY_SLOT_INJECT;
			let bound = slotInjectCache.get(face);
			if (bound !== void 0) return bound;
			const definitions = face["hooks"];
			if (definitions === void 0) {
				bound = { props: face };
				slotInjectCache.set(face, bound);
				return bound;
			}
			const { hooks: _hooks, ...rest } = face;
			const props = rest;
			let factories;
			for (const [name, definition] of Object.entries(definitions)) {
				const hookName = (0, _deepseek_ai_dsh_client_ui_slots.standardHookPropName)(name);
				if (typeof definition === "function") {
					factories ??= {};
					factories[name] = definition;
				} else props[hookName] = observableHook(definition);
			}
			bound = factories === void 0 ? { props } : {
				props,
				slotHookFactories: factories
			};
			slotInjectCache.set(face, bound);
			return bound;
		}
		/** Bind deferred slot-level factories for one stable renderSlot occurrence. */
		function bindSlotHookFactories(factories, standard, hookContext) {
			const hooks = {};
			for (const [name, factory] of Object.entries(factories)) {
				const hookName = (0, _deepseek_ai_dsh_client_ui_slots.standardHookPropName)(name);
				hooks[hookName] = factory(standard, hookContext);
			}
			return hooks;
		}
		function cachedRootInject(entry, actions) {
			let props = rootInjectCache.get(entry);
			if (!props) {
				props = runInject(entry, void 0, actions);
				rootInjectCache.set(entry, props);
			}
			return props;
		}
		function cachedSessionInject(entry, binding, actions) {
			let perBinding = sessionInjectCache.get(entry);
			if (!perBinding) {
				perBinding = /* @__PURE__ */ new WeakMap();
				sessionInjectCache.set(entry, perBinding);
			}
			let props = perBinding.get(binding);
			if (!props) {
				props = runInject(entry, binding, actions);
				perBinding.set(binding, props);
			}
			return props;
		}
		function cachedSessionMaybeInject(entry, binding, actions) {
			let perBinding = sessionMaybeInjectCache.get(entry);
			if (!perBinding) {
				perBinding = /* @__PURE__ */ new WeakMap();
				sessionMaybeInjectCache.set(entry, perBinding);
			}
			let props = perBinding.get(binding);
			if (!props) {
				props = runInject(entry, binding, actions);
				perBinding.set(binding, props);
			}
			return props;
		}
		/**
		* Locale `t` seat bindings, cached per (face, namespace, revision). The
		* revision is part of the cache key ON PURPOSE: a locale switch mints a NEW
		* function reference per namespace, so `React.memo` components taking `t`
		* re-render through ordinary shallow comparison — freshness rides identity,
		* no extra invalidation channel. Within one revision the reference is stable
		* (memoized children do not churn on unrelated re-renders).
		*/
		const localeSeatCache = /* @__PURE__ */ new WeakMap();
		function localeSeat(face, ns) {
			let perNs = localeSeatCache.get(face);
			if (!perNs) {
				perNs = /* @__PURE__ */ new Map();
				localeSeatCache.set(face, perNs);
			}
			const revision = face.getSnapshot().revision;
			const cached = perNs.get(ns);
			if (cached && cached.revision === revision) return cached.t;
			const bound = face.bind(ns);
			const t = (key, params) => bound(key, params);
			perNs.set(ns, {
				revision,
				t
			});
			return t;
		}
		const noopSubscribe = () => () => {};
		const zeroRevision = () => 0;
		/**
		* Per-face subscribe/getSnapshot closure pair. Cached by face identity: the
		* face is one global source shared by every outlet, and uSES resubscribes
		* whenever the subscribe reference changes — fresh closures per render would
		* churn one unsubscribe/resubscribe pair per outlet per render.
		*/
		const localeSubscriptionCache = /* @__PURE__ */ new WeakMap();
		function localeSubscription(face) {
			let cached = localeSubscriptionCache.get(face);
			if (!cached) {
				cached = {
					subscribe: (fn) => face.subscribe(fn),
					getRevision: () => face.getSnapshot().revision
				};
				localeSubscriptionCache.set(face, cached);
			}
			return cached;
		}
		/**
		* Subscribe an outlet to the installed locale face's revision (0 while none
		* is installed — exactly one uSES call either way, keeping hook order
		* stable). Every outlet re-renders on a locale switch; entry bodies then
		* re-derive their `t` seat at the new revision. The face must be installed
		* before the first render that needs it — a face appearing later has no
		* notification channel to already-mounted outlets.
		*/
		function useLocaleRevision(face) {
			const subscription = face !== void 0 ? localeSubscription(face) : void 0;
			return (0, react.useSyncExternalStore)(subscription?.subscribe ?? noopSubscribe, subscription?.getRevision ?? zeroRevision);
		}
		/**
		* Entry-identity React keys for entry boundaries. An outlet renders one
		* winner per position (single/keyed/list cell head, chain election) through
		* an error boundary; without a key, a boundary that failed on entry A would
		* survive a winner change (re-election, shadowing fallback after an
		* abdication, HMR re-registration) and keep a healthy entry B blacked out.
		* Keying by entry identity remounts the boundary fresh whenever the winner
		* changes (entries are identity-stable per registration, so the key is
		* stable while the same entry stays the winner).
		*/
		let nextEntryKey = 0;
		const entryKeys = /* @__PURE__ */ new WeakMap();
		function entryKeyOf(entry) {
			let key = entryKeys.get(entry);
			if (key === void 0) {
				key = nextEntryKey++;
				entryKeys.set(entry, key);
			}
			return key;
		}
		let nextSessionGenerationKey = 0;
		const sessionGenerationKeys = /* @__PURE__ */ new WeakMap();
		function sessionGenerationKeyOf(binding) {
			let key = sessionGenerationKeys.get(binding.ctx);
			if (key === void 0) {
				key = nextSessionGenerationKey++;
				sessionGenerationKeys.set(binding.ctx, key);
			}
			return key;
		}
		/**
		* Per-entry isolation: one registrant crashing (component render or inject
		* factory) must not take down siblings. Assembly errors (missing providers)
		* rethrow — a miswired shell must fail loud, not degrade into fallbacks.
		* Every catch reports through `onEntryError` (the ledger's supervision
		* seam); for shadowing kinds the report abdicates the entry, the outlet
		* re-renders onto the cell's next survivor, and this boundary's crash face
		* only shows until that re-render lands (permanently once the cell is dry —
		* the outlet then owns the crash face).
		*/
		var SlotErrorBoundary = class extends react.Component {
			state = { failed: false };
			static getDerivedStateFromError(error) {
				if (error instanceof SlotAssemblyError) throw error;
				return { failed: true };
			}
			componentDidCatch(error) {
				console.error(`slot entry crashed in '${this.props.slotKey}':`, error);
				this.props.onEntryError(error);
			}
			render() {
				const Anchor = this.props.anchor ?? "div";
				if (this.state.failed) return (0, react_jsx_runtime.jsx)(Anchor, { "data-slot-error": this.props.slotKey });
				return this.props.children;
			}
		};
		/** Contain one Factory occurrence without retiring the shared definition. */
		var FactoryErrorBoundary = class extends react.Component {
			state = { failed: false };
			static getDerivedStateFromError(error) {
				if (error instanceof SlotAssemblyError) throw error;
				return { failed: true };
			}
			componentDidCatch(error) {
				console.error(`slot factory occurrence crashed in '${this.props.name}':`, error);
				this.props.onEntryError(error);
			}
			render() {
				if (this.state.failed) return (0, react_jsx_runtime.jsx)("div", { "data-factory-error": this.props.name });
				return this.props.children;
			}
		};
		const rootStandardCache = /* @__PURE__ */ new WeakMap();
		const sessionStandardCache = /* @__PURE__ */ new WeakMap();
		const sessionMaybeStandardCache = /* @__PURE__ */ new WeakMap();
		/** Materialize one binding into stable framework Hook and plain-prop seats. */
		function materializeStandardBinding(binding, optional, defaultKey) {
			const standard = { ...binding.props };
			for (const [name, source] of Object.entries(binding.hooks)) {
				if (source === void 0 && !optional) throw new SlotAssemblyError(`strict standard hook '${name}' has no source`);
				standard[(0, _deepseek_ai_dsh_client_ui_slots.standardHookPropName)(name)] = optional ? maybeObservableHook(source) : observableHook(source);
			}
			for (const [name, source] of Object.entries(binding.keyedHooks)) {
				if (source === void 0 && !optional) throw new SlotAssemblyError(`strict keyed standard hook '${name}' has no source resolver`);
				standard[(0, _deepseek_ai_dsh_client_ui_slots.standardHookPropName)(name)] = keyedObservableHook(source, defaultKey);
			}
			return standard;
		}
		/** Stable official-props object used by contextual Hook factories. */
		function standardProps(scope, rootBinding, scopeBinding) {
			let root = rootStandardCache.get(rootBinding);
			if (root === void 0) {
				root = materializeStandardBinding(rootBinding, false);
				rootStandardCache.set(rootBinding, root);
			}
			if (scope === "root") return root;
			if (scopeBinding === void 0) throw new SlotAssemblyError(`scope '${scope}' rendered without a standard-source binding`);
			const cache = scope === "session" ? sessionStandardCache : sessionMaybeStandardCache;
			let perScope = cache.get(rootBinding);
			if (perScope === void 0) {
				perScope = /* @__PURE__ */ new WeakMap();
				cache.set(rootBinding, perScope);
			}
			let standard = perScope.get(scopeBinding);
			if (standard !== void 0) return standard;
			standard = {
				...materializeStandardBinding(rootBinding, false, scopeBinding.key),
				...materializeStandardBinding(scopeBinding, scope === "session-maybe")
			};
			perScope.set(scopeBinding, standard);
			return standard;
		}
		const scopeAreaCache = /* @__PURE__ */ new WeakMap();
		/** Bind one domain-owned scope area renderer to the current scope binding. */
		function scopeAreaProvider(adapter) {
			let Provider = scopeAreaCache.get(adapter);
			if (Provider !== void 0) return Provider;
			if (adapter.renderArea === void 0) throw new SlotAssemblyError("scope 'session' adapter does not provide its area renderer");
			const renderArea = adapter.renderArea.bind(adapter);
			Provider = function ScopeAreaProvider(props) {
				const inherited = useScopeBinding();
				const explicit = Object.hasOwn(props, "session");
				const source = adapter.bindingSource(props.session);
				const resolved = (0, react.useSyncExternalStore)((listener) => source.subscribe(listener), () => source.getSnapshot(), () => source.getSnapshot());
				const binding = explicit ? resolved : inherited;
				return (0, react_jsx_runtime.jsx)(ScopeBindingProvider, {
					binding,
					children: renderArea(binding, props)
				});
			};
			scopeAreaCache.set(adapter, Provider);
			return Provider;
		}
		/**
		* Standard-kit synthesis shared by both scope branches: the global
		* useSessions/useWorkspaces hooks, the per-session provide bundle (every
		* `hooks` source becomes a `use<Name>` selector hook — useSession is the
		* runtime's own 'session' contribution, no special case — and `props` spread
		* verbatim), the store pair when declared, the renderSlot binding when
		* children are declared, and the SessionProvider seat when the children
		* declare a session-scope slot. Hosts hand out BARE observable sources
		* (hooks never cross the host contract); every hook is bound HERE, cached
		* per source (observableHook), so spreading a fresh kit object per render
		* never churns child subscriptions.
		*/
		function standardKit(host, entry, scope, rootBinding, scopeBinding) {
			const standard = standardProps(scope, rootBinding, scopeBinding);
			const kit = {
				...standard,
				renderFactorySlot: boundRenderFactorySlot(entry)
			};
			if (entry.locale !== void 0) {
				const face = host.locale;
				if (face === void 0) throw new SlotAssemblyError(`entry declares locale namespace '${entry.locale}' but no locale face is installed (locale plugin missing from the composition?)`);
				kit["t"] = localeSeat(face, entry.locale);
			}
			const scopedStoreBinding = scopeBinding?.key === void 0 ? void 0 : scopeBinding;
			const store = host.storeOf(entry, scopedStoreBinding);
			if (store !== void 0) {
				kit["useStore"] = observableHook(store);
				kit["actions"] = store.actions;
			}
			if (entry.children !== void 0) {
				kit["renderSlot"] = boundRenderSlot(host, entry);
				if (Object.values(entry.children).some((spec) => spec.kind === "chain")) kit["renderSlotChain"] = boundRenderSlotChain(host, entry);
				if (Object.values(entry.children).some((spec) => spec.scope !== "root")) {
					const adapter = host.scope("session");
					if (adapter === void 0) throw new SlotAssemblyError("entry declares a session child without an installed 'session' scope adapter");
					kit["SessionProvider"] = scopeAreaProvider(adapter);
				}
			}
			return {
				kit,
				standard,
				actions: store?.actions
			};
		}
		/**
		* One rendered entry: standard kit + cached entry inject + common slot inject
		* + owner props (owner wins). The shares are erased at this render boundary;
		* the registration and renderSlot seams already proved their contracts.
		*/
		function ContextualEntry({ slotKey, Comp, kit, standard, injected, slotInjected, ownerProps, hookContext, hasHookContext }) {
			const contextual = (0, react.useMemo)(() => {
				if (!hasHookContext) throw new SlotAssemblyError(`slot '${slotKey}' has contextual injected Hooks but no hookContext`);
				return bindSlotHookFactories(slotInjected.slotHookFactories, standard, hookContext);
			}, [
				hasHookContext,
				hookContext,
				slotInjected.slotHookFactories,
				slotKey,
				standard
			]);
			return (0, react_jsx_runtime.jsx)(Comp, {
				...kit,
				...injected,
				...slotInjected.props,
				...contextual,
				...ownerProps
			});
		}
		function renderEntry(slotKey, Comp, kit, standard, injected, slotInjected, ownerProps, hookContext, hasHookContext) {
			if (slotInjected.slotHookFactories === void 0) return (0, react_jsx_runtime.jsx)(Comp, {
				...kit,
				...injected,
				...slotInjected.props,
				...ownerProps
			});
			return (0, react_jsx_runtime.jsx)(ContextualEntry, {
				slotKey,
				Comp,
				kit,
				standard,
				injected,
				slotInjected,
				ownerProps,
				hookContext,
				hasHookContext
			});
		}
		function SessionEntry({ entry, ownerProps, binding, slotKey, slotInjected, hookContext, hasHookContext }) {
			const host = useHost();
			const rootBinding = useRootBinding();
			const Comp = entry.component;
			const { kit, standard, actions } = standardKit(host, entry, "session", rootBinding, binding);
			return renderEntry(slotKey, Comp, kit, standard, cachedSessionInject(entry, binding, actions), slotInjected, ownerProps, hookContext, hasHookContext);
		}
		function SessionMaybeEntryBody({ entry, ownerProps, binding, slotKey, slotInjected, hookContext, hasHookContext }) {
			const host = useHost();
			const rootBinding = useRootBinding();
			const Comp = entry.component;
			const { kit, standard, actions } = standardKit(host, entry, "session-maybe", rootBinding, binding);
			return renderEntry(slotKey, Comp, kit, standard, cachedSessionMaybeInject(entry, binding, actions), slotInjected, ownerProps, hookContext, hasHookContext);
		}
		/**
		* Session-maybe identity: adoption — the ONLY behavior (there is no
		* hold-identity-forever mode). An incarnation born session-less ADOPTS the
		* first session that arrives: identity holds across that one transition
		* (undefined → first id), so a blank shell's DOM survives the moment a
		* session appears. From then on the entry behaves exactly like a strict
		* session entry: switching to a DIFFERENT session remounts (component-local
		* state must not leak between sessions), and dropping back to no-session
		* remounts into a fresh blank incarnation, which will adopt again.
		* Component-local per-session state therefore clears by construction; state
		* that must SURVIVE a switch belongs in session-bound sources (machine,
		* store, hooks) — the existing layering rule, now load-bearing.
		*/
		function SessionMaybeEntry({ entry, ownerProps, slotKey, slotInjected, hookContext, hasHookContext }) {
			const binding = useScopeBinding();
			const epoch = useMaybeIncarnation(binding);
			return (0, react_jsx_runtime.jsx)(SessionMaybeEntryBody, {
				entry,
				ownerProps,
				binding,
				slotKey,
				slotInjected,
				hookContext,
				hasHookContext
			}, epoch);
		}
		const FIRST_INCARNATION = {
			adopted: void 0,
			epoch: 0
		};
		function useMaybeIncarnation(binding) {
			const identity = binding.key === void 0 ? void 0 : binding.ctx;
			const [state, setState] = (0, react.useState)(FIRST_INCARNATION);
			let { adopted, epoch } = state;
			if (identity !== void 0 && adopted === void 0) {
				adopted = identity;
				setState({
					adopted,
					epoch
				});
			} else if (adopted !== void 0 && identity !== void 0 && identity !== adopted) {
				adopted = identity;
				epoch += 1;
				setState({
					adopted,
					epoch
				});
			} else if (adopted !== void 0 && identity === void 0) {
				adopted = void 0;
				epoch += 1;
				setState({
					adopted,
					epoch
				});
			}
			return epoch;
		}
		function RootEntry({ entry, ownerProps, slotKey, slotInjected, hookContext, hasHookContext }) {
			const host = useHost();
			const rootBinding = useRootBinding();
			const Comp = entry.component;
			const { kit, standard, actions } = standardKit(host, entry, "root", rootBinding, void 0);
			return renderEntry(slotKey, Comp, kit, standard, cachedRootInject(entry, actions), slotInjected, ownerProps, hookContext, hasHookContext);
		}
		const FactoryOccurrenceContext = (0, react.createContext)(null);
		const FactoryAncestryContext = (0, react.createContext)(/* @__PURE__ */ new Set());
		const EMPTY_FACTORY_SELECTION = {};
		function useFactorySlotRuntime(name, fallback) {
			const occurrence = (0, react.useContext)(FactoryOccurrenceContext);
			if (occurrence === null) throw new SlotAssemblyError("useFactorySlot() called outside a Factory occurrence");
			if (!occurrence.host.isFactoryLive(occurrence.definition)) throw new _deepseek_ai_dsh_client_ui_slots.StaleAuthorizationError(`useFactorySlot('${name}') from a disposed Factory`);
			const declared = occurrence.definition.slots?.[name];
			if (declared === void 0) throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`local slot '${name}' is not declared by factory '${occurrence.definition.name}'`);
			const selected = occurrence.selected[name];
			const Selected = selected ?? fallback;
			const usesFallback = selected === void 0;
			const { definition, host } = occurrence;
			return (0, react.useMemo)(function bindFactoryLocalComponent() {
				return function BoundFactoryLocalComponent(localProps) {
					const current = (0, react.useContext)(FactoryOccurrenceContext);
					const localScopeBinding = useScopeBinding();
					const localMaybeEpoch = useMaybeIncarnation(localScopeBinding);
					if (!host.isFactoryLive(definition)) throw new _deepseek_ai_dsh_client_ui_slots.StaleAuthorizationError(`local slot '${name}' from a disposed Factory`);
					if (current === null || current.definition !== definition) throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`local slot '${name}' rendered outside factory '${definition.name}'`);
					if (declared.scope === "session" && localScopeBinding.key === void 0) throw new SlotAssemblyError(`strict session local slot '${name}' from factory '${definition.name}' rendered without a scope binding`);
					const localOwner = usesFallback ? definition : current.caller;
					const localScopeIdentity = declared.scope === "root" ? "root" : declared.scope === "session" ? `session:${sessionGenerationKeyOf(localScopeBinding)}` : `session-maybe:${localMaybeEpoch}`;
					const localStandard = standardProps(declared.scope, current.rootBinding, localScopeBinding);
					const localRegistrationKit = {
						...current.registrationKit,
						renderFactorySlot: boundRenderFactorySlot(localOwner)
					};
					assertNoPropOverlap(`factory '${definition.name}' local slot '${name}'`, localRegistrationKit, localStandard);
					const provided = {
						...localRegistrationKit,
						...localStandard
					};
					assertNoPropOverlap(`factory '${definition.name}' local slot '${name}'`, provided, localProps);
					return (0, react_jsx_runtime.jsx)(FactoryErrorBoundary, {
						name: `${definition.name}:${name}`,
						onEntryError: (error) => {
							host.reportFactoryError(definition.name, localOwner, error);
						},
						children: (0, react_jsx_runtime.jsx)(Selected, {
							...provided,
							...localProps
						})
					}, `${definition.name}:${name}:${localScopeIdentity}`);
				};
			}, [
				Selected,
				declared.scope,
				definition,
				host,
				name,
				usesFallback
			]);
		}
		function assertNoPropOverlap(owner, provided, received) {
			for (const name of Object.keys(received)) if (Object.hasOwn(provided, name)) throw new SlotAssemblyError(`${owner} received duplicate prop '${name}'`);
		}
		function factoryKit(host, definition, rootBinding, scopeBinding, occurrence) {
			const standard = standardProps(definition.scope, rootBinding, scopeBinding);
			const registrationKit = { renderFactorySlot: boundRenderFactorySlot(definition) };
			if (definition.locale !== void 0) {
				const face = host.locale;
				if (face === void 0) throw new SlotAssemblyError(`factory declares locale namespace '${definition.locale}' but no locale face is installed`);
				registrationKit["t"] = localeSeat(face, definition.locale);
			}
			const scoped = scopeBinding?.key === void 0 ? void 0 : scopeBinding;
			const store = host.factoryStoreOf(definition, scoped, occurrence);
			if (store !== void 0) {
				registrationKit["useStore"] = observableHook(store);
				registrationKit["actions"] = store.actions;
			}
			if (definition.children !== void 0) {
				registrationKit["renderSlot"] = boundFactoryRenderSlot(host, definition);
				if (Object.values(definition.children).some((spec) => spec.kind === "chain")) registrationKit["renderSlotChain"] = boundFactoryRenderSlotChain(host, definition);
				if (Object.values(definition.children).some((spec) => spec.scope !== "root")) {
					const sessionAdapter = host.scope("session");
					if (sessionAdapter === void 0) throw new SlotAssemblyError("factory declares a session child without an installed 'session' scope adapter");
					registrationKit["SessionProvider"] = scopeAreaProvider(sessionAdapter);
				}
			}
			return {
				kit: {
					...standard,
					...registrationKit
				},
				registrationKit,
				actions: store?.actions
			};
		}
		function FactoryOccurrence({ definition, inputProps, selected, caller, binding, maybeEpoch }) {
			if (definition.scope === "root") return (0, react_jsx_runtime.jsx)(FactoryOccurrenceBody, {
				definition,
				inputProps,
				selected,
				caller
			});
			if (definition.scope === "session") {
				if (binding.key === void 0) throw new SlotAssemblyError(`strict session factory '${definition.name}' rendered without a scope binding`);
				return (0, react_jsx_runtime.jsx)(FactoryOccurrenceBody, {
					definition,
					inputProps,
					selected,
					caller,
					scopeBinding: binding
				}, sessionGenerationKeyOf(binding));
			}
			return (0, react_jsx_runtime.jsx)(FactoryOccurrenceBody, {
				definition,
				inputProps,
				selected,
				caller,
				scopeBinding: binding
			}, maybeEpoch);
		}
		function FactoryOccurrenceBody({ definition, inputProps, selected, caller, scopeBinding }) {
			const host = useHost();
			const rootBinding = useRootBinding();
			const occurrence = (0, react.useRef)({}).current;
			const localeRevision = useLocaleRevision(host.locale);
			(0, react.useEffect)(() => host.retainFactoryOccurrence(definition, occurrence), [
				definition,
				host,
				occurrence
			]);
			const { kit, registrationKit, actions } = (0, react.useMemo)(() => factoryKit(host, definition, rootBinding, scopeBinding, occurrence), [
				definition,
				host,
				localeRevision,
				occurrence,
				rootBinding,
				scopeBinding
			]);
			const injected = (0, react.useMemo)(() => runInject(definition, scopeBinding, actions), [
				actions,
				definition,
				scopeBinding
			]);
			assertNoPropOverlap(`factory '${definition.name}' inject`, kit, injected);
			const provided = {
				...kit,
				...injected,
				useFactorySlot: useFactorySlotRuntime
			};
			assertNoPropOverlap(`factory '${definition.name}' occurrence`, provided, inputProps);
			const context = (0, react.useMemo)(() => ({
				host,
				definition,
				selected,
				registrationKit: {
					...registrationKit,
					...injected
				},
				rootBinding,
				caller
			}), [
				caller,
				definition,
				host,
				injected,
				registrationKit,
				rootBinding,
				selected
			]);
			const Comp = definition.component;
			return (0, react_jsx_runtime.jsx)(FactoryOccurrenceContext.Provider, {
				value: context,
				children: (0, react_jsx_runtime.jsx)(Comp, {
					...provided,
					...inputProps
				})
			});
		}
		function FactoryOutlet({ name, inputProps, slots: selected = EMPTY_FACTORY_SELECTION, fallback, caller }) {
			const host = useHost();
			const ancestors = (0, react.useContext)(FactoryAncestryContext);
			const binding = useScopeBinding();
			const maybeEpoch = useMaybeIncarnation(binding);
			const version = (0, react.useSyncExternalStore)((listener) => host.subscribeFactory(name, listener), () => host.getFactoryVersion(name));
			const definition = host.factoryOf(name);
			const nextAncestors = (0, react.useMemo)(() => new Set(ancestors).add(name), [ancestors, name]);
			if (definition === void 0) return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: fallback ?? null });
			if (ancestors.has(name)) throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`recursive render of factory '${name}'`);
			for (const localName of Object.keys(selected)) if (definition.slots?.[localName] === void 0) throw new _deepseek_ai_dsh_client_ui_slots.SlotOwnershipError(`local slot '${localName}' is not declared by factory '${name}'`);
			const scopeIdentity = definition.scope === "root" ? "root" : definition.scope === "session" ? binding.key === void 0 ? "session:absent" : `session:${sessionGenerationKeyOf(binding)}` : `session-maybe:${maybeEpoch}`;
			return (0, react_jsx_runtime.jsx)(FactoryErrorBoundary, {
				name,
				onEntryError: (error) => {
					host.reportFactoryError(name, definition, error);
				},
				children: (0, react_jsx_runtime.jsx)(FactoryAncestryContext.Provider, {
					value: nextAncestors,
					children: (0, react_jsx_runtime.jsx)(FactoryOccurrence, {
						definition,
						inputProps,
						selected,
						caller,
						binding,
						maybeEpoch
					})
				})
			}, `${name}:${version}:${scopeIdentity}`);
		}
		function StrictSessionEntry({ slotKey, anchor, entry, ownerProps, slotInjected, hookContext, hasHookContext, onEntryError }) {
			const binding = useScopeBinding();
			if (binding.key === void 0) throw new SlotAssemblyError(`strict session slot '${slotKey}' rendered without a scope binding`);
			const scopedBinding = binding;
			return (0, react_jsx_runtime.jsx)(SlotErrorBoundary, {
				slotKey,
				anchor,
				onEntryError,
				children: (0, react_jsx_runtime.jsx)(SessionEntry, {
					entry,
					ownerProps,
					binding: scopedBinding,
					slotKey,
					slotInjected,
					hookContext,
					hasHookContext
				})
			}, sessionGenerationKeyOf(scopedBinding));
		}
		/**
		* Anchor style shared by every outlet wrapper: `display:contents` keeps the
		* wrapper out of layout (grid/flex parents see the slot's own children), so
		* the anchor is purely addressable surface. Module-level constant — a stable
		* reference so the wrapper never diffs its style prop.
		*/
		const ANCHOR_STYLE = { display: "contents" };
		function SlotOutlet({ slotKey, ownerProps, opts, declaredInline }) {
			const host = useHost();
			(0, react.useSyncExternalStore)((fn) => host.subscribe(slotKey, fn), () => host.getVersion(slotKey));
			useLocaleRevision(host.locale);
			const scopeBinding = useScopeBinding();
			const spec = host.specOf(slotKey);
			return (0, react_jsx_runtime.jsx)((spec === void 0 ? declaredInline : spec.inline === true) ? "span" : "div", {
				"data-slot": slotKey,
				style: ANCHOR_STYLE,
				children: spec === void 0 ? null : renderOutletContent(host, slotKey, ownerProps, opts, scopeBinding, spec)
			});
		}
		/** Kind dispatch behind the outlet anchor (single/keyed/list/chain, fallbacks, crash faces). */
		function renderOutletContent(host, slotKey, ownerProps, opts, scopeBinding, spec) {
			const Anchor = spec.inline === true ? "span" : "div";
			if (spec.kind === "chain" && opts?.fallbackOnly === true) return renderChainResult(slotKey, null, opts, Anchor);
			if (spec.scope === "session" && scopeBinding.key === void 0) throw new SlotAssemblyError(`strict session slot '${slotKey}' rendered without a scope binding`);
			const entries = host.entriesOf(slotKey);
			const slotInjected = cachedSlotInject(spec.inject);
			const guarded = (entry, key, owner = ownerProps) => {
				const hasHookContext = opts !== void 0 && Object.hasOwn(opts, "hookContext");
				const hookContext = opts?.hookContext;
				const onEntryError = (error) => {
					host.reportEntryError(slotKey, entry, error, { abdicate: spec.kind !== "chain" });
				};
				return spec.scope === "session" ? (0, react_jsx_runtime.jsx)(StrictSessionEntry, {
					slotKey,
					anchor: Anchor,
					entry,
					ownerProps: owner,
					slotInjected,
					hookContext,
					hasHookContext,
					onEntryError
				}, key) : (0, react_jsx_runtime.jsx)(SlotErrorBoundary, {
					slotKey,
					anchor: Anchor,
					onEntryError,
					children: spec.scope === "session-maybe" ? (0, react_jsx_runtime.jsx)(SessionMaybeEntry, {
						entry,
						ownerProps: owner,
						slotKey,
						slotInjected,
						hookContext,
						hasHookContext
					}) : (0, react_jsx_runtime.jsx)(RootEntry, {
						entry,
						ownerProps: owner,
						slotKey,
						slotInjected,
						hookContext,
						hasHookContext
					})
				}, key);
			};
			const deadCell = () => (0, react_jsx_runtime.jsx)(Anchor, { "data-slot-error": slotKey });
			if (spec.kind === "single") {
				const entry = host.entriesOfSlot(slotKey)[0];
				if (!entry) return entries.length > 0 ? deadCell() : (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: opts?.fallback ?? null });
				return guarded(entry, entryKeyOf(entry));
			}
			if (spec.kind === "keyed") {
				const entry = host.entriesOfSlot(slotKey).find((e) => e.options.key === opts?.entryKey);
				if (!entry) return entries.some((e) => e.options.key === opts?.entryKey) ? deadCell() : (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: opts?.fallback ?? null });
				return guarded(entry, entryKeyOf(entry));
			}
			if (spec.kind === "chain") {
				let elected = null;
				for (const entry of entries) {
					let matched;
					try {
						matched = entry.select(ownerProps);
					} catch (error) {
						console.error(`chain selector crashed in '${slotKey}' (${entry.registrant ?? "unknown registrant"}), treating as declined:`, error);
						continue;
					}
					if (matched !== null) {
						elected = guarded(entry, entryKeyOf(entry), {
							...ownerProps,
							matched
						});
						break;
					}
				}
				return renderChainResult(slotKey, elected, opts, Anchor);
			}
			const rows = host.entriesOfSlot(slotKey).map((entry) => ({
				entry,
				id: entry.options.id,
				order: entry.options.order ?? 0
			}));
			const rowIds = new Set(rows.map((row) => row.id));
			for (const entry of entries) {
				if (rowIds.has(entry.options.id)) continue;
				rowIds.add(entry.options.id);
				rows.push({
					entry: void 0,
					id: entry.options.id,
					order: entry.options.order ?? 0
				});
			}
			let list = [...rows].sort((a, b) => a.order - b.order);
			if (opts?.only !== void 0) list = list.filter((item) => item.id === opts.only);
			if (list.length === 0) return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: opts?.fallback ?? null });
			return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: list.map((item, i) => item.entry !== void 0 ? guarded(item.entry, `e${entryKeyOf(item.entry)}`) : (0, react_jsx_runtime.jsx)(Anchor, { "data-slot-error": slotKey }, `x${item.id ?? i}`)) });
		}
		/** Render a chain election while preserving the overlay fallback's tree position. */
		function renderChainResult(slotKey, elected, opts, Anchor) {
			if (!opts?.overlay) return elected ?? (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: opts?.fallback ?? null });
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(Anchor, {
				"data-chain-overlay-fallback": slotKey,
				style: { display: elected === null ? "contents" : "none" },
				children: opts.fallback ?? null
			}), elected] });
		}
		/** Root outlet: the shell's single ctx-level render entry — an unregistered 'root' is a boot-order failure, never a silent blank. */
		function RootOutlet({ ownerProps }) {
			const host = useHost();
			(0, react.useSyncExternalStore)((fn) => host.subscribe("root", fn), () => host.getVersion("root"));
			useLocaleRevision(host.locale);
			const entry = host.entriesOfSlot("root")[0];
			if (!entry) {
				if (host.entriesOf("root").length > 0) return (0, react_jsx_runtime.jsx)("div", { "data-slot-error": "root" });
				throw new SlotAssemblyError("renderSlot('root') before any 'root' registration (boot order)");
			}
			return (0, react_jsx_runtime.jsx)("div", {
				"data-slot": "root",
				style: ANCHOR_STYLE,
				children: (0, react_jsx_runtime.jsx)(SlotErrorBoundary, {
					slotKey: "root",
					onEntryError: (error) => {
						host.reportEntryError("root", entry, error, { abdicate: true });
					},
					children: (0, react_jsx_runtime.jsx)(RootEntry, {
						entry,
						ownerProps,
						slotKey: "root",
						slotInjected: EMPTY_SLOT_INJECT,
						hookContext: void 0,
						hasHookContext: false
					})
				}, entryKeyOf(entry))
			});
		}
		/**
		* Build the renderer installed into the `ui-renderer` SlotRegistry
		* (ctx.slots.install(createSlotRenderer()) at boot; the service owns the
		* install/renderSlot contract and the double-install/not-installed throws).
		* @returns the renderer.
		*/
		function createSlotRenderer() {
			return { renderRoot(host, ownerProps) {
				return (0, react_jsx_runtime.jsx)(HostContext.Provider, {
					value: host,
					children: (0, react_jsx_runtime.jsx)(RootStandardProvider, { children: (0, react_jsx_runtime.jsx)(ScopeProvider, {
						scope: "session-maybe",
						children: (0, react_jsx_runtime.jsx)(RootOutlet, { ownerProps })
					}) })
				});
			} };
		}
