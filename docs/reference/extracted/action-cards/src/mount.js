// Extracted from @deepseek-ai/dsh-client-ui-action-cards (lib/client.js); region lib/types/client/mount.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Registries available before this plugin mounts its Remote. */
const inject = [
	"slots",
	"locale",
	"remote"
];
/**
* Provide the body registry, then mount the Remote and the UI for the same plugin lifetime.
* @param ctx - Client plugin context.
* @param contribution - Generated Remote descriptors supplied by the built entry.
* @returns disposer removing the UI before the Remote contribution.
*/
async function mountActionCards(ctx, contribution) {
	const registry = new ActionCardRegistry(ctx);
	ctx.reflect.provide("actionCards", registry);
	const unmount = await ctx.remote.$mount(contribution);
	const ui = ctx.inject(["remote.actionCards"], (inner) => {
		registerUi(inner, registry);
	});
	try {
		await ui;
	} catch (error) {
		await ui.dispose();
		await unmount();
		throw error;
	}
	return async () => {
		await ui.dispose();
		await unmount();
	};
}
function registerUi(ctx, registry) {
	ctx.effect(() => ctx.locale.register("actionCards", {
		en,
		zh,
		ja,
		es,
		fr,
		de,
		ru,
		pt
	}), "action-cards: locale");
	ctx.slots.inject("conversation.chat.turnTail", () => ctx.slots.register({
		name: "conversation.chat.turnTail",
		id: "@deepseek-ai/dsh-client-ui-action-cards",
		locale: "actionCards",
		inject: (sessionId) => ({
			sessionId,
			hooks: { bodies: registry.source },
			bind: (locale) => ctx.locale.bind(locale),
			act: async (callId, verb, payload) => {
				const result = await ctx.remote.actionCards.act(sessionId, callId, verb, payload);
				return result.ok ? result.value : void 0;
			}
		})
	}, ActionCardTail));
	ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
		name: "tool.call.toolview",
		key: "propose_action",
		locale: "actionCards"
	}, ProposeRow));
}
