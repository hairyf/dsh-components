// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/client-metadata.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Build the request identity for one account call.
* @param locale - active UI language; the Host reduces it to the Platform wire locale.
* @param version - client build version inlined by the bundle.
* @returns the metadata the account Remote methods carry.
* @throws Error when the build carries no version, instead of reporting an empty one.
*/
function accountClientMetadata(locale, version) {
	if (version === void 0 || version === "") throw new Error("account: this client build carries no DSH_CLIENT_VERSION");
	return {
		version,
		locale,
		timezoneOffsetSeconds: -(/* @__PURE__ */ new Date()).getTimezoneOffset() * 60
	};
}
