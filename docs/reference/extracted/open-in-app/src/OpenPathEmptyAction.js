// Extracted from @deepseek-ai/dsh-client-ui-open-in-app (lib/client.js); region lib/types/client/OpenPathEmptyAction.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render the shared file opening menu with a larger labeled main button.
* @param props - unpreviewable file and injected opening capabilities.
* @returns the shared file opening action.
*/
function OpenPathEmptyAction(props) {
	return (0, react_jsx_runtime.jsx)(FileOpenTarget, {
		...props,
		empty: true
	});
}
