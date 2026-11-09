// Extracted from @deepseek-ai/dsh-client-ui-sidebar-files (lib/client.js); region lib/types/client/FilesTitle.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* The title as the chip and a floating panel's header show it.
* @param props - the tab information hook.
* @returns the folder sheet followed by the tab's title text.
*/
function FilesTitle({ useTabInfo }) {
	const { tab } = useTabInfo();
	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
		kind: "folder",
		size: 16,
		className: FilesBody_module_css_default.titleIcon
	}), tab.title] });
}
