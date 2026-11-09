// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/index.js); region lib/types/contact-config.js
// Cross-bundle variant: the bundler tree-shook this source file differently per entry. The lib/client.js variant is the primary file.
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Public contact and bonus notice options shared by Host and Client. */
/** Validate public questionnaire options. */
const ContactConfigFields = {
	contactFormUrl: z.string().pattern(/^https:\/\/[^/\s]+\//).default("https://trtgsjkv6r.feishu.cn/share/base/form/shrcnlCoGElW7MQznGy9r3YYXcg?hide_uid=1&hide_device_info=1&hide_harness_version=1"),
	contactSource: z.string().default(""),
	bonusAckRetryDelayMs: z.number().min(1).default(1e3),
	bonusAckRetryMaxDelayMs: z.number().min(1).default(6e4)
};
z.object(ContactConfigFields);
/** Bootstrap key containing no account credentials. */
const CONTACT_CONFIG_GLOBAL = "__DSH_CONTACT_CONFIG__";
