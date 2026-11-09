// Extracted from @deepseek-ai/dsh-client-ui-sidebar-right (lib/client.js); region lib/types/client/contract/seed.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Resolve the default page from the registered entry count.
		* @param tabs - current tab registry.
		* @returns the sole entry, or the guide when there are zero or multiple entries.
		*/
		function defaultSeed(tabs) {
			const [only, ...others] = tabs.guide();
			const kind = only !== void 0 && others.length === 0 ? only.kind : GUIDE_KIND;
			const definition = tabs.get(kind);
			if (definition === void 0) throw new Error(`sidebarRight: default tab kind "${kind}" is not registered`);
			return {
				kind,
				title: definition.title(pageAddress(kind))
			};
		}
		/** The guide tab's kind. */
		const GUIDE_KIND = "guide";
		/**
		* The address a page tab is recorded under: `sidebar://<kind>`. The scheme is
		* this package's bookkeeping for `openTab`, spelled here and nowhere else; a
		* caller names the kind and never sees or composes the address.
		* @param kind - the page type's kind.
		* @returns the page's address.
		*/
		function pageAddress(kind) {
			return `sidebar://${kind}`;
		}
