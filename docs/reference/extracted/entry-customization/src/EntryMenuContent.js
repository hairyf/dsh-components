// Extracted from @deepseek-ai/dsh-client-ui-entry-customization (lib/client.js); region lib/types/client/EntryMenuContent.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Folded Conversation Views, plugin discovery while reachable, and creation. */
/**
* Render folded Conversation Views followed by discovery and Creator actions, without pin controls.
* @param props - Owner dismissal callback, injected actions, and localized copy.
* @returns Menu rows for the region's More menu.
*/
function EntryMenuContent({ entries, onOpen, region, onDismiss, usePluginNavigation, browsePlugins, createPlugin, t }) {
	const moreEntries = region === "conversation" ? entries : [];
	const browsable = usePluginNavigation((present) => present);
	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		moreEntries.map((entry) => (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
			current: entry.active === true,
			onSelect: () => {
				onDismiss();
				onOpen(entry.id);
			},
			children: (0, react_jsx_runtime.jsxs)("span", {
				className: EntryMenu_module_css_default.entryName,
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: EntryMenu_module_css_default.entryTitle,
					children: entry.label
				}), entry.active === true && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, {
					size: 16,
					className: EntryMenu_module_css_default.activeMark
				})]
			})
		}, entry.id)),
		browsable && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
			separatorBefore: moreEntries.length > 0,
			icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPluginPinwheelOutlineRegular, { size: 16 }),
			onSelect: () => {
				onDismiss();
				browsePlugins();
			},
			children: t("install")
		}),
		(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
			icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 16 }),
			separatorBefore: !browsable && moreEntries.length > 0,
			onSelect: () => {
				onDismiss();
				createPlugin();
			},
			children: t("create")
		})
	] });
}
