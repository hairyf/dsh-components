// Extracted from @deepseek-ai/dsh-client-ui-plan (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Dictionary namespace owned by this plugin. */
		const NS = "plan";
		/** Services for plan controls, Conversation projection, and resource navigation. */
		const inject = [
			"slots",
			"remote",
			"remote.commands",
			"remote.session",
			"sessions",
			"locale",
			"uiConversation",
			"resources",
			"sidebarRight",
			"sidebarRightTabs"
		];
		/**
		* Register plan controls, permanent Chat cards, and sidebar document reading.
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
			}), "ui-plan: dictionaries");
			const previewId = "@deepseek-ai/dsh-client-ui-plan";
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.uiConversation.events.register(planDefinition), "ui-plan: conversation definition");
			ctx.effect(() => ctx.resources.register(planResourceProvider(ctx.remote.session)), "ui-plan: resources");
			ctx.effect(() => ctx.sidebarRightTabs.register({
				id: previewId,
				kind: "plan",
				patterns: ["dsh-resource://plan/**", "dsh-resource://plan-review/**"],
				priority: "builtin",
				canOpen: (address) => parsePlanAddress(address) !== void 0 || isReviewPreviewAddress(address),
				title: () => t("preview.title")
			}), "ui-plan: sidebar type");
			const open = (sessionId) => ({ openPlan: (callId) => {
				const child = ctx.sessions.subagentAddress(sessionId);
				const session = child === void 0 ? {
					kind: "session",
					sessionId
				} : {
					kind: "subagent",
					...child
				};
				ctx.sidebarRight.openResource(planAddress({
					session,
					callId
				}));
			} });
			const reviewWindow = randomUUID();
			const reviewStore = createPlanReviewStore();
			ctx.slots.inject("conversation.chat.turnTail", () => ctx.slots.register({
				name: "conversation.chat.turnTail",
				id: previewId,
				locale: NS,
				inject: (sessionId) => {
					const binding = ctx.sessions.binding(sessionId);
					if (binding === void 0) throw new Error(`ui-plan: unknown session "${sessionId}"`);
					const chat = ctx.uiConversation.binding(binding).target("chat");
					return {
						...open(sessionId),
						keyedHooks: { plans: (turn) => {
							const snapshot = chat.getSnapshot();
							if (snapshot === void 0) throw new Error("ui-plan: Chat target is unavailable");
							return snapshot.nodes.turnDataSource(Number(turn), "submitted-plan");
						} }
					};
				}
			}, PlanCards));
			ctx.slots.inject("conversation.plan-review.actions", () => ctx.slots.register({
				name: "conversation.plan-review.actions",
				id: previewId,
				locale: NS,
				store: reviewStore,
				inject: (sessionId) => ({
					openReview: (review, requestKey) => {
						if (review.callId !== void 0) {
							open(sessionId).openPlan(review.callId);
							return;
						}
						ctx.sidebarRight.openResource(reviewPreviewAddress(sessionId, `${reviewWindow}:${requestKey}`), { params: { planReview: {
							markdown: review.plan,
							title: (0, _deepseek_ai_dsh_client_ui_primitives.extractMarkdownPlainText)(review.plan, { mode: "first-line" })
						} } });
					},
					hooks: { sidebarMounted: ctx.sidebarRight.mounted }
				})
			}, PlanReviewOpen));
			ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
				name: "sidebar.right.pane.tab",
				key: previewId,
				locale: NS
			}, PlanPreview));
			ctx.slots.inject("sidebar.right.pane.tab.title", () => ctx.slots.register({
				name: "sidebar.right.pane.tab.title",
				key: previewId
			}, PlanTitle));
			ctx.slots.inject("conversation.input.plan", () => ctx.slots.register({
				name: "conversation.input.plan",
				locale: NS,
				inject: (sessionId) => ({ exitPlanMode: async () => {
					const result = await ctx.remote.commands.execute(sessionId, "/plan off", []);
					if (!result.ok) return `${result.error.message} (${result.error.code})`;
					if (result.value === void 0) return "unknown command: /plan off";
					return null;
				} })
			}, PlanChip));
		}
