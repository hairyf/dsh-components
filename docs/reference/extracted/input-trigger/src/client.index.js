// Extracted from @deepseek-ai/dsh-client-ui-input-trigger (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Namespace owning the candidate-menu copy. */
		const MENU_NS = "slash.menu";
		/** Required services: controller resolution reads the session scope tree; the menu copy is localized. */
		const inject = ["sessions", "locale"];
		/**
		* Client plugin body: mount the service, then register MenuView into the
		* input overlay once its declarer is up.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.plugin(InputTriggerService);
			ctx.effect(() => ctx.locale.register(MENU_NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-input-trigger: menu dictionaries");
			ctx.inject([
				"slots",
				"inputTriggers",
				"sessions"
			], (scope) => {
				const inputTriggers = scope.inputTriggers;
				const sessions = scope.sessions;
				scope.slots.inject("conversation.input.overlay", () => scope.slots.register({
					name: "conversation.input.overlay",
					id: "slash-menu",
					order: 0,
					locale: MENU_NS,
					inject: (sessionId) => {
						const actx = sessions.scope(sessionId);
						if (actx === void 0) throw new Error(`ui-input-trigger: session "${String(sessionId)}" resolved no scope`);
						const controller = inputTriggers.sessionOf(actx);
						return {
							menu: controller.menu,
							headers: controller.headers,
							onPick: (source, index, action) => {
								controller.pick(source, index, action);
							},
							onCrumb: (source, index) => {
								controller.pickCrumb(source, index);
							},
							onHover: (source, index) => {
								controller.hover(source, index);
							},
							onDismiss: () => {
								controller.dismiss();
							}
						};
					}
				}, MenuView));
			});
		}
