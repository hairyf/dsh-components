// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/markdown/path-images.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Local Markdown image destinations served by the authenticated file route. */
/**
* Build a file URL, resolving relative destinations beside the previewed file.
* @param base - document base URI, including any deployment prefix.
* @param documentPath - absolute source path reported by the Host, when available.
* @param destination - authored Markdown image URL; query and fragment are not filename components.
* @returns a Web or Desktop file URL, or undefined for unsupported or malformed destinations.
*/
function markdownImageUrl(base, documentPath, destination) {
	const suffix = destination.search(/[?#]/u);
	let path;
	try {
		path = decodeURIComponent(suffix === -1 ? destination : destination.slice(0, suffix));
	} catch (_error) {
		return;
	}
	if (path.length === 0) return void 0;
	if (!/^[a-z]:[/\\]/iu.test(path) && /^[a-z][a-z\d+.-]*:/iu.test(path)) return void 0;
	if (!isAbsoluteWorkspacePath(path)) {
		if (documentPath === void 0) return void 0;
		path = pathPartsOf(documentPath).directory + path;
	}
	return fileMediaUrl(base, path);
}
