// Extracted from @deepseek-ai/dsh-client-ui-context-menu (lib/client.js); region lib/types/client/target-key.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Compare captured JSON targets independently of object key insertion order.
* @param target - captured immutable target.
* @returns canonical JSON identity.
*/
function menuTargetKey(target) {
	return JSON.stringify(target, (_key, value) => {
		if (typeof value !== "object" || value === null || Array.isArray(value)) return value;
		return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)));
	});
}
