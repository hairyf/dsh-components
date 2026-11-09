// Extracted from @deepseek-ai/dsh-client-ui-brand-official (lib/client.js); region lib/types/client/Brand.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render the official mark with the presentation requested by its host surface.
* @param props - Host-supplied mark presentation.
* @returns the official whale mark.
*/
function OfficialBrandMark({ size }) {
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FishLogo, { size });
}
/**
* Render the official name artwork without its independently slotted mark.
* @returns the official name wordmark.
*/
function OfficialBrandName() {
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.BrandWordmark, { includeMark: false });
}
