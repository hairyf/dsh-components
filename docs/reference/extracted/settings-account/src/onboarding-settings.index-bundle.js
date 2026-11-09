// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/index.js); region lib/types/onboarding-settings.js
// Cross-bundle variant: the bundler tree-shook this source file differently per entry. The lib/client.js variant is the primary file.
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Device-local onboarding progress stored in the Host settings document. */
/** Validated defaults for a fresh installation. */
const OnboardingSettingsFields = {
	version: z.const(1).default(1),
	step: z.union([
		"welcome",
		"credit",
		"purpose",
		"process",
		"done"
	]).default("welcome"),
	purpose: z.union([
		"office",
		"development",
		"both",
		z.const(null)
	]),
	process: z.union([
		"compact",
		"standard",
		"detailed",
		z.const(null)
	]),
	completion: z.union([
		"completed",
		"skipped",
		"api-key",
		z.const(null)
	]),
	usage: z.union(["compact", "detailed"]).default("compact"),
	developerTools: z.boolean().default(false)
};
z.object(OnboardingSettingsFields);
