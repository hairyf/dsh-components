// Extracted from @deepseek-ai/dsh-client-ui-goal (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Dictionary namespace owned by this plugin. */
		const NS = "goal";
		/** Required services for the Goal dock, command-input projection, Remote mutations, and copy. */
		const inject = [
			"slots",
			"sessions",
			"remote",
			"remote.goals",
			"locale",
			"uiConversation"
		];
		/**
		* Client plugin body: the GoalBar dock entry with its mutation verbs.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.uiConversation.events.register(goalCommandInputDefinition);
			ctx.uiConversation.userText.register(goalCommandReferenceRule);
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-goal: dictionaries");
			ctx.slots.inject("conversation.user.text.node", () => ctx.slots.register({
				name: "conversation.user.text.node",
				key: "command",
				priority: 100
			}, GoalCommandReference));
			ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
				name: "conversation.chat.node",
				key: "command-input",
				locale: NS
			}, GoalCommandInputView));
			const sessions = ctx.sessions;
			/** The session's current projected CAS ref, read at verb call time (no staleness fence: the RPC's CAS is the guard). */
			const refOf = (sessionId) => {
				const projection = (sessions.binding(sessionId)?.session.projections.faceOf("goal"))?.getSnapshot();
				if (projection == null) return void 0;
				return {
					id: projection.goal.id,
					revision: projection.goal.revision
				};
			};
			const noCurrentGoal = {
				ok: false,
				error: {
					code: "no-current-goal",
					message: "no current goal to mutate"
				}
			};
			ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "goal",
				order: 10,
				locale: NS,
				inject: (sessionId) => {
					const binding = sessions.binding(sessionId);
					if (binding === void 0) throw new Error(`ui-goal: session "${sessionId}" is unavailable`);
					return {
						hooks: { goalActivation: createGoalActivationSource({
							projection: binding.session.projections.faceOf("goal"),
							session: binding.session,
							getGoal: async () => {
								if (sessions.binding(sessionId) !== binding) throw new Error(`ui-goal: session "${sessionId}" is unavailable`);
								return sessions.using(sessionId, { source: "goalActivation" }, async (reference) => {
									const state = reference.binding.session.getSnapshot();
									if (state.openState !== "open") throw state.openError ?? /* @__PURE__ */ new Error(`session "${sessionId}" is not open`);
									return ctx.remote.goals.get(sessionId);
								});
							},
							subscribeActivation: (listener) => ctx.remote.$on("goal/activation-changed", (event) => {
								if (event.sessionId === sessionId) listener(event.goal);
							}),
							subscribeReset: (listener) => ctx.on("connection/reset", listener)
						}) },
						onEdit: async (objective) => {
							const ref = refOf(sessionId);
							if (ref === void 0) return noCurrentGoal;
							return await ctx.remote.goals.edit(sessionId, ref, { objective });
						},
						onPause: async () => {
							const ref = refOf(sessionId);
							if (ref === void 0) return noCurrentGoal;
							return await ctx.remote.goals.pause(sessionId, ref);
						},
						onResume: async () => {
							const ref = refOf(sessionId);
							if (ref === void 0) return noCurrentGoal;
							return await ctx.remote.goals.resume(sessionId, ref);
						},
						onClear: async () => {
							const ref = refOf(sessionId);
							if (ref === void 0) return noCurrentGoal;
							return await ctx.remote.goals.clear(sessionId, ref);
						}
					};
				}
			}, GoalDock));
		}
