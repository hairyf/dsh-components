// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/skeleton/ConversationHeader.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Resident conversation navigation and Session-specific header content. */
/**
* Keeps global navigation available before a Session exists.
* @param props - Optional Session sources and authorized header slots.
* @returns The persistent header with any selected Session's title and views.
*/
function ConversationHeader({ sessionId, useSession, useConversation, renderSlot }) {
	const session = useSession((s) => s);
	const conversation = useConversation((s) => s);
	const blank = session === void 0 || conversation === void 0 || session.blank && conversationPhase(session, conversation) === "blank";
	return (0, react_jsx_runtime.jsxs)("header", {
		className: clsx(ConversationRoot_module_css_default.header, blank && ConversationRoot_module_css_default.headerBlank),
		"data-window-drag": true,
		children: [(0, react_jsx_runtime.jsx)("div", {
			className: ConversationRoot_module_css_default.headerLeading,
			"data-conversation-header-leading": "",
			children: renderSlot("conversation.header.leading", {})
		}), sessionId === void 0 ? (0, react_jsx_runtime.jsx)("div", { className: ConversationRoot_module_css_default.titleRow }) : renderSlot("conversation.session.header", { hideChrome: blank })]
	});
}
/**
* Resolve a preferred registered View, then Chat, without choosing another View.
* @param tabs - currently registered Views.
* @param selectedId - preferred View identity, when one is stored.
* @returns the selected View, Chat fallback, or undefined when neither is registered.
*/
function resolveActiveView(tabs, selectedId) {
	return (selectedId === null ? void 0 : tabs.find((view) => view.id === selectedId)) ?? tabs.find((view) => view.id === "chat");
}
