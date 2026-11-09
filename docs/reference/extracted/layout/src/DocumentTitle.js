// Extracted from @deepseek-ai/dsh-client-ui-layout (lib/client.js); region lib/types/client/DocumentTitle.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Browser title selection follows the active main panel without subscribing the frame. */
		/**
		* Project the selected durable session title into the browser title and
		* restore the build-selected product title when unmounted.
		* @param props - Selected session title projection.
		* @returns No rendered content.
		*/
		function DocumentTitle({ useSessions, usePanelInfo, productTitle }) {
			const showSessionTitle = usePanelInfo((info) => info.activePanelId === null);
			const title = useSessions((state) => {
				const current = Object.values(state.byId).find((session) => (session.retainedBy.mainView ?? 0) > 0)?.id;
				return !showSessionTitle || current === void 0 ? void 0 : state.byId[current]?.title;
			});
			(0, react.useEffect)(() => {
				document.title = title === void 0 ? productTitle : `${title} — ${productTitle}`;
				return () => {
					document.title = productTitle;
				};
			}, [productTitle, title]);
			return null;
		}
