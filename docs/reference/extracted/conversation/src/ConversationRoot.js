// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/skeleton/ConversationRoot.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

function ConversationRoot(props) {
	return (0, react_jsx_runtime.jsx)(ConversationMainPanel, { ...props });
}
/**
* The text one Workspace is labeled with. A Workspace still carrying the
* automatic first-use title reads as the caller's localized default name; every
* other title reads verbatim in every language. A title the user typed as
* exactly {@link DEFAULT_WORKSPACE_DIRECTORY} is labeled as the default too;
* nothing else depends on the distinction.
* @param title - stored Workspace title.
* @param localizedDefault - the default Workspace name in the active language.
* @returns the title to display.
*/
function workspaceDisplayTitle(title, localizedDefault) {
	return title === "default-workspace" ? localizedDefault : title;
}
