// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/conversation/event-registry.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Runtime registry of independently owned Conversation business Definitions. */
		var ConversationEventRegistry = class extends ConversationDefinitionRegistry {
			fallback;
			routes = /* @__PURE__ */ new Map();
			unrestricted = /* @__PURE__ */ new Set();
			tables = /* @__PURE__ */ new WeakMap();
			/**
			* Register a uniquely named business Definition for the caller's lifetime.
			* @param definition - Definition contribution.
			* @returns idempotent disposer.
			*/
			register(definition) {
				assertDefinitionTarget(definition);
				return this.registerDefinition(definition.kind, this.resolve(definition), `conversation Definition "${definition.kind}" is already registered`, `uiConversation.events.register(${JSON.stringify(definition.kind)})`);
			}
			/**
			* Register the sole fallback used only when no ordinary Definition matches.
			* @param input - fallback Definition.
			* @returns idempotent disposer.
			*/
			registerFallback(input) {
				assertDefinitionTarget(input);
				if (input.target === void 0) throw new Error("conversation fallback Definition must declare a target");
				if (this.fallback !== void 0) throw new Error("conversation fallback Definition is already registered");
				const definition = this.resolve(input);
				const dispose = this.ctx.effect(() => {
					this.fallback = definition;
					this.refresh();
					return () => {
						if (this.fallback !== definition) return;
						this.fallback = void 0;
						this.refresh();
					};
				}, `uiConversation.events.registerFallback(${JSON.stringify(definition.kind)})`);
				return () => {
					dispose();
				};
			}
			/**
			* Return the current unmatched-event fallback.
			* @returns installed fallback, when present.
			*/
			fallbackEntry() {
				return this.fallback;
			}
			/**
			* Read precomputed candidates in registration order; the returned Set is borrowed read-only.
			* @param type - current event type.
			* @returns table handlers for this type together with all function-form handlers.
			*/
			forEvent(type) {
				return this.routes.get(type) ?? this.unrestricted;
			}
			resolve(input) {
				if (typeof input.match === "function") return input;
				const table = new Map(Object.entries(input.match));
				const definition = {
					...input,
					match: (event) => table.get(event.type)?.call(definition, event) ?? null
				};
				this.tables.set(definition, table);
				return definition;
			}
			refresh() {
				const routes = /* @__PURE__ */ new Map();
				const unrestricted = /* @__PURE__ */ new Set();
				for (const definition of this.definitions.values()) {
					const table = this.tables.get(definition);
					if (table === void 0) {
						const route = {
							definition,
							match: definition.match.bind(definition)
						};
						unrestricted.add(route);
						for (const candidates of routes.values()) candidates.add(route);
					} else for (const [type, match] of table) {
						let candidates = routes.get(type);
						if (candidates === void 0) {
							candidates = new Set(unrestricted);
							routes.set(type, candidates);
						}
						candidates.add({
							definition,
							match: match.bind(definition)
						});
					}
				}
				this.routes = routes;
				this.unrestricted = unrestricted;
				super.refresh();
			}
		};
		function assertDefinitionTarget(definition) {
			if (definition.target === void 0 !== (definition.buildViewNode === void 0)) throw new Error(`conversation Definition "${definition.kind}" must declare target and buildViewNode together`);
		}
