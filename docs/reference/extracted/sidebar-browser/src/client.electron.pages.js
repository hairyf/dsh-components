// Extracted from @deepseek-ai/dsh-client-ui-sidebar-browser (lib/client.js); region lib/types/client/electron/pages.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Assemble an idle Electron provider; guest creation waits for mounting and navigation.
* @param options - checkpoint and source-tab callbacks.
* @param bridge - desktop-only transport.
* @param workspace - storage account resolver.
* @returns separate navigation and presentation faces.
*/
function createElectronPage(options, bridge, workspace) {
	const presentation = new ElectronWebviewPresentation({
		mounted: () => {
			frame.attach();
		},
		unmounted: () => {
			frame.detach();
		}
	});
	const frame = new ElectronWebViewImpl(options, bridge, workspace, presentation);
	return {
		frame,
		presentation
	};
}
