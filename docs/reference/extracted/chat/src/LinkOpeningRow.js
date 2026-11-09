// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/settings/LinkOpeningRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render the link-opening destination selector.
* @param props - Composed Settings slot props.
* @returns The preference row.
*/
function LinkOpeningRow({ useLinkOpening, useBrowserAvailable, setLinkOpening, t }) {
	const destination = useLinkOpening((value) => value);
	if (!useBrowserAvailable((value) => value)) return null;
	return (0, react_jsx_runtime.jsx)(PreferenceRow, {
		title: t("settings.links.title"),
		description: t("settings.links.description"),
		value: destination,
		selectedLabel: t(destination === "sidebar" ? "settings.links.sidebar" : "settings.links.newTab"),
		options: [{
			id: "sidebar",
			label: t("settings.links.sidebar")
		}, {
			id: "new-tab",
			label: t("settings.links.newTab")
		}],
		onSelect: (value) => {
			setLinkOpening(value);
		}
	});
}
