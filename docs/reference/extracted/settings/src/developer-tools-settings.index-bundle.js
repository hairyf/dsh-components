// Extracted from @deepseek-ai/dsh-client-ui-settings (lib/index.js); region lib/types/developer-tools-settings.js
// Cross-bundle variant: the bundler tree-shook this source file differently per entry. The lib/client.js variant is the primary file.
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Shared Web and desktop developer-tool preference stored by the Host. */
/** New installations and missing values enable the full interface. */
const DeveloperToolsSettingsFields = { enabled: z.boolean().default(true) };
z.object(DeveloperToolsSettingsFields);
