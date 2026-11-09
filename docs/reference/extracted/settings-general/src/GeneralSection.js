// Extracted from @deepseek-ai/dsh-client-ui-settings-general (lib/client.js); region lib/types/client/GeneralSection.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render the General section content column.
* @param props - composed slot props (contract/slots.ts).
* @returns the section element tree.
*/
function GeneralSection({ renderSlot }) {
	return (0, react_jsx_runtime.jsx)("div", {
		className: GeneralSection_module_css_default.section,
		children: renderSlot("settings.general.item", {})
	});
}
