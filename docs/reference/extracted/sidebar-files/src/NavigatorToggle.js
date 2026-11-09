// Extracted from @deepseek-ai/dsh-client-ui-sidebar-files (lib/client.js); region lib/types/client/NavigatorToggle.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The navigator's show/hide control, at the end of a document preview's
		* header through its Factory; the `files` page's tree is always
		* shown and has none. It writes the pane's choice, which every file tab of
		* the pane reads, and registers itself with the face, which hands it the
		* keyboard when Escape closes the navigator.
		*/
		/**
		* Show or hide the pane's navigator.
		* @param props - the tab, the pane records, the face's registration, and copy.
		* @returns the toggle, or nothing without a workspace.
		*/
		function NavigatorToggle({ useTabInfo, sessionId, useSessions, useStore, actions, toggleDrawn, t }) {
			const { panel } = useTabInfo();
			const cwd = useSessions((sessions) => sessions.byId[sessionId]?.cwd);
			const open = useStore((store) => store.byPane[panel.id]?.open) === true;
			const toggleRef = (0, react.useCallback)((button) => {
				toggleDrawn(panel.id, button);
			}, [toggleDrawn, panel.id]);
			if (cwd === void 0) return null;
			const label = t(open ? "navigator.hide" : "navigator.show");
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label,
				side: "bottom",
				delayMs: 500,
				children: (0, react_jsx_runtime.jsx)("button", {
					ref: toggleRef,
					type: "button",
					className: FilesBody_module_css_default.tool,
					"aria-label": label,
					"aria-expanded": open,
					"data-files-navigator-toggle": true,
					onClick: () => {
						actions.shown(panel.id, !open);
					},
					children: open ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpenRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderCloseRegular, {})
				})
			});
		}
