// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/TextTitle.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* The title as the chip and a floating panel's header show it.
* @param props - the tab information hook.
* @returns the type's 16px sheet followed by the tab's title text.
*/
function TextTitle({ useTabInfo }) {
	const { tab } = useTabInfo();
	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
		kind: (0, _deepseek_ai_dsh_client_ui_primitives.classifyFileType)(tab.title),
		size: 16,
		className: TextPreview_module_css_default.titleIcon
	}), tab.title] });
}
