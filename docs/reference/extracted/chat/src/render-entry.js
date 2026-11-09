// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/render-entry.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Identify a rendering position independently of presentation mode.
* @param entry - mode-independent rendering reference.
* @returns its collision-free React key.
*/
function chatRenderKey(entry) {
	switch (entry.kind) {
		case "node": return JSON.stringify([
			"node",
			entry.key,
			entry.groupPart ?? null
		]);
		case "group": return JSON.stringify(["group", entry.key]);
		default: return assertNever(entry);
	}
}
