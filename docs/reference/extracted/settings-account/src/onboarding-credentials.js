// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/onboarding-credentials.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Desktop login owns model-credential discovery for both welcome and onboarding. */
/**
* Read the same safe credential fact used by native login.
* @returns configured API-key presence; rejects when the desktop bridge is unavailable.
*/
async function readOnboardingApiKeyPresence() {
	const bridge = globalThis.dshOnboarding;
	if (bridge === void 0) throw new Error("desktop login bridge unavailable");
	return bridge.hasApiKey();
}
