// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/SystemPromptRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render one complete system prompt as a collapsed disclosure whose expanded
* body is the same opaque context chrome: 141px code-block scrollport and
* model-facing text with its real line breaks. An in-history update uses the
* same row under its own title.
* @param props - Complete prompt text, whether it is an update, and the locale seat.
* @returns The system-prompt disclosure row.
*/
function SystemPromptRow({ text, update = false, t }) {
	const [open, setOpen] = (0, react.useState)(false);
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DisclosureRow, {
		className: ContextInjectionRow_module_css_default.root,
		icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBrowseOutlineRegular, { size: 14 }),
		chevronClassName: ContextInjectionRow_module_css_default.chevron,
		title: t(update ? "message.systemPromptUpdate" : "message.systemPrompt"),
		open,
		expandable: true,
		expandOnRowClick: true,
		onToggle: () => {
			setOpen((value) => !value);
		},
		children: (0, react_jsx_runtime.jsx)("div", {
			className: ContextInjectionRow_module_css_default.body,
			"data-system-prompt-body": true,
			children: (0, react_jsx_runtime.jsx)(OpaqueBody, {
				content: [{
					type: "text",
					text
				}],
				source: null,
				t
			})
		})
	});
}
/** System-prompt keyed Chat renderer. */
const SystemPromptNodeView = (0, react.memo)(function SystemPromptNodeView({ node, t }) {
	return (0, react_jsx_runtime.jsx)(SystemPromptRow, {
		text: node.data.text,
		update: node.data.update === true,
		t
	});
});
