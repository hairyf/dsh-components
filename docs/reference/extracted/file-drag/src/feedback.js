// Extracted from @deepseek-ai/dsh-client-ui-file-drag (lib/client.js); region lib/types/client/feedback.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** File-drag failure presentation in the existing application overlay. */
/**
* Keep transient failures visible after their originating source unmounts.
* @param props - framework-bound failure source and dismissal callback.
* @returns the current failure toast, or nothing.
*/
function FileDragFeedback({ useFailure, dismiss }) {
	const failure = useFailure((value) => value);
	return failure === null ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
		text: failure.text,
		onDone: dismiss
	}, failure.sequence);
}
