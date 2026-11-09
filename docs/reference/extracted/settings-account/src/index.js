// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/index.js); region lib/types/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Configuration projected through the account plugin's shared form. */
const Config = z.object({
	contactFormUrl: ContactConfigFields.contactFormUrl,
	contactSource: ContactConfigFields.contactSource,
	bonusAckRetryDelayMs: ContactConfigFields.bonusAckRetryDelayMs,
	bonusAckRetryMaxDelayMs: ContactConfigFields.bonusAckRetryMaxDelayMs,
	version: OnboardingSettingsFields.version.volatile(),
	step: OnboardingSettingsFields.step.volatile(),
	purpose: OnboardingSettingsFields.purpose.volatile(),
	process: OnboardingSettingsFields.process.volatile(),
	completion: OnboardingSettingsFields.completion.volatile(),
	usage: OnboardingSettingsFields.usage.volatile(),
	developerTools: OnboardingSettingsFields.developerTools.volatile()
});
/**
* Publish public questionnaire options before browser plugins activate.
* @param ctx - Host context collecting page initialization data.
* @param config - validated deployment options.
*/
function apply(ctx, config) {
	ctx.inject(["settings"], (scope) => {
		scope.effect(() => scope.settings.configure({ auto: false }, ctx.fiber));
	});
	ctx.on("webserver/index-inject", (table) => {
		table.push({
			kind: "global",
			name: CONTACT_CONFIG_GLOBAL,
			value: {
				contactFormUrl: config.contactFormUrl,
				contactSource: config.contactSource,
				bonusAckRetryDelayMs: config.bonusAckRetryDelayMs,
				bonusAckRetryMaxDelayMs: config.bonusAckRetryMaxDelayMs
			}
		});
	});
}
