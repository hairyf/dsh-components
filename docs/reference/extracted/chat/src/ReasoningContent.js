// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/ReasoningContent.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Official reasoning content and its default Body Slot adapter. */
/**
* Render compact reasoning with caller-supplied labels or Chat's defaults.
* @param props - display text, streaming state, optional localized labels, and the Factory's locale seat; no Session is required.
* @returns the standard reasoning content; supplied labels are used without merging defaults.
*/
const ReasoningContent = (0, react.memo)(function ReasoningContent({ text, running, labels, t }) {
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
		text,
		streaming: running,
		labels: (0, react.useMemo)(() => labels ?? markdownLabels(t), [labels, t]),
		variant: "compact"
	});
});
/**
* Render the default Body through the same Factory available to third-party wrappers.
* @param props - display-ready reasoning and the framework's Factory renderer.
* @returns an occurrence of the official reasoning Content Factory.
*/
function DefaultReasoningBody({ text, running, renderFactorySlot }) {
	return renderFactorySlot("conversation.chat.reasoning.content", {
		text,
		running
	});
}
