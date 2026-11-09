// Extracted from @deepseek-ai/dsh-client-ui-entry-customization (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Services used by the menu rows' footer actions; the optional `pluginNavigation` shows the discovery row while present. */
		const inject = [
			"slots",
			"locale",
			"uiWorkspace"
		];
		/**
		* Register the same menu rows into each region's More menu.
		* @param ctx - Browser context with slot, locale, and Workspace services, and the optional plugin navigation.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register("entryCustomization", {
				en,
				zh,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}));
			const t = ctx.locale.bind("entryCustomization");
			const pluginNavigation = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(false);
			ctx.inject(["pluginNavigation"], (scope) => {
				scope.effect(() => {
					pluginNavigation.set(true);
					return () => {
						pluginNavigation.set(false);
					};
				}, "entry-customization: plugin navigation presence");
			});
			const injected = (region) => ({
				region,
				hooks: { pluginNavigation },
				browsePlugins: () => {
					ctx.get("productAnalytics")?.track("more_menu_item_click", {
						region,
						action: "browse_plugins"
					});
					ctx.get("pluginNavigation")?.openList();
				},
				createPlugin: () => {
					ctx.get("productAnalytics")?.track("more_menu_item_click", {
						region,
						action: "create_plugin"
					});
					ctx.uiWorkspace.startSession(void 0, {
						agentPreset: "cordis",
						prompt: t(`createPrompt.${region}`),
						whenDraftExists: "append"
					});
				}
			});
			ctx.slots.inject("sidebar.panellist.actions", () => ctx.slots.register({
				name: "sidebar.panellist.actions",
				id: "entry-customization",
				locale: "entryCustomization",
				inject: () => injected("sidebar")
			}, EntryMenuContent));
			ctx.slots.inject("conversation.session.header.views.actions", () => ctx.slots.register({
				name: "conversation.session.header.views.actions",
				id: "entry-customization",
				locale: "entryCustomization",
				inject: () => injected("conversation")
			}, EntryMenuContent));
			ctx.slots.inject("sidebar.right.tab.guide.actions", () => ctx.slots.register({
				name: "sidebar.right.tab.guide.actions",
				id: "entry-customization",
				locale: "entryCustomization",
				inject: () => injected("rightbar")
			}, EntryMenuContent));
		}
