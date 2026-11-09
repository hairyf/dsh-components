// Extracted from @deepseek-ai/dsh-client-ui-action-cards (lib/client.js); region lib/types/client/registry.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Card bodies registered by action kind for the shared card frame. */
		/** Card bodies by action; the frame renders a dismiss-only fallback for an action without one. */
		var ActionCardRegistry = class {
			ctx;
			bodies = /* @__PURE__ */ new Map();
			listeners = /* @__PURE__ */ new Set();
			/** Current bodies by action; the snapshot changes on every registration change. */
			source = {
				getSnapshot: () => this.bodies,
				subscribe: (listener) => {
					this.listeners.add(listener);
					return () => {
						this.listeners.delete(listener);
					};
				}
			};
			/** @param ctx - Context whose effects own registered bodies. */
			constructor(ctx) {
				this.ctx = ctx;
			}
			/**
			* Register one kind's body. The caller holds the returned disposer inside its own `ctx.effect`, so the body
			* lives exactly as long as the plugin that contributed it.
			* @param descriptor - the kind's action, locale namespace and body.
			* @returns idempotent disposer.
			* @throws when another body already serves the action.
			*/
			register(descriptor) {
				const { action, locale, Body } = descriptor;
				const body = {
					locale,
					render: (props, t) => (0, react.createElement)(Body, {
						...props,
						t
					})
				};
				const dispose = this.ctx.effect(() => {
					if (this.bodies.has(action)) throw new Error(`action-cards: a body for "${action}" is already registered`);
					this.publish(new Map([...this.bodies, [action, body]]));
					return () => {
						const next = new Map(this.bodies);
						next.delete(action);
						this.publish(next);
					};
				}, `action-cards: body ${action}`);
				return () => {
					dispose();
				};
			}
			publish(bodies) {
				this.bodies = bodies;
				for (const listener of [...this.listeners]) listener();
			}
		};
