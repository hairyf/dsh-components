// Extracted from @deepseek-ai/dsh-client-ui-sidebar-right (lib/client.js); region lib/types/client/labels.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Project the dictionary into the kit's label contract.
*
* Called during render, so a language change reaches the kit with the next one —
* the kit caches no copy to invalidate.
* @param t - namespace-bound translate.
* @param split - effective split binding, when available.
* @param close - effective page-close binding, when available.
* @returns every string the kit renders.
*/
function dockLabels(t, split, close) {
	return {
		emptyPane: t("dock.emptyPane"),
		splitPane: t("dock.splitPane"),
		splitPaneShortcut: split?.aria,
		splitPaneKeys: split?.keys,
		splitPaneDisabled: t("dock.splitPaneDisabled"),
		splitPaneNarrow: t("dock.splitPaneNarrow"),
		closeTab: t("dock.closeTab"),
		closeTabShortcut: close?.aria,
		closeTabKeys: close?.keys,
		addTab: t("dock.addTab"),
		dockFloat: t("dock.dockFloat"),
		closeFloat: t("dock.closeFloat"),
		dropZone: {
			center: t("dock.drop.center"),
			left: t("dock.drop.left"),
			right: t("dock.drop.right"),
			top: t("dock.drop.top"),
			bottom: t("dock.drop.bottom")
		}
	};
}
