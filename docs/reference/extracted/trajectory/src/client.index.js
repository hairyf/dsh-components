// Extracted from @deepseek-ai/dsh-client-ui-trajectory (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Required services: the conversation slot, registries, ordinary Session paging, and the locale service. */
		const inject = [
			"slots",
			"sessions",
			"uiSession",
			"uiConversation",
			"locale",
			"remote",
			"remote.toolResults"
		];
		/**
		* Client plugin body: register the trajectory view tab. The registration
		* rides the slot service's effect wrapper, so plugin unload removes the tab.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			const trajectorySources = /* @__PURE__ */ new WeakMap();
			const trajectorySource = (binding) => {
				let source = trajectorySources.get(binding);
				if (source === void 0) {
					const target = ctx.uiConversation.binding(binding).target("trajectory");
					source = {
						getSnapshot: () => target.getSnapshot() ?? EMPTY_TRAJECTORY_SNAPSHOT,
						subscribe: (listener) => target.subscribe(listener)
					};
					trajectorySources.set(binding, source);
				}
				return source;
			};
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-trajectory: dictionaries");
			const t = ctx.locale.bind(NS);
			const duration = createTrajectoryDurationStore();
			const stringWrapping = createTrajectoryStringWrappingStore();
			registerTrajectoryMessageDefinitions(ctx);
			registerTrajectoryRequestHeaderDefinition(ctx);
			registerTrajectoryAssistantDefinition(ctx);
			registerTrajectoryToolDefinition(ctx);
			registerTrajectoryCompactionDefinitions(ctx);
			registerTrajectoryConversationView(ctx);
			ctx.uiSession.provide({
				hooks: ["trajectory"],
				resolve: (binding) => ({ hooks: { trajectory: trajectorySource(binding) } })
			});
			ctx.slots.inject("conversation.view", () => ctx.slots.register({
				name: "conversation.view",
				id: "trajectory",
				order: 10,
				locale: NS,
				label: () => t("view.trajectory"),
				children: { "conversation.trajectory.images": {
					kind: "single",
					scope: "session"
				} },
				inject: (sessionId) => {
					const session = ctx.sessions.binding(sessionId)?.session;
					if (session === void 0) throw new Error(`ui-trajectory: session "${sessionId}" is unavailable`);
					const trajectory = ctx.uiConversation.binding(sessionId).target("trajectory");
					return {
						hooks: { duration },
						watchToolResult: createToolResultWatcher(ctx.remote, sessionId, (error) => {
							ctx.logger.warn("live tool result unavailable: %s", error);
						}),
						jsonStringWrapping: {
							getDefault: () => stringWrapping.getSnapshot(),
							setDefault: (value) => {
								stringWrapping.set(value);
							}
						},
						loadOlder: async () => {
							const before = trajectory.getSnapshot();
							await session.loadOlder();
							return trajectory.getSnapshot() !== before;
						},
						loadImage: Object.assign((attachment) => ctx.uiConversation.imageUrl(sessionId, attachment), { peek: (attachment) => ctx.uiConversation.peekImageUrl(sessionId, attachment) }),
						setActualDuration: (value) => {
							duration.set(value);
						}
					};
				}
			}, TrajectoryView));
		}
