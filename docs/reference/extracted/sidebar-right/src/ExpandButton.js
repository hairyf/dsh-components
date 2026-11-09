// Extracted from @deepseek-ai/dsh-client-ui-sidebar-right (lib/client.js); region lib/types/client/shell/ExpandButton.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Opens a collapsed panel; when expanded, hides and disables on mobile devices and renders nothing on desktop devices. */
function ExpandButton({ sessionId, useStore, actions, t, useShortcuts }) {
	const shortcut = useShortcuts((entries) => entries.find((entry) => entry.id === "sidebar.right.toggle"));
	const expanded = useStore((state) => state.bySession[sessionId]?.layout.expanded ?? false);
	if (expanded && !(0, _deepseek_ai_dsh_client_ui_primitives.isMobileDevice)()) return null;
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
		label: t("chrome.expand"),
		shortcutKeys: shortcut?.keys,
		side: "bottom",
		delayMs: 500,
		disabled: expanded,
		children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
			size: "sm",
			className: clsx(ExpandButton_module_css_default.button, expanded && ExpandButton_module_css_default.expanded),
			disabled: expanded,
			"aria-label": t("chrome.expandAria"),
			"aria-keyshortcuts": shortcut?.aria,
			"data-sidebar-right-expand": true,
			onClick: () => {
				actions.setExpanded(sessionId, true);
			},
			children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPanelLeftOutlineRegular, { className: ExpandButton_module_css_default.icon })
		})
	});
}
