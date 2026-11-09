// Extracted from @deepseek-ai/dsh-client-ui-secret-mask (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Required services: the copy, the node renderer registry, and the UserText rule registry. */
const inject = [
	"locale",
	"slots",
	"uiConversation"
];
/**
* Register the dictionaries, the credential matcher, and its node renderer.
* @param ctx - client root context.
*/
function apply(ctx) {
	ctx.effect(() => ctx.locale.register(NS, {
		zh,
		en,
		ja,
		es,
		fr,
		de,
		ru,
		pt
	}), "ui-secret-mask: dictionaries");
	ctx.uiConversation.userText.register(createSecretRule());
	ctx.slots.inject("conversation.user.text.node", () => ctx.slots.register({
		name: "conversation.user.text.node",
		key: "secret",
		priority: 100,
		locale: NS
	}, SecretText));
}
