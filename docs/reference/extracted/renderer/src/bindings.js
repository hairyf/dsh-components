// Extracted from @deepseek-ai/dsh-client-ui-renderer (lib/client.js); region lib/types/client/bindings.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Internal React bindings for renderer hosts and standard-source scopes. */
		/** In-package renderer host context. */
		const HostContext = (0, react.createContext)(null);
		/**
		* Read the installed renderer host.
		* @returns the host API.
		*/
		function useHost() {
			const host = (0, react.useContext)(HostContext);
			if (host === null) throw new SlotAssemblyError("slot machinery rendered outside the installed renderer tree");
			return host;
		}
		const RootBindingContext = (0, react.createContext)(null);
		const ScopeBindingContext = (0, react.createContext)(null);
		/**
		* Read the root standard-source binding.
		* @returns the current root binding.
		*/
		function useRootBinding() {
			const binding = (0, react.useContext)(RootBindingContext);
			if (binding === null) throw new SlotAssemblyError("slot rendered outside the root standard-source provider");
			return binding;
		}
		/**
		* Read the current-session-optional binding.
		* @returns a binding whose key is absent when no Session is selected.
		*/
		function useScopeBinding() {
			const binding = (0, react.useContext)(ScopeBindingContext);
			if (binding === null) throw new SlotAssemblyError("scoped slot rendered outside its scope provider");
			return binding;
		}
		/**
		* Publish one resolved scope binding to a renderer subtree.
		* @param props - provider inputs.
		* @param props.binding - binding exposed to scoped entries.
		* @param props.children - subtree that inherits the binding.
		* @returns the scoped React provider.
		*/
		function ScopeBindingProvider({ binding, children }) {
			return (0, react_jsx_runtime.jsx)(ScopeBindingContext.Provider, {
				value: binding,
				children
			});
		}
		/**
		* Bind one observable source to an identity-stable selector Hook.
		* @param source - observable source.
		* @returns cached selector Hook.
		*/
		function observableHook(source) {
			let hook = hookCache.get(source);
			if (hook === void 0) {
				hook = bindSnapshotSelector(source);
				hookCache.set(source, hook);
			}
			return hook;
		}
		const hookCache = /* @__PURE__ */ new WeakMap();
		const absentSource = {
			getSnapshot: () => void 0,
			subscribe: () => () => {}
		};
		/**
		* Bind an optional source without changing Hook call order.
		* @param source - current source, or absence.
		* @returns selector Hook returning `undefined` while absent.
		*/
		function maybeObservableHook(source) {
			if (source !== void 0) return observableHook(source);
			return useAbsentSnapshot;
		}
		function useAbsentSnapshot(_selector, _equal) {
			observableHook(absentSource)(() => void 0);
		}
		/** Read the `(key, member)`, `(key, selector?, equal?)`, or `(selector, equal?)` call forms. */
		function keyedHookCall(defaultKey, keyOrSelector, second, equal) {
			if (typeof keyOrSelector !== "string") return {
				key: defaultKey,
				member: void 0,
				selector: keyOrSelector,
				equal: second
			};
			if (typeof second === "string") return {
				key: keyOrSelector,
				member: second,
				selector: void 0,
				equal: void 0
			};
			return {
				key: keyOrSelector,
				member: void 0,
				selector: second,
				equal
			};
		}
		/**
		* Bind an open-key source family.
		* @param source - keyed resolver, or absence for an optional scope.
		* @returns cached keyed selector Hook.
		*/
		function keyedObservableHook(source, defaultKey) {
			if (source === void 0) return absentKeyedHook;
			let hooks = keyedHookCache.get(source);
			if (hooks === void 0) {
				hooks = /* @__PURE__ */ new Map();
				keyedHookCache.set(source, hooks);
			}
			const cacheKey = defaultKey ?? NO_DEFAULT_KEY;
			let hook = hooks.get(cacheKey);
			if (hook === void 0) {
				hook = (keyOrSelector, second, equal) => {
					const call = keyedHookCall(defaultKey, keyOrSelector, second, equal);
					return observableHook((call.key === void 0 ? void 0 : call.member === void 0 ? source(call.key) : source(call.key, call.member)) ?? absentSource)(call.selector ?? identity, call.equal);
				};
				hooks.set(cacheKey, hook);
			}
			return hook;
		}
		const NO_DEFAULT_KEY = Symbol("no default key");
		const keyedHookCache = /* @__PURE__ */ new WeakMap();
		const identity = (value) => value;
		const absentKeyedHook = (keyOrSelector, second, equal) => {
			const call = keyedHookCall(void 0, keyOrSelector, second, equal);
			return observableHook(absentSource)(call.selector ?? identity, call.equal);
		};
		/** Subscribe the tree to the atomically assembled root standard-source roster. */
		function RootStandardProvider({ children }) {
			const binding = observableHook(useHost().root)((value) => value);
			return (0, react_jsx_runtime.jsx)(RootBindingContext.Provider, {
				value: binding,
				children
			});
		}
		/** Subscribe to the scope roster before resolving and binding its current adapter. */
		function ScopeProvider({ scope, children }) {
			const host = useHost();
			observableHook(host.scopeRevision)((value) => value);
			const adapter = host.scope(scope);
			if (adapter === void 0) throw new SlotAssemblyError(`scope '${scope}' rendered without an installed adapter`);
			const binding = observableHook(adapter.current)((value) => value);
			return (0, react_jsx_runtime.jsx)(ScopeBindingContext.Provider, {
				value: binding,
				children
			});
		}
