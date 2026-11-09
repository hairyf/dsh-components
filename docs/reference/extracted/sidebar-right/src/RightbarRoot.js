// Extracted from @deepseek-ai/dsh-client-ui-sidebar-right (lib/client.js); region lib/types/client/shell/RightbarRoot.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Root-scoped controller for the right Sidebar's Session content. */
function SessionView({ view, visible, SessionProvider, renderSlot, mountView, width, viewportWidth, canShow }) {
	(0, react.useLayoutEffect)(() => mountView(view.reference), [mountView, view.reference]);
	const active = visible && view.selected;
	return (0, react_jsx_runtime.jsx)("div", {
		className: SidebarRight_module_css_default.session,
		hidden: !active,
		"data-sidebar-right-session": view.sessionId,
		children: (0, react_jsx_runtime.jsx)(SessionProvider, {
			session: view.reference,
			children: renderSlot("rightbar.session", {
				width,
				viewportWidth,
				canShow,
				active,
				retainTab: view.retainTab
			})
		})
	});
}
/**
* Keep independent Session subtrees and hide those outside the selected Conversation.
* @param props - frame geometry, view targets and the authorized Session renderer.
* @returns the foreground and retained background Sidebars.
*/
function RightbarRoot({ usePanelInfo, useViews, ...props }) {
	const visible = usePanelInfo((info) => info.activePanelId === null);
	return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: useViews((value) => value).map((view) => (0, react_jsx_runtime.jsx)(SessionView, {
		...props,
		view,
		visible
	}, view.sessionId)) });
}
