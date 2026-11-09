// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/markdown/MarkdownDelegate.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Consumer-owned navigation for Markdown links. */
const MarkdownDelegateContext = createContext({});
/**
* Scope Markdown navigation without threading callbacks through renderers.
* Nested providers replace the enclosing capabilities. Handler changes reach cached links.
* @param props - Child tree and its file and HTTP(S) link handlers.
* @returns the scoped child tree.
*/
function MarkdownDelegateProvider({ children, openExternalLink, openFile, fileImages, getTriggerProps }) {
	const delegate = useMemo(() => ({
		openExternalLink,
		openFile,
		fileImages,
		getTriggerProps
	}), [
		openExternalLink,
		openFile,
		fileImages,
		getTriggerProps
	]);
	return jsx(MarkdownDelegateContext.Provider, {
		value: delegate,
		children
	});
}
/**
* Read the nearest Markdown navigation capabilities.
* @returns Owner callbacks, or an empty delegate outside a provider.
*/
function useMarkdownDelegate() {
	return useContext(MarkdownDelegateContext);
}
