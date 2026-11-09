// Extracted from @deepseek-ai/dsh-client-ui-sidebar-right (lib/client.js); region lib/types/client/tab-registry.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		var import_posix = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
			module.exports = require_picomatch();
		})))(), 1);
		/** Rank of each band, highest first. */
		const RANKS = {
			extension: 3,
			builtin: 2,
			fallback: 1
		};
		/** The band a definition that names none is in. */
		const DEFAULT_BAND = "extension";
		/**
		* Whether a band may join a held kind: an `extension` and a `builtin` pair up
		* once, and a `fallback` shares its kind with nothing.
		*/
		function coexists(slot, band) {
			return band !== "fallback" && slot.inForce.band !== "fallback" && slot.inForce.band !== band && slot.shadowed === void 0;
		}
		/**
		* The address's URI path: what a pattern with no scheme separator matches
		* against. `dsh-resource://file/session/s1/home/me/b.md` gives `/session/s1/home/me/b.md`;
		* `sidebar://guide` gives `''`; an address that is not a URI gives nothing.
		*/
		function pathOf(address) {
			try {
				return new URL(address).pathname;
			} catch {
				return;
			}
		}
		/** Compile one declared pattern into the test the router runs. */
		function matcherFor(pattern) {
			const whole = pattern.includes(":");
			const match = (0, import_posix.default)(pattern, {
				nocase: true,
				dot: true,
				...whole ? {} : { basename: true }
			});
			return (address) => {
				if (whole) return match(address);
				const path = pathOf(address);
				return path !== void 0 && match(path);
			};
		}
		/**
		* The registered tab types.
		*
		* Registration order is part of the contract: it breaks ties between types that
		* recognize an address equally well.
		*/
		var SidebarRightTabRegistry = class {
			ctx;
			kinds = /* @__PURE__ */ new Map();
			ids = /* @__PURE__ */ new Set();
			listeners = /* @__PURE__ */ new Set();
			registrations = 0;
			cached = [];
			guideEntries = [];
			/** @param ctx - Context whose effects own the contributed types. */
			constructor(ctx) {
				this.ctx = ctx;
			}
			/**
			* Register one tab type for the caller's lifetime.
			*
			* The caller holds the returned disposer inside its own `ctx.effect`, so a
			* type's registration lives exactly as long as the plugin that contributed it.
			* An `extension` may register a kind a `builtin` already holds and takes it
			* over until it unregisters; a second registration in the same band, or any
			* registration meeting a `fallback` of the same kind, is a wiring mistake, and
			* so is an `id` already in use.
			* @param definition - the contributed type.
			* @returns idempotent disposer.
			* @throws when the id is taken, or the kind is already registered in a way this one cannot coexist with.
			*/
			register(definition) {
				const { id, kind } = definition;
				const entries = definition.guide ?? [];
				if (new Set(entries.map((entry) => entry.id)).size !== entries.length) throw new Error(`sidebarRight: duplicate guide entry id in "${id}"`);
				const band = definition.priority ?? DEFAULT_BAND;
				if (this.ids.has(id)) throw new Error(`sidebarRight: tab type id "${id}" is already registered`);
				const held = this.kinds.get(kind);
				if (held !== void 0 && !coexists(held, band)) throw new Error(`sidebarRight: tab kind "${kind}" is already registered (${held.inForce.band})`);
				this.registrations += 1;
				const entry = {
					definition,
					band,
					matchers: (definition.patterns ?? []).map((pattern) => ({
						pattern,
						test: matcherFor(pattern)
					})),
					order: this.registrations
				};
				const dispose = this.ctx.effect(() => {
					this.ids.add(id);
					const slot = this.enter(kind, entry);
					this.refresh();
					return () => {
						this.ids.delete(id);
						this.leave(kind, slot, entry);
						this.refresh();
					};
				}, `sidebarRight.tabs.register(${JSON.stringify(id)})`);
				return () => {
					dispose();
				};
			}
			/** Add a registration to its kind's slot, the higher band in force; `coexists` has already admitted it. */
			enter(kind, entry) {
				const held = this.kinds.get(kind);
				if (held === void 0) {
					const slot = {
						inForce: entry,
						shadowed: void 0
					};
					this.kinds.set(kind, slot);
					return slot;
				}
				if (RANKS[entry.band] > RANKS[held.inForce.band]) {
					held.shadowed = held.inForce;
					held.inForce = entry;
				} else held.shadowed = entry;
				return held;
			}
			/** Remove a registration from its kind's slot: a shadowed builtin resumes, and an emptied kind is freed. */
			leave(kind, slot, entry) {
				if (slot.inForce !== entry) slot.shadowed = void 0;
				else if (slot.shadowed === void 0) this.kinds.delete(kind);
				else {
					slot.inForce = slot.shadowed;
					slot.shadowed = void 0;
				}
			}
			/** Every kind's registration in force, in registration order. */
			active() {
				return [...this.kinds.values()].map((slot) => slot.inForce).sort((left, right) => left.order - right.order);
			}
			/**
			* Registered types in registration order.
			* @returns reference-stable entries.
			*/
			entries() {
				return this.cached;
			}
			/**
			* Every type in force's guide entries, in `order`, each naming the kind it opens.
			* @returns reference-stable entries.
			*/
			guide() {
				return this.guideEntries;
			}
			/**
			* The type in force for a kind.
			* @param kind - the type discriminator.
			* @returns the type, or `undefined` when nothing registered it.
			*/
			get(kind) {
				return this.kinds.get(kind)?.inForce.definition;
			}
			/**
			* Every type that would open an address, best first.
			*
			* Ranked by priority band, then by the length of the pattern that matched,
			* then by registration order. Types whose `canOpen` vetoes are absent.
			* @param address - the address a caller wants opened.
			* @returns the ranked types; empty when nothing recognizes the address.
			*/
			candidates(address) {
				const ranked = [];
				for (const { definition, band, matchers, order } of this.active()) {
					let length = -1;
					for (const matcher of matchers) if (matcher.test(address) && matcher.pattern.length > length) length = matcher.pattern.length;
					if (length < 0) continue;
					if (definition.canOpen !== void 0 && !definition.canOpen(address)) continue;
					ranked.push({
						definition,
						rank: RANKS[band],
						length,
						order
					});
				}
				ranked.sort((left, right) => right.rank - left.rank || right.length - left.length || left.order - right.order);
				return ranked.map((entry) => entry.definition);
			}
			/**
			* Decide which type opens an address, and as what.
			*
			* Without `kind`, the best candidate wins. With `kind`, that type opens the
			* address if its `canOpen` agrees — its globs are not consulted, because
			* naming the type IS the decision.
			*
			* An address no type will open is a wiring mistake, not a user error, so this
			* throws rather than reporting absence.
			* @param address - the address a caller wants opened.
			* @param kind - a type named by the caller, overriding the ranking.
			* @returns the claiming type and the record to open.
			*/
			claim(address, kind) {
				if (kind !== void 0) {
					const definition = this.get(kind);
					if (definition === void 0) throw new Error(`sidebarRight: no tab type is registered as "${kind}"`);
					if (definition.canOpen !== void 0 && !definition.canOpen(address)) throw new Error(`sidebarRight: tab type "${kind}" refuses "${address}"`);
					return {
						kind,
						contentId: address,
						title: definition.title(address)
					};
				}
				const [chosen] = this.candidates(address);
				if (chosen === void 0) throw new Error(`sidebarRight: no registered tab type claims "${address}"`);
				return {
					kind: chosen.kind,
					contentId: address,
					title: chosen.title(address)
				};
			}
			/**
			* Observe low-frequency registry changes.
			* @param listener - synchronous invalidation callback.
			* @returns unsubscribe callback.
			*/
			subscribe(listener) {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			}
			refresh() {
				this.cached = this.active().map((entry) => entry.definition);
				this.guideEntries = this.cached.flatMap((definition) => (definition.guide ?? []).map((entry) => ({
					...entry,
					kind: definition.kind,
					providerId: definition.id
				}))).sort((left, right) => left.order - right.order);
				(0, _deepseek_ai_dsh_client_store.notifySubscribers)(this.listeners, "[ui-sidebar-right] tab registry");
			}
		};
