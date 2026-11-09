// Extracted from @deepseek-ai/dsh-client-ui-agent-preset (lib/client.js); region lib/types/client/analytics.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Resolve a known selection by preset id without treating an unloaded state as a default.
* @param id - selected preset id; an empty id means unknown.
* @returns the built-in category for a shipped id, other for any other id, or undefined until known.
*/
function analyticsMode(id) {
	if (id === "") return void 0;
	switch (id) {
		case "cordis": return "creator";
		case "ptc": return "ptc";
		case "minimal": return "minimal";
		case "standard": return "standard";
		default: return "other";
	}
}
