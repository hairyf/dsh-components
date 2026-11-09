// Extracted from @deepseek-ai/dsh-client-ui-plan (lib/client.js); region lib/types/client/failure-line.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Explain a failed plan read in the current locale.
* @param t - Plan namespace translator.
* @param failure - Failure reported by the resource provider.
* @returns localized plan copy, or the external failure's diagnostic.
*/
function planFailureLine(t, failure) {
	switch (failure.code) {
		case "plan/invalid-address": return t("preview.invalidAddress");
		case "plan/not-found": return t("preview.notFound");
		default: return failure.message;
	}
}
