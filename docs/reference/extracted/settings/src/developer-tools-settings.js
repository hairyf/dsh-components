// Extracted from @deepseek-ai/dsh-client-ui-settings (lib/client.js); region lib/types/developer-tools-settings.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Shared Web and desktop developer-tool preference stored by the Host. */
/** Namespace for developer UI and HTML preview capabilities. */
const DEVELOPER_TOOLS_NAMESPACE = "ui-settings";
/** New installations and missing values enable the full interface. */
const DeveloperToolsSettingsFields = { enabled: Schema.boolean().default(true) };
Schema.object(DeveloperToolsSettingsFields);
