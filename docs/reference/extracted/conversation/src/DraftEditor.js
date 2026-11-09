// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/input/editor/DraftEditor.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render the existing scrollport, editable surface, placeholder, and chip portals.
* @param props - borrowed editor and presentation values; this component owns no Hooks.
* @returns the existing text-area DOM without an additional wrapper.
*/
function DraftEditor({ classNames: css, editor, scrollRef, editable, editorDisabled, phase, placeholderText, ariaLabel, workspaceTrigger, workspacePickerOpen, onWorkspaceKeyDown, hint, showPlaceholder }) {
	return (0, react_jsx_runtime.jsx)("div", {
		ref: scrollRef,
		className: css.scroll,
		"data-input-scroll": true,
		children: (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.HoverCardGroup, {
			className: css.grow,
			children: [
				(0, react_jsx_runtime.jsx)(ComposerContentEditable, {
					editor: workspaceTrigger ? null : editor,
					editable,
					className: clsx(css.input, editorDisabled && css.inputDisabled),
					"data-phase": phase,
					"aria-disabled": editorDisabled || void 0,
					"data-placeholder": placeholderText,
					"aria-label": ariaLabel,
					"aria-haspopup": workspaceTrigger ? "menu" : void 0,
					"aria-expanded": workspaceTrigger ? workspacePickerOpen : void 0,
					tabIndex: workspaceTrigger ? 0 : void 0,
					onKeyDown: workspaceTrigger ? onWorkspaceKeyDown : void 0,
					style: hint === null ? void 0 : { "--dsh-composer-hint": JSON.stringify(hint) }
				}),
				showPlaceholder && (0, react_jsx_runtime.jsx)("div", {
					"aria-hidden": true,
					className: css.placeholder,
					"data-composer-placeholder": true,
					children: placeholderText
				}),
				(0, react_jsx_runtime.jsx)(DecoratorPortals, { editor: workspaceTrigger ? null : editor })
			]
		})
	});
}
