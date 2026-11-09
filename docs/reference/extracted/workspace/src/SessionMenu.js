// Extracted from @deepseek-ai/dsh-client-ui-workspace (lib/client.js); region lib/types/client/session-actions/SessionMenu.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Legacy external Session contributions shared by the row, header, and More trigger. */
/** @param props - captured Session and the existing extension position. @returns legacy component contributions. */
function SessionMenu({ target, dismiss, renderSlot }) {
	const hookContext = (0, react.useMemo)(() => [true, (open) => {
		if (!open) dismiss();
	}], [dismiss]);
	if (target.kind !== "session") return null;
	return renderSlot("sidebar.workspaces.session.menu.item", target.value, { hookContext });
}
