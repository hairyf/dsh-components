// Extracted from @deepseek-ai/dsh-client-ui-sidebar-right (lib/client.js); region lib/types/client/shell/close-focus.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Focus continuity after page operations replace docked or floating pane elements. */
/**
* Focus the page selected by an open or split after its DOM has committed.
* @param document - product document owning the input focus.
* @param sessionId - Session whose page is opening.
* @param open - synchronous operation returning its selected pane, or undefined when unchanged.
*/
function openWithPaneFocus(document, sessionId, open) {
	let paneId;
	(0, react_dom.flushSync)(() => {
		paneId = open();
	});
	if (paneId !== void 0) visibleSidebarPane(document, sessionId, paneId)?.focus({ preventScroll: true });
}
/**
* Commit a focused page's removal before focusing a surviving visible pane.
* @param document - product document owning the input focus.
* @param sessionId - Session whose page is closing.
* @param paneId - pane whose page is closing; preferred if it survives.
* @param close - synchronous cleanup and layout removal; errors preserve focus.
*/
function closeWithPaneFocus(document, sessionId, paneId, close) {
	const before = document.activeElement;
	const owner = before?.closest("[data-sidebar-right-session]");
	const source = before?.closest("[data-dockkit-pane], [data-dockkit-float]");
	const retain = owner?.dataset.sidebarRightSession === sessionId && (source?.dataset.dockkitPane ?? source?.dataset.dockkitFloat) === paneId;
	(0, react_dom.flushSync)(close);
	if (!retain || document.activeElement !== document.body && document.activeElement !== before) return;
	visibleSidebarPane(document, sessionId, paneId)?.focus({ preventScroll: true });
}
