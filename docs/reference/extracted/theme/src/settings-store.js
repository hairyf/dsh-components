// Extracted from @deepseek-ai/dsh-client-ui-theme (lib/client.js); region lib/types/client/settings-store.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Appearance and font row slot stores: mirrors of the theme service
* snapshot. The plugin's apply-world change listener is the only writer; the
* row components read via props.useStore.
*/
/**
* Declares the Appearance row state and write surface.
* @returns the store handle.
*/
function createAppearanceRowStore() {
	return (0, _deepseek_ai_dsh_client_store.defineStore)({
		init: () => ({
			preference: "system",
			revision: -1
		}),
		actions: { sync: (d, preference, revision) => {
			if (revision <= d.revision) return;
			d.preference = preference;
			d.revision = revision;
		} }
	});
}
/**
* Declares the font rows' state and write surface.
* @returns the store handle.
*/
function createFontRowStore() {
	return (0, _deepseek_ai_dsh_client_store.defineStore)({
		init: () => ({
			fontSizes: DEFAULT_FONT_SIZES,
			fontFamilies: {
				text: "",
				code: "",
				terminal: ""
			},
			revision: -1
		}),
		actions: { sync: (d, fontSizes, fontFamilies, revision) => {
			if (revision <= d.revision) return;
			d.fontSizes = fontSizes;
			d.fontFamilies = fontFamilies;
			d.revision = revision;
		} }
	});
}
