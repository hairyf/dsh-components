// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/darwin-desktop.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** macOS desktop detection for hiddenInset-titlebar layout variants. */
/**
* Whether the client runs in the macOS desktop shell: the Electron preload
* marks `<html>` with `data-platform="darwin"`; plain web never sets it.
* Read at render time — the mark may arrive as late as DOMContentLoaded.
* @returns true only inside the macOS Electron shell.
*/
function isDarwinDesktop() {
	return document.documentElement.dataset.platform === "darwin";
}
