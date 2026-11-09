// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/use-turn-data.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

const EMPTY_SOURCE = {
	getSnapshot: () => void 0,
	subscribe: () => () => {}
};
/**
* Subscribe to one value from a Turn's keyed Location-data store.
* @param data - current Turn data store, or absence for a Node outside a Turn.
* @param key - declaration-merged business key.
* @returns the current value for that key.
*/
function useTurnDataValue(data, key) {
	const source = data?.source(key) ?? EMPTY_SOURCE;
	return (0, react.useSyncExternalStore)(source.subscribe, source.getSnapshot);
}
