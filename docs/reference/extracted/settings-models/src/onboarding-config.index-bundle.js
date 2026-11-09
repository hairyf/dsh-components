// Extracted from @deepseek-ai/dsh-client-ui-settings-models (lib/index.js); region lib/types/onboarding-config.js
// Cross-bundle variant: the bundler tree-shook this source file differently per entry. The lib/client.js variant is the primary file.
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Public page-bootstrap options shared by the Host and Client halves. */
/** Validate Host configuration and its public page-bootstrap payload. */
const Config = z.object({ credentialOnboarding: z.boolean().default(true) });
/** Page-global key carrying only the public onboarding options. */
const ONBOARDING_CONFIG_GLOBAL = "__DSH_MODELS_ONBOARDING__";
