// Extracted from @deepseek-ai/dsh-client-ui-sidebar (lib/client.js); region lib/types/client/HeaderLeadingControls.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Window-chrome controls for the fully hidden sidebar (frame shell.leading seat). */
		/**
		* Sidebar-open and New Session controls in the frame's window-chrome seat.
		* The frame mounts this seat for hidden sidebars and owns its placement.
		* Web shows only the sidebar opener; Desktop also retains New Session.
		* @param props - Injected sidebar actions, the global access Hook, and the sidebar locale seat.
		* @returns the sidebar toggle, plus New Session on Desktop while access allows `session/create`.
		*/
		function HeaderLeadingControls({ toggleSidebar, startSession, trackEntryClick, useRemoteAccess, useShortcuts, t }) {
			const canStartSession = useRemoteAccess("session/create");
			const desktop = document.documentElement.hasAttribute("data-platform");
			const shortcut = useShortcuts((rows) => rows.find((row) => row.id === "sidebar.left.toggle"));
			const newShortcut = useShortcuts((rows) => rows.find((row) => row.id === "session.new"));
			return (0, react_jsx_runtime.jsxs)("div", {
				className: HeaderLeadingControls_module_css_default.controls,
				children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label: t("toggle.open"),
					shortcutKeys: shortcut?.keys,
					delayMs: 500,
					children: (0, react_jsx_runtime.jsx)("button", {
						"data-sidebar-opener": true,
						type: "button",
						className: HeaderLeadingControls_module_css_default.iconButton,
						"aria-label": t("toggle.open"),
						"aria-keyshortcuts": shortcut?.aria,
						onClick: () => {
							toggleSidebar();
						},
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPanelLeftOutlineRegular, { size: 16 })
					})
				}), desktop && canStartSession && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label: t("session.new.label"),
					shortcutKeys: newShortcut?.keys,
					delayMs: 500,
					children: (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: HeaderLeadingControls_module_css_default.iconButton,
						"aria-label": t("session.new.label"),
						"aria-keyshortcuts": newShortcut?.aria,
						onClick: () => {
							trackEntryClick({
								menu_name: "new_session",
								position: "titlebar"
							});
							startSession();
						},
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconNewChatOutlineRegular, { size: 16 })
					})
				})]
			});
		}
