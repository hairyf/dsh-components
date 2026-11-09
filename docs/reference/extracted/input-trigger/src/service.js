// Extracted from @deepseek-ai/dsh-client-ui-input-trigger (lib/client.js); region lib/types/client/service.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* InputTriggerService (`ctx.inputTriggers`): the root half of the trigger pipeline — the
		* stateless source registry plus the per-session controller map. Every piece
		* of mutable interaction state (hit, menu, fetch) lives on the
		* {@link InputTriggerController}; the service only registers sources, resolves
		* controllers by session scope, and relays roster changes.
		*/
		/** The `ctx.inputTriggers` trigger pipeline service (root registry + controller resolution). */
		var InputTriggerService = class extends _deepseek_ai_cordis.Service {
			static inject = ["sessions"];
			live = {
				sources: [],
				controllers: new WeakMapWithValues()
			};
			/**
			* @param ctx - owning root context (the service registers itself as `slash`).
			*/
			constructor(ctx) {
				super(ctx, "inputTriggers");
				ctx.on("locale/change", () => {
					for (const controller of this.live.controllers.values) controller.refreshOpenMenu();
				});
			}
			/**
			* Register one trigger source. Live session controllers are notified so a
			* source arriving after scope birth still warms and joins the lexicon.
			* @param src - the source; (trigger, name) must be unique — duplicates throw.
			* @returns the disposer (callers wrap registration in ctx.effect). Disposal
			* while a controller shows the source's menu group drops that group.
			*/
			registerSource(src) {
				const { live } = this;
				if (live.sources.some((s) => s.trigger === src.trigger && s.name === src.name)) throw new Error(`slash source "${src.trigger}${src.name}" is already registered`);
				live.sources.push(src);
				for (const controller of live.controllers.values) try {
					controller.sourceAdded(src);
				} catch (error) {
					console.error(`[ui-input-trigger] source "${src.trigger}${src.name}" late-registration setup failed:`, error);
				}
				return () => {
					const at = live.sources.indexOf(src);
					if (at < 0) return;
					live.sources.splice(at, 1);
					for (const controller of live.controllers.values) controller.sourceRemoved(src);
				};
			}
			/**
			* Resolve the per-session controller for one session scope (lazy; the
			* scope disposer removes and disposes it). Construction warms the source
			* roster once — sessions are always agent-backed, so scope birth is the
			* single prewarm moment.
			* @param actx - session-scope ctx.
			* @returns the resident controller.
			* @throws when the Context no longer belongs to a retained Session generation.
			*/
			sessionOf(actx) {
				const sessions = this.sessions();
				const session = sessions.sessionOf(actx);
				const binding = session === void 0 ? void 0 : sessions.binding(session.sessionId);
				if (binding === void 0 || binding.session !== session) throw new Error("slash.sessionOf requires a retained Session scope");
				const id = binding.sessionId;
				const { live } = this;
				const existing = live.controllers.get(binding);
				if (existing !== void 0) return existing;
				const controller = new InputTriggerController({
					actx: binding.ctx,
					sessionId: id,
					roster: {
						sources: (trigger) => live.sources.filter((s) => s.trigger === trigger).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
						all: () => live.sources
					}
				});
				live.controllers.set(binding, controller);
				binding.ctx.effect(() => () => {
					controller.dispose();
					live.controllers.delete(binding);
				}, "slash: session controller");
				return controller;
			}
			sessions() {
				const sessions = this.ctx.get("sessions");
				if (sessions === void 0) throw new Error("ui-input-trigger: sessions service unavailable");
				return sessions;
			}
		};
