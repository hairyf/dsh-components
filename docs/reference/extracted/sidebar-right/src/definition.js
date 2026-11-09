// Extracted from @deepseek-ai/dsh-client-ui-sidebar-right (lib/client.js); region lib/types/client/tabs/guide/definition.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** The shipped guide implementation's identity: the key its body registers under. */
		const GUIDE_ID = "@deepseek-ai/dsh-client-ui-sidebar-right/guide";
		/**
		* The guide type's registry definition.
		*
		* A page type: it recognizes no resource address, because a guide views
		* nothing, and is opened by kind; `builtin` is the ordinary band for a type
		* shipped here.
		* @param t - namespace-bound translate, read fresh on every title call.
		* @returns the definition to register.
		*/
		function guideDefinition(t) {
			return {
				id: GUIDE_ID,
				kind: GUIDE_KIND,
				priority: "builtin",
				title: () => t("tab.guide.title")
			};
		}
