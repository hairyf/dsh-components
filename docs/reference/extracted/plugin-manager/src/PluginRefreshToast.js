// Extracted from @deepseek-ai/dsh-client-ui-plugin-manager (lib/client.js); region lib/types/client/PluginRefreshToast.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Display refresh failures even after navigation leaves the Plugins panel.
* @param props - shared notice hook, dismissal action, and locale seat.
* @returns the refresh failure toast, or null for other notices.
*/
function PluginRefreshToast({ usePluginManager, dismissNotice, t }) {
	const notice = usePluginManager((state) => state.notice);
	if (notice?.kind !== "refresh-failed") return null;
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
		text: noticeText(notice, t),
		icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
		onDone: dismissNotice
	}, notice.seq);
}
