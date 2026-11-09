// Extracted from @deepseek-ai/dsh-client-ui-sidebar-right (lib/client.js); region lib/types/client/shell/TabMenuContent.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** @param props - clicked tab and already retained view. @returns existing plugin menu rows. */
function TabMenuContent({ target, dismiss, useViews, SessionProvider, renderSlot }) {
	const views = useViews((value) => value);
	if (target.kind !== "tab") return null;
	const view = views.find((view) => view.sessionId === target.value.sessionId);
	const tab = target.value.tab;
	if (view === void 0) return null;
	return (0, react_jsx_runtime.jsx)(SessionProvider, {
		session: view.reference,
		children: renderSlot("sidebar.right.tab.menu.item", {
			tab,
			dismiss
		})
	});
}
