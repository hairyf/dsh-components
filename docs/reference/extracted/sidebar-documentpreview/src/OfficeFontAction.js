// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/office/OfficeFontAction.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Expose font details only for the currently loaded Office revision.
* @param props - toolbar revision, tab reader, Office store, and localized copy.
* @returns the font warning, or nothing before conversion completes.
*/
function OfficeFontAction({ content, useTabInfo, useStore, t }) {
	const { tab } = useTabInfo();
	const held = useStore((state) => state.byTab[tab.id]);
	if (content.kind !== "renderer" || held?.revision !== content.revision || held.file === void 0) return null;
	return (0, react_jsx_runtime.jsx)(FontNotice, {
		fonts: held.file.missingFonts,
		t
	}, content.revision);
}
