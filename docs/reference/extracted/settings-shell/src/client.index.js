// Extracted from @deepseek-ai/dsh-client-ui-settings-shell (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The shell executor's settings page, browser half: the command timeout and
		* the per-stream output cap over the `shell` namespace the executor
		* registers. The page registers into the Plugins page's `plugins.item` slot
		* while the Host serves that namespace, so a deployment without a local shell
		* executor shows no trace of it.
		*/
		/** Dictionary namespace owned by this plugin. */
		const NS = "settings.shell";
		/** Required services (cordis fiber inject). */
		const inject = [
			"slots",
			"locale",
			"configForms"
		];
		/**
		* Mount the shell settings page while the Host serves its namespace.
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
			}), "ui-settings-shell: dictionaries");
			const bash = new ShellCardController(ctx.configForms.get(BASH_NS));
			const pwsh = new ShellCardController(ctx.configForms.get(PWSH_NS));
			ctx.effect(() => () => {
				bash.dispose();
				pwsh.dispose();
			}, "ui-settings-shell: form subscriptions");
			ctx.effect(() => ctx.configForms.whileServed([BASH_NS, PWSH_NS], (served) => ctx.slots.inject("plugins.item", () => ctx.slots.register({
				name: "plugins.item",
				id: "shell",
				order: 40,
				label: () => t("title"),
				locale: NS,
				inject: () => (served.has("pwsh-sandbox") ? pwsh : bash).inject()
			}, ShellCard))), "ui-settings-shell: page");
		}
