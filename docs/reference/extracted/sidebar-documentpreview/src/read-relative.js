// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/html/read-relative.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Bind a package reader to the original HTML file's address.
* @param readRelated - workspace reader using the Session in the root HTML address.
* @param address - root HTML file address.
* @param lifetime - tab lifetime.
* @param addResource - subscribes to the dependency path reported by the Host.
* @returns a reader that strips URL query/fragment, decodes one path, and preserves Host failures.
*/
function createReadHtmlRelative(readRelated, address, lifetime, addResource) {
	return async (reference, signal) => {
		const suffix = reference.search(/[?#]/u);
		const path = decodeURIComponent(suffix === -1 ? reference : reference.slice(0, suffix));
		if (path.length === 0 || /^(?:[a-z][a-z\d+.-]*:|[/\\])/iu.test(path) || path.includes("\0") || path.includes("\\")) throw new Error("HTML dependency must use a relative file path");
		const combined = AbortSignal.any([lifetime, signal]);
		combined.throwIfAborted();
		const file = hostFileOf(address);
		const result = await readRelated(address, path, combined);
		combined.throwIfAborted();
		if (!result.ok) {
			if ("path" in result.error.details && typeof result.error.details.path === "string") addResource(sessionFileAddress(file.sessionId, result.error.details.path));
			throw new Error(result.error.message);
		}
		addResource(sessionFileAddress(file.sessionId, result.value.absolutePath));
		return result.value;
	};
}
