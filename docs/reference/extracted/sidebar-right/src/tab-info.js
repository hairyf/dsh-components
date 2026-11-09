// Extracted from @deepseek-ai/dsh-client-ui-sidebar-right (lib/client.js); region lib/types/client/tab-info.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Bind a tab occurrence without subscribing or creating records during factory evaluation.
		* @param standard - framework session identity.
		* @param context - stable record lifetime and framework-bound readers.
		* @returns the tab information hook.
		*/
		const tabInfoFactory = (standard, context) => {
			const { sessionId } = standard;
			const { tabId, title, fullscreen, active, signal, actions, useStore, useTabNavigation, shortcuts } = context;
			return function useTabInfo() {
				const layout = useStore((state) => state.bySession[sessionId]?.layout);
				const navigation = useTabNavigation(tabId);
				return (0, react.useMemo)(() => {
					const tab = layout?.tabs[tabId];
					if (layout === void 0 || tab === void 0 || navigation === void 0) throw new Error(`sidebarRight: tab "${tabId}" is not committed in session "${sessionId}"`);
					const pane = (0, _deepseek_ai_dsh_client_ui_dockkit.findTabPane)(layout, tabId);
					return {
						sidebar: {
							expanded: layout.expanded,
							fullscreen
						},
						panel: {
							id: pane.id,
							isFloating: pane.host === "float"
						},
						tab: {
							...tab,
							visible: active && (pane.host === "float" || layout.expanded && (title || pane.activeTabId === tabId)),
							navigation,
							signal,
							actions,
							refreshShortcut: shortcuts.find((row) => row.id === "page.refresh")
						}
					};
				}, [
					layout,
					navigation,
					tabId,
					title,
					fullscreen,
					active,
					signal,
					actions,
					shortcuts
				]);
			};
		};
		/**
		* Forward the framework-bound tab hook to guide content.
		* @param _standard - the guide's framework standard props.
		* @param useTabInfo - the enclosing tab's framework-bound reader.
		* @returns the same reader for the replacement.
		*/
		const guideTabInfoFactory = (_standard, useTabInfo) => useTabInfo;
