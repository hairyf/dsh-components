// Extracted from @deepseek-ai/dsh-client-ui-sidebar-browser (lib/client.js); region lib/types/client/pages.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Assemble an idle iframe provider and its DOM presentation.
* @param options - saved navigation and callbacks.
* @returns the Web page's navigation and presentation objects.
*/
function createIframePage(options) {
	const presentation = new IframePresentation({
		loaded: (revision) => {
			frame.handleLoaded(revision);
		},
		failed: (revision) => {
			frame.handleLoadFailed(revision);
		},
		remounted: () => {
			frame.reload();
		}
	});
	const frame = new IframeImpl(options, presentation);
	return {
		frame,
		presentation
	};
}
