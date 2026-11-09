// Extracted from @deepseek-ai/dsh-client-ui-sidebar-right (lib/client.js); region lib/types/client/tabs/guide/GuideMoreIcon.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Designer-supplied artwork used only by the right-sidebar More tools card. */
		/**
		* Render the More tools glyph at its authored size and ink.
		* @returns Decorative 22px More tools artwork.
		*/
		function GuideMoreIcon() {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: "22",
				height: "22",
				viewBox: "0 0 22 22",
				fill: "none",
				xmlns: "http://www.w3.org/2000/svg",
				stroke: "#A6B2C7",
				strokeWidth: "1.38181",
				"aria-hidden": "true",
				focusable: "false",
				children: [
					(0, react_jsx_runtime.jsx)("path", { d: "M5.45873 5.04102H7.90157C8.57615 5.04102 9.123 5.58787 9.123 6.26244V8.70528C9.123 9.37986 8.57615 9.92671 7.90157 9.92671H5.45873C4.78415 9.92671 4.2373 9.37986 4.2373 8.70528V6.26244C4.2373 5.58787 4.78415 5.04102 5.45873 5.04102Z" }),
					(0, react_jsx_runtime.jsx)("path", { d: "M5.45873 12.9805H7.90157C8.57615 12.9805 9.123 13.5273 9.123 14.2019V16.6447C9.123 17.3193 8.57615 17.8662 7.90157 17.8662H5.45873C4.78415 17.8662 4.2373 17.3193 4.2373 16.6447V14.2019C4.2373 13.5273 4.78415 12.9805 5.45873 12.9805Z" }),
					(0, react_jsx_runtime.jsx)("path", { d: "M13.3992 12.9805H15.842C16.5166 12.9805 17.0634 13.5273 17.0634 14.2019V16.6447C17.0634 17.3193 16.5166 17.8662 15.842 17.8662H13.3992C12.7246 17.8662 12.1777 17.3193 12.1777 16.6447V14.2019C12.1777 13.5273 12.7246 12.9805 13.3992 12.9805Z" }),
					(0, react_jsx_runtime.jsx)("path", { d: "M15.0692 3.86523V6.91879M15.0692 6.91879V9.97235M15.0692 6.91879H12.0156M15.0692 6.91879H18.1227" })
				]
			});
		}
		const NO_CARDS = [];
		/**
		* Pin identity of one guide card; the kind survives an extension taking over that kind.
		* @param entry - Guide card from the tab registry.
		* @returns `kind:id`.
		*/
		function guideEntryId(entry) {
			return `${entry.kind}:${entry.id}`;
		}
		/**
		* Create the in-memory guide pin list; the snapshot keeps its reference until the list changes.
		* @returns Unpinned card ids and the pin mutation.
		*/
		function createGuidePins() {
			const store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({ unpinned: NO_CARDS });
			return {
				unpinned: {
					getSnapshot: () => store.getSnapshot().unpinned,
					subscribe: (listener) => store.subscribe(listener)
				},
				setPinned: (id, pinned) => {
					const current = store.getSnapshot().unpinned;
					if (id.startsWith(`files:`) || pinned !== current.includes(id)) return;
					store.set({ unpinned: pinned ? current.filter((entry) => entry !== id) : [...current, id] });
				}
			};
		}
