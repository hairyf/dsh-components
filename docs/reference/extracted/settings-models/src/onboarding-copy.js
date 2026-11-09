// Extracted from @deepseek-ai/dsh-client-ui-settings-models (lib/client.js); region lib/types/onboarding-copy.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Durable settings namespace for product-wide GUI onboarding facts. */
const WELCOME_NOTICE_SETTINGS_NAMESPACE = "ui-settings-general";
/** Field storing the last welcome notice version the user acknowledged. */
const WELCOME_NOTICE_ACK_FIELD = "welcomeNoticeVersion";
/**
* Bump only when the notice changes materially and every user should see it
* again. The acknowledgement is compared for exact equality.
*/
const WELCOME_NOTICE_VERSION = "2026-09-28.1";
