// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/contact-config.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Public contact and bonus notice options shared by Host and Client. */
/** Validate public questionnaire options. */
const ContactConfigFields = {
	contactFormUrl: Schema.string().pattern(/^https:\/\/[^/\s]+\//).default("https://trtgsjkv6r.feishu.cn/share/base/form/shrcnlCoGElW7MQznGy9r3YYXcg?hide_uid=1&hide_device_info=1&hide_harness_version=1"),
	contactSource: Schema.string().default(""),
	bonusAckRetryDelayMs: Schema.number().min(1).default(1e3),
	bonusAckRetryMaxDelayMs: Schema.number().min(1).default(6e4)
};
/** Validate public questionnaire options. */
const ContactConfig = Schema.object(ContactConfigFields);
