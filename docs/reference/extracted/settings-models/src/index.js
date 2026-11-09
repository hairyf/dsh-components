// Extracted from @deepseek-ai/dsh-client-ui-settings-models (lib/index.js); region lib/types/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Host configuration and page bootstrap for Models credential onboarding. */
/**
* Publish the credential-onboarding choice before browser plugins activate.
* @param ctx - Host context collecting the page's initialization data.
* @param config - plugin options with schema defaults applied by the Loader.
*/
function apply(ctx, config) {
	ctx.on("webserver/index-inject", (table) => {
		table.push({
			kind: "global",
			name: ONBOARDING_CONFIG_GLOBAL,
			value: { credentialOnboarding: config.credentialOnboarding }
		});
	});
}
