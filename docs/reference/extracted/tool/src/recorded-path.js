// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/models/recorded-path.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Operation-time filesystem locations carried by settled tool results. */
/**
* Read one absolute location from opaque persisted result metadata.
* @param meta - tool-owned result metadata from the Session log.
* @param field - the file path or command working directory.
* @returns the recorded path, or undefined for old or malformed metadata.
*/
function recordedAbsolutePath(meta, field) {
	if (meta === null || typeof meta !== "object" || Array.isArray(meta)) return void 0;
	const value = meta[field];
	return typeof value === "string" && isAbsoluteWorkspacePath(value) ? value : void 0;
}
