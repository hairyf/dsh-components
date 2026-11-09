// Extracted from @deepseek-ai/dsh-client-ui-agent-preset (lib/client.js); region lib/types/client/CreatePluginMenuItem.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Create a plugin through the existing Creator flow from the Add plugin menu. */
/**
* Close the Add plugin menu before opening Creator without sending a message.
* @param props - locale, roster, dismissal and navigation callbacks.
* @returns a stable menu item that explains why Creator is unavailable.
*/
function CreatePluginMenuItem({ t, useAgentPresets, load, onDismiss, startCreatorDraft }) {
	const roster = useAgentPresets((state) => state);
	const enabled = roster.status === "ready" && roster.options.some((option) => option.id === "cordis");
	(0, react.useEffect)(() => {
		load();
	}, [load]);
	let description = t("createPluginDescription");
	if (roster.status === "idle" || roster.status === "loading") description = t("createPluginChecking");
	else if (roster.status === "error" || roster.status === "unavailable") description = t("createPluginUnavailable");
	else if (!enabled) description = t("createPluginMissing");
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
		icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconAgentPresetOutlineRegular, { size: 14 }),
		disabled: !enabled,
		onSelect: () => {
			onDismiss();
			startCreatorDraft();
		},
		children: (0, react_jsx_runtime.jsxs)("span", {
			className: CreatePluginMenuItem_module_css_default.copy,
			children: [(0, react_jsx_runtime.jsx)("span", { children: t("createPlugin") }), (0, react_jsx_runtime.jsx)("span", {
				className: CreatePluginMenuItem_module_css_default.description,
				title: description,
				children: description
			})]
		})
	});
}
