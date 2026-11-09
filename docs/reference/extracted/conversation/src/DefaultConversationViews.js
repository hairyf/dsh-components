// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/skeleton/DefaultConversationViews.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Renders the active Session view inside the resident scrollport and keeps
* the input draft persisted while blank Hero chrome is visible.
* @param props - Strict Session input/store, view ledger, and render shares.
* @returns the active view area, or null while the Session remains blank.
*/
function DefaultConversationViews({ view, useSession, useConversation, useConversationViews, inputActions, useStore, actions, renderSlot, bindDraftPersistence, openView, useInspectCall }) {
	const tabs = useConversationViews((value) => value);
	const inspectCall = useInspectCall((value) => value);
	const active = resolveActiveView(tabs, useStore((s) => s.view));
	const session = useSession((s) => s);
	const conversation = useConversation((s) => s);
	const viewRequest = useStore((s) => s.viewRequest ?? null);
	(0, react.useEffect)(() => {
		const unbindDraftPersistence = bindDraftPersistence(actions.setDraft);
		inputActions.persistDraft();
		return () => {
			unbindDraftPersistence();
		};
	}, [inputActions]);
	if (session.blank && conversationPhase(session, conversation) === "blank") return null;
	const viewId = view ?? active?.id;
	return (0, react_jsx_runtime.jsx)("div", {
		className: ConversationRoot_module_css_default.viewArea,
		children: viewId !== void 0 && renderSlot("conversation.view", {
			inspectCall,
			viewRequest,
			openView,
			completeViewRequest: actions.completeViewRequest
		}, { only: viewId })
	});
}
