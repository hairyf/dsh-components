// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/onboarding-settings.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Device-local onboarding progress stored in the Host settings document. */
/** Account feature's durable onboarding namespace. */
const DESKTOP_ONBOARDING_NAMESPACE = "ui-settings-account";
/** Validated defaults for a fresh installation. */
const OnboardingSettingsFields = {
	version: Schema.const(1).default(1),
	step: Schema.union([
		"welcome",
		"credit",
		"purpose",
		"process",
		"done"
	]).default("welcome"),
	purpose: Schema.union([
		"office",
		"development",
		"both",
		Schema.const(null)
	]),
	process: Schema.union([
		"compact",
		"standard",
		"detailed",
		Schema.const(null)
	]),
	completion: Schema.union([
		"completed",
		"skipped",
		"api-key",
		Schema.const(null)
	]),
	usage: Schema.union(["compact", "detailed"]).default("compact"),
	developerTools: Schema.boolean().default(false)
};
Schema.object(OnboardingSettingsFields);
