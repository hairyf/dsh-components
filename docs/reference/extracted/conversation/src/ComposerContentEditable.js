// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/input/editor/ComposerContentEditable.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The composer's contenteditable host: binds one shell-owned Lexical editor
		* to a resident div. Session-maybe by design — a null editor renders the
		* same DOM inert (the no-session Workspace-trigger state), so switching
		* between the two never swaps the element tree. Editability has ONE writer:
		* this component reflects the `editable` prop onto the editor; nothing else
		* calls setEditable.
		*/
		/**
		* Render the composer's editable surface.
		* @param props - editor binding, editability, and div passthroughs.
		* @returns the resident contenteditable div.
		*/
		function ComposerContentEditable({ editor, editable, ...rest }) {
			const ref = (0, react.useRef)(null);
			(0, react.useLayoutEffect)(() => {
				const el = ref.current;
				if (editor === null || el === null) return;
				editor.setRootElement(el);
				return () => {
					editor.setRootElement(null);
				};
			}, [editor]);
			(0, react.useLayoutEffect)(() => {
				if (editor !== null) editor.setEditable(editable);
			}, [editor, editable]);
			return (0, react_jsx_runtime.jsx)("div", {
				ref,
				contentEditable: editor !== null && editable,
				suppressContentEditableWarning: true,
				role: "textbox",
				"aria-multiline": "true",
				"data-composer-input": true,
				...rest
			});
		}
