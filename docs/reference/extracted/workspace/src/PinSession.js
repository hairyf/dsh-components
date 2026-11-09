// Extracted from @deepseek-ai/dsh-client-ui-workspace (lib/client.js); region lib/types/client/session-actions/PinSession.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Session pin hover button over the workspace owner’s shared callbacks. */
/** The row's pin and archive membership, one Set lookup each, and whether its access allows the toggle. */
function usePinState({ sessionId, usePinned, useArchived, useSessionAccess }) {
	const pinned = usePinned((set) => set.has(sessionId));
	return {
		pinned,
		archived: useArchived((archived) => archived.has(sessionId)),
		allowed: useSessionAccess(sessionId, pinned ? "workspace/unpinSession" : "workspace/pinSession")
	};
}
/**
* Hover button (order 200), also visible without hover when pinned; absent on
* archived rows and while the Session's access snapshot excludes that toggle.
* Tooltip forwards the class to the button. Keep that button directly inside
* the display-contents slot anchor so hoverless rows can retain the Unpin action.
* @param props - owner share, the access Hook, and the pin share.
* @returns the button, or null for an archived or refused Session.
*/
function PinSessionRowButton(props) {
	const { sessionId, pinSession, unpinSession, t } = props;
	const { pinned, archived, allowed } = usePinState(props);
	if (archived || !allowed) return null;
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
		label: t(pinned ? "actions.unpin" : "actions.pin"),
		side: "bottom",
		align: "end",
		delayMs: 500,
		portal: true,
		children: (0, react_jsx_runtime.jsx)("button", {
			type: "button",
			className: clsx(Rows_module_css_default.iconButton, pinned && Rows_module_css_default.pinnedAction),
			"aria-label": t(pinned ? "menu.unpinSession" : "menu.pinSession"),
			onClick: () => {
				(pinned ? unpinSession : pinSession)(sessionId);
			},
			children: pinned ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPinFillRegular, { size: 14 }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPinOutlineRegular, { size: 14 })
		})
	});
}
