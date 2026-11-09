// Extracted from @deepseek-ai/dsh-client-ui-plugin-recommendations (lib/client.js); region lib/types/client/mount.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Register the official plugin card body, its catalog-text Remote and its localized copy. */
		/** Services the body needs; the shared card plugin provides `actionCards`. */
		const inject = [
			"locale",
			"remote",
			"actionCards",
			"pluginNavigation"
		];
		/** Mount the catalog-text Remote, then register the body for the same plugin lifetime.
		* @param ctx - Client plugin context.
		* @param contribution - Generated Remote descriptors supplied by the built entry.
		* @returns disposer removing the body before the Remote contribution.
		*/
		async function mountRecommendations(ctx, contribution) {
			const unmount = await ctx.remote.$mount(contribution);
			const body = ctx.inject(["remote.pluginRecommendations"], registerBody);
			try {
				await body;
			} catch (error) {
				await body.dispose();
				await unmount();
				throw error;
			}
			return async () => {
				await body.dispose();
				await unmount();
			};
		}
		function registerBody(ctx) {
			const services = {
				catalog: (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({}),
				describe: async (sessionId, callId) => {
					const result = await ctx.remote.pluginRecommendations.describe(sessionId, callId);
					return result.ok ? result.value : void 0;
				},
				openDetails: (packageName) => {
					ctx.pluginNavigation.openBundle(packageName);
				},
				resolveText: (text) => ctx.locale.resolveText(text)
			};
			ctx.effect(() => ctx.locale.register("pluginRecommendations", {
				en,
				zh,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "plugin-recommendations: locale");
			ctx.effect(() => ctx.actionCards.register({
				action: "enable_official_plugin",
				locale: "pluginRecommendations",
				Body: (props) => (0, react.createElement)(PluginCardBody, {
					...props,
					...services
				})
			}), "plugin-recommendations: card body");
		}
