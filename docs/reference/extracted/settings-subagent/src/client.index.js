// Extracted from @deepseek-ai/dsh-client-ui-settings-subagent (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The Subagent settings page, browser half: the delegation limits over the
		* `subagent` namespace and the models agents may choose over the
		* `subagent-model-selection` namespace, on one page with one save. The page
		* registers into the Plugins page's `plugins.item` slot while the Host serves
		* either namespace and shows the sections it serves.
		*/
		/** Dictionary namespace owned by this plugin. */
		const NS = "settings.subagent";
		/**
		* Namespace of the delegation limits. Spelled here rather than imported: a
		* client package must not depend on a Host package.
		*/
		const SUBAGENT_NS = "subagent";
		/** Required services (cordis fiber inject). */
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.session",
			"configForms"
		];
		/**
		* Mount the Subagent settings page while the Host serves either of its namespaces.
		* @param ctx - the browser plugin context.
		*/
		function apply(ctx) {
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-settings-subagent: dictionaries");
			const limits = new SubagentLimitsCardController(ctx.configForms.get(SUBAGENT_NS));
			ctx.effect(() => () => {
				limits.dispose();
			}, "ui-settings-subagent: limits form subscription");
			const models = new SubagentModelSelectionCardController(ctx.configForms.get(SUBAGENT_MODEL_SELECTION_NS), ctx);
			const limitsFace = limits.inject();
			const modelsFace = models.inject();
			ctx.effect(() => ctx.remote.$on("llm/adapters-updated", () => {
				models.refreshCatalog();
			}), "ui-settings-subagent: adapter invalidations");
			ctx.effect(() => ctx.remote.$on("settings/document-updated", () => {
				models.refreshCatalog();
			}), "ui-settings-subagent: settings invalidations");
			ctx.effect(() => ctx.on("connection/reset", () => {
				models.resetConnection();
			}), "ui-settings-subagent: connection generation");
			ctx.effect(() => () => {
				models.dispose();
			}, "ui-settings-subagent: model preference");
			ctx.effect(() => ctx.configForms.whileServed([SUBAGENT_NS, SUBAGENT_MODEL_SELECTION_NS], () => ctx.slots.inject("plugins.item", () => ctx.slots.register({
				name: "plugins.item",
				id: "subagent",
				order: 10,
				label: () => t("subagentTitle"),
				locale: NS,
				inject: () => subagentCardFace(limitsFace, modelsFace)
			}, SubagentCard))), "ui-settings-subagent: page");
		}
