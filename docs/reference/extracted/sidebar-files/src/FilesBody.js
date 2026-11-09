// Extracted from @deepseek-ai/dsh-client-ui-sidebar-files (lib/client.js); region lib/types/client/FilesBody.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The `files` page: a file browser with no file chosen yet.
		*
		* Its header spans the page: the workspace root's path, the tree's reload and
		* the directory actions, in the order a preview's header ends with its own
		* reload and file actions. The pane's navigator fills the page below it and
		* stays shown, so the page draws no toggle; picking a file leaves this page as
		* it is and opens the file where the right Sidebar places it by default
		* (`FileNavigator`).
		*/
		/**
		* The `files` page body.
		* @param props - composed slot props.
		* @returns the header above the pane's navigator, or the workspace line.
		*/
		function FilesBody(props) {
			const { useTabInfo, sessionId, useSessions, useStore, refresh, setAutoRefresh, renderSlot, renderFactorySlot, t, useContextMenu } = props;
			const { tab, panel } = useTabInfo();
			const { getTriggerProps } = useContextMenu();
			const onOpen = (0, react.useCallback)((address) => {
				if (panel.isFloating) tab.actions.openResource(address);
				else tab.actions.openResource(address, { paneId: panel.id });
			}, [
				tab.actions,
				panel.id,
				panel.isFloating
			]);
			(0, react.useEffect)(() => tab.actions.bindCommands({ refresh: () => {
				refresh(panel.id);
			} }), [
				tab.actions,
				panel.id,
				refresh
			]);
			const cwd = useSessions((sessions) => sessions.byId[sessionId]?.cwd);
			const autoRefresh = useStore((store) => {
				const tree = store.byPane[panel.id]?.tree;
				return tree?.root === cwd ? tree?.autoRefresh : void 0;
			});
			if (cwd === void 0) return (0, react_jsx_runtime.jsx)("div", {
				className: FilesBody_module_css_default.status,
				"data-files-state": "no-workspace",
				children: (0, react_jsx_runtime.jsx)("p", {
					className: FilesBody_module_css_default.statusLine,
					children: t("noWorkspace")
				})
			});
			const automatic = autoRefresh ?? true;
			const navigator = renderFactorySlot("sidebar.files.navigator", {
				useTabInfo,
				page: true,
				onOpen
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: FilesBody_module_css_default.page,
				"data-files-page": true,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: FilesBody_module_css_default.header,
					children: [
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.PathLabel, {
							path: cwd,
							className: FilesBody_module_css_default.path,
							"data-files-path": true,
							...getTriggerProps({
								kind: "directory",
								value: {
									sessionId,
									path: cwd
								}
							})
						}),
						(0, react_jsx_runtime.jsx)("span", {
							hidden: true,
							children: (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: FilesBody_module_css_default.tool,
								"aria-label": t("autoRefresh"),
								"aria-pressed": automatic,
								disabled: autoRefresh === void 0,
								"data-files-auto-refresh": true,
								title: t(automatic ? "autoRefresh.disable" : "autoRefresh.enable"),
								onClick: () => {
									setAutoRefresh(panel.id, !automatic);
								},
								children: automatic ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPauseOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlayOutlineRegular, {})
							})
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
							label: t("reload"),
							shortcutKeys: tab.refreshShortcut?.keys,
							side: "bottom",
							delayMs: 500,
							children: (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: FilesBody_module_css_default.tool,
								"aria-label": t("reload"),
								"aria-keyshortcuts": tab.refreshShortcut?.aria,
								"data-files-reload": true,
								onClick: () => {
									refresh(panel.id);
								},
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, {})
							})
						}),
						renderSlot("sidebar.right.tab.files.actions", { absolutePath: cwd })
					]
				}), (0, react_jsx_runtime.jsx)("div", {
					className: FilesBody_module_css_default.content,
					"data-files-content": true,
					children: navigator
				})]
			});
		}
