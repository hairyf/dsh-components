// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/context-occupancy.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Resolve bounded display occupancy from independently updated pressure fields.
* @param pressure - latest token-meter projection.
* @returns occupancy, or null until numerator and capacity are known.
*/
function contextOccupancy(pressure) {
	const usedTokens = pressure?.projectedTokens ?? pressure?.pressureTokens;
	if (usedTokens === void 0 || pressure?.contextWindow === void 0) return null;
	return {
		percent: Math.min(100, Math.round(usedTokens / pressure.contextWindow * 100)),
		usedTokens,
		contextWindow: pressure.contextWindow
	};
}
