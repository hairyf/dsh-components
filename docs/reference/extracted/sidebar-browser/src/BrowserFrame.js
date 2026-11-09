// Extracted from @deepseek-ai/dsh-client-ui-sidebar-browser (lib/client.js); region lib/types/client/browser/BrowserFrame.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Create idle navigation state without a page target.
* @returns state before any page has been requested.
*/
function emptyBrowserFrame() {
	return {
		target: void 0,
		address: "empty",
		loading: false,
		canGoBack: false,
		canGoForward: false,
		error: void 0,
		sandboxEnabled: void 0
	};
}
