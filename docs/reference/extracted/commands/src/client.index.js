// Extracted from @deepseek-ai/dsh-client-ui-commands (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Dictionary namespace owned by this plugin. */
		const NS = "command";
		/** Required services: the '/' source registry, session scopes, commands Remote, and locale registry. */
		const inject = [
			"inputTriggers",
			"sessions",
			"remote",
			"remote.commands",
			"locale"
		];
		/**
		* Mount the command service and its per-session popupSelect overlay.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-commands: dictionaries");
			ctx.plugin(CommandUiRuntime);
			ctx.inject([
				"slots",
				"commandUi",
				"sessions"
			], (scope) => {
				const command = scope.commandUi;
				const sessions = scope.get("sessions");
				scope.slots.inject("conversation.input.overlay", () => scope.slots.register({
					name: "conversation.input.overlay",
					id: "command-popup",
					order: 1,
					locale: NS,
					inject: (sessionId) => {
						const actx = sessions.scope(sessionId);
						if (actx === void 0) throw new Error(`ui-commands: session "${String(sessionId)}" resolved no scope`);
						return { popup: command.popupFor(actx) };
					}
				}, PopupSelectView));
			});
		}
