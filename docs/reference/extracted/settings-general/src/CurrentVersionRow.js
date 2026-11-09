// Extracted from @deepseek-ai/dsh-client-ui-settings-general (lib/client.js); region lib/types/client/CurrentVersionRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render the version embedded by the client build; partial builds without metadata omit the row.
* @param props - runtime share and localized copy.
* @returns the current release label, or nothing when build metadata is absent.
*/
function CurrentVersionRow({ t }) {
	return (0, react_jsx_runtime.jsx)("div", {
		className: CurrentVersionRow_module_css_default.row,
		children: t("general.currentVersion", { version: "0.2.2-rc.1" })
	});
}
