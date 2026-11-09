// Extracted from @deepseek-ai/dsh-client-ui-settings-general (lib/client.js); region lib/types/client/SettingsDocumentAction.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Optional settings-header action for opening a file-backed Host document. */
/**
* Render the open-document action only after Host metadata confirms document availability.
* @param props - header owner props, localized copy, and injected document state.
* @returns the action, or null while unavailable or unresolved.
*/
function SettingsDocumentAction({ controller, useSnapshot, t }) {
	const state = useSnapshot((snapshot) => snapshot);
	(0, react.useEffect)(() => {
		controller.load();
	}, [controller]);
	if (state.status !== "ready") return null;
	return (0, react_jsx_runtime.jsxs)("div", {
		className: SettingsDocumentAction_module_css_default.action,
		children: [state.error === null ? null : (0, react_jsx_runtime.jsx)("span", {
			className: SettingsDocumentAction_module_css_default.error,
			role: "alert",
			children: t("openDocument.error")
		}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
			variant: "outline",
			size: "sm",
			disabled: state.opening,
			onClick: () => {
				controller.open();
			},
			children: t("openDocument")
		})]
	});
}
