// Extracted from @deepseek-ai/dsh-client-ui-workspace (lib/client.js); region lib/types/client/session-actions/RowActionToast.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Dispatch the current notice without interpreting its business payload.
* @param props - Current notice, dismissal, and the declared keyed renderer.
* @returns The selected notice presentation, or nothing.
*/
function RowActionToast({ useToast, dismissToast, renderSlot }) {
	const notice = useToast((current) => current);
	if (notice === null) return null;
	return renderSlot("workspace.toast", {
		...notice,
		dismissToast
	}, { entryKey: notice.kind });
}
