// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/UserMessageBubble.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render user-style message content without row placement or actions.
* @param props - Native div attributes and the caller-owned content.
* @returns A theme-aware message surface that wraps its content.
*/
function UserMessageBubble({ className, ...props }) {
	return jsx("div", {
		...props,
		className: clsx(css.bubble, className)
	});
}
