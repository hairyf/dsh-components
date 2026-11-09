// Extracted from @deepseek-ai/dsh-client-ui-creation-recommendations (lib/client.js); region lib/types/client/mount.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Register the personalized page card body and its localized copy. */
		/** Services the body registration needs; the shared card plugin provides `actionCards`. */
		const inject = ["locale", "actionCards"];
		/**
		* Register the `create_personalized_page` body for the plugin lifetime.
		* @param ctx - Client plugin context.
		*/
		function apply(ctx) {
			const infoDismissed = createCreationInfoStore();
			ctx.effect(() => ctx.locale.register("creationRecommendations", {
				en,
				zh,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "creation-recommendations: locale");
			ctx.effect(() => ctx.actionCards.register({
				action: "create_personalized_page",
				locale: "creationRecommendations",
				Body: (props) => (0, react.createElement)(PageCardBody, {
					...props,
					infoDismissed
				})
			}), "creation-recommendations: card body");
		}
