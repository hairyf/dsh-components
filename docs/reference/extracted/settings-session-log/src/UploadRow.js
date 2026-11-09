// Extracted from @deepseek-ai/dsh-client-ui-settings-session-log (lib/client.js); region lib/types/client/UploadRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** General settings row and persistent shell notice for API log uploads. */
/**
* Render the accepted API upload state.
* @param props - settings hooks, writer and localized copy.
* @returns the bottom preference row.
*/
function UploadRow({ useUpload, useMutation, setEnabled, t }) {
	const upload = useUpload((value) => value);
	const busy = useMutation((value) => value.busy);
	return (0, react_jsx_runtime.jsxs)("div", {
		className: UploadRow_module_css_default.row,
		children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("div", {
			className: UploadRow_module_css_default.title,
			children: t("title")
		}), (0, react_jsx_runtime.jsx)("div", {
			className: UploadRow_module_css_default.description,
			children: t("description")
		})] }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
			checked: upload.value?.enabled === true,
			label: t("title"),
			disabled: busy || upload.status !== "ready" || !upload.writable,
			onChange: (enabled) => {
				setEnabled(enabled);
			}
		})]
	});
}
/**
* Keep the save outcome visible after settings closes.
* @param props - mutation hook, dismissal and localized copy.
* @returns the current toast, or nothing.
*/
function UploadToast({ useMutation, dismiss, t }) {
	const state = useMutation((value) => value);
	if (state.notice === null) return null;
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
		text: t(state.notice),
		onDone: dismiss,
		...state.notice === "saved" ? { tone: "success" } : {}
	}, state.sequence);
}
