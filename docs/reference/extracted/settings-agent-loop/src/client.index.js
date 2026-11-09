// Extracted from @deepseek-ai/dsh-client-ui-settings-agent-loop (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The agent loop's settings page, browser half: the parallel tool-call cap
		* over the `agent-loop` namespace the loop registers. The page registers into
		* the Plugins page's `plugins.item` slot while the Host serves that namespace,
		* so a deployment that exposes no agent-loop settings shows no trace of it.
		*/
		/** Dictionary namespace owned by this plugin. */
		const NS = "settings.agentLoop";
		/** Required services (cordis fiber inject). */
		const inject = [
			"slots",
			"locale",
			"configForms"
		];
		/**
		* Mount the agent loop's settings page while the Host serves its namespace.
		* @param ctx - the browser plugin context.
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
			}), "ui-settings-agent-loop: dictionaries");
			const t = ctx.locale.bind(NS);
			const card = new AgentLoopCardController(ctx.configForms.get(AGENT_LOOP_NS));
			ctx.effect(() => () => {
				card.dispose();
			}, "ui-settings-agent-loop: form subscription");
			ctx.effect(() => ctx.configForms.whileServed([AGENT_LOOP_NS], () => ctx.slots.inject("plugins.item", () => ctx.slots.register({
				name: "plugins.item",
				id: "agent-loop",
				order: 30,
				label: () => t("title"),
				locale: NS,
				inject: () => card.inject()
			}, AgentLoopCard))), "ui-settings-agent-loop: page");
		}
