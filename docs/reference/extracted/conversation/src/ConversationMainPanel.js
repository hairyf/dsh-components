// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/skeleton/ConversationMainPanel.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		const CONTENT_SLOTS = { widthControls: ConversationWidthControls };
		/**
		* Render the existing main Conversation frame around the extracted content.
		* @param props - the original `main.conversation` Slot props.
		* @returns the unchanged root, Header, content, and width-control subtree.
		*/
		function ConversationMainPanel(props) {
			const { sessionId, useSession, useSessions, useConversation, renderSlot, renderFactorySlot } = props;
			const session = useSession((s) => s);
			const conversation = useConversation((s) => s);
			const shellPhase = session === void 0 || conversation === void 0 ? "blank" : conversationPhase(session, conversation);
			const openState = session?.openState;
			const summaryBlank = useSessions((s) => sessionId === void 0 ? void 0 : s.byId[sessionId]?.blank);
			const parentAvailabilityPending = session?.subagent?.address.mode === "continuable" && session.subagent.parentAvailable === void 0;
			const settling = sessionId !== void 0 && (shellPhase === "blank" && openState === "loading" && summaryBlank !== true || parentAvailabilityPending);
			const hero = sessionId === void 0 || shellPhase === "blank" && (openState === "open" || summaryBlank === true);
			const phase = settling ? "settling" : hero ? "hero" : "active";
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ConversationRoot_module_css_default.root,
				"data-phase": phase,
				children: [renderSlot("conversation.header", {}), renderFactorySlot("conversation.content", {
					variant: "main",
					phase,
					hero
				}, { slots: CONTENT_SLOTS })]
			});
		}
