// Extracted from @deepseek-ai/dsh-client-ui-settings-general (lib/client.js); region lib/types/client/DeveloperToolsRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** General Settings control for shared developer-tool visibility and previews. */
/**
* Render the developer-tool toggle.
* @param props - accepted preference, writer and localized copy.
* @returns the General Settings row.
*/
function DeveloperToolsRow({ useDeveloperTools, setEnabled, t }) {
	const enabled = useDeveloperTools((value) => value);
	const [busy, setBusy] = (0, react.useState)(false);
	const [failed, setFailed] = (0, react.useState)(false);
	return (0, react_jsx_runtime.jsxs)("div", {
		className: DeveloperToolsRow_module_css_default.row,
		children: [(0, react_jsx_runtime.jsxs)("div", { children: [
			(0, react_jsx_runtime.jsx)("div", {
				className: DeveloperToolsRow_module_css_default.title,
				children: t("developerTools.title")
			}),
			(0, react_jsx_runtime.jsx)("div", {
				className: DeveloperToolsRow_module_css_default.description,
				children: t("developerTools.description")
			}),
			failed && (0, react_jsx_runtime.jsx)("div", {
				role: "alert",
				children: t("developerTools.error")
			})
		] }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
			checked: enabled,
			disabled: busy,
			label: t("developerTools.title"),
			onChange: (next) => {
				setFailed(false);
				setBusy(true);
				setEnabled(next).catch(() => {
					setFailed(true);
				}).finally(() => {
					setBusy(false);
				});
			}
		})]
	});
}
