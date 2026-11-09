// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/index.js); region lib/types/submission-settings.js
// Cross-bundle variant: the bundler tree-shook this source file differently per entry. The lib/client.js variant is the primary file.
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Busy-Enter preference stored in the Host user-settings document. */
/** Settings namespace owned by the conversation plugin. */
const CONVERSATION_SETTINGS_NAMESPACE = "ui-conversation";
/** Field carrying the delivery mode for plain Enter while an agent is busy. */
const BUSY_ENTER_FIELD = "busyEnter";
/** Busy-Enter behaviors accepted at settings and input boundaries. */
const BUSY_ENTER_BEHAVIORS = ["queue", "steer"];
/** Default preserves Enter-as-Queue for running conversations. */
const DEFAULT_BUSY_ENTER_BEHAVIOR = "queue";
/** Durable conversation schema; also the wire envelope the browser scope validates against. */
const ConversationSettingsFields = { [BUSY_ENTER_FIELD]: z.union([...BUSY_ENTER_BEHAVIORS]).default(DEFAULT_BUSY_ENTER_BEHAVIOR) };
z.object(ConversationSettingsFields);
