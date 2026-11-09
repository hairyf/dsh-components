// Extracted from @deepseek-ai/dsh-client-ui-settings-plugin-inventory (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Read-only Host plugin inventory registered into Web Settings. */
		/** Dictionary namespace owned by this plugin. */
		const NS = "settings.pluginInventory";
		/** Services required by the Settings registration and generated Remote face. */
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.pluginInventory",
			"modules"
		];
		/** Contribute the lazy inventory tab to the Plugins settings section. */
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
			}), "ui-settings-plugin-inventory: dictionaries");
			const t = ctx.locale.bind(NS);
			const list = async () => {
				const result = await ctx.remote.pluginInventory.list();
				if (!result.ok) throw new Error(`pluginInventory.list failed: ${result.error.code}: ${result.error.message}`);
				return result.value;
			};
			const agentPresetCopy = ctx.locale.bind("settings.agentPreset");
			const presetName = (preset) => presetDisplayText(preset, agentPresetCopy).name;
			const injected = () => ({
				list,
				presetName,
				resolveText: (text) => ctx.locale.resolveText(text),
				hooks: { clientSync: ctx.modules.entries.state },
				retryClient: () => {
					ctx.modules.entries.retry().catch((error) => {
						ctx.logger.error(error);
					});
				}
			});
			ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
				name: "settings.plugins.tab",
				id: "all",
				order: 10,
				label: () => t("tab"),
				locale: NS,
				inject: injected
			}, PluginInventorySettingsTab));
		}
