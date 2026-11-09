// Extracted from @deepseek-ai/dsh-client-ui-subagent (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Required services for subagent presentation and navigation. */
const inject = [
	"sessions",
	"uiWorkspace",
	"slots",
	"locale",
	"sidebarRight"
];
/** Claim the composer for one-shot history or an unavailable continuation owner. */
function selectReadOnlySubagent(owner) {
	const subagent = owner.session?.subagent;
	if (subagent === void 0 || subagent === null) return null;
	if (subagent.address.mode === "unknown") return { reason: "unknown" };
	if (subagent.address.mode === "one-shot") return { reason: "one-shot" };
	if (subagent.parentAvailable !== false) return null;
	return owner.session?.running === true ? null : { reason: "parent-unavailable" };
}
/**
* Client plugin body: register the subagent catalog and read-only composer seats.
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
	}), "ui-subagent: dictionaries");
	ctx.inject(["resources", "sidebarRightTabs"], (scope) => {
		registerSidebarChat(scope, ctx.locale.bind(NS));
	});
	const catalogActions = (_parentSessionId) => ({
		openChild(address) {
			ctx.uiWorkspace.openSession(address);
		},
		openChildAside(address) {
			ctx.sidebarRight.openResource(subagentChatAddress(address), {
				kind: "subagentchat",
				preferNewPane: true
			});
		},
		refreshProjection(parentSessionId) {
			ctx.sessions.refreshProjections(parentSessionId);
		}
	});
	ctx.slots.inject("conversation.session.header.lineage", () => ctx.slots.register({
		name: "conversation.session.header.lineage",
		locale: NS,
		inject: catalogActions
	}, SubagentHeaderLineage));
	ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
		name: "conversation.session.header.actions",
		id: "subagent-catalog",
		order: 10,
		locale: NS,
		inject: catalogActions
	}, SubagentCatalogAction));
	ctx.slots.inject("conversation.composer", () => ctx.slots.register({
		name: "conversation.composer",
		priority: -10,
		locale: NS,
		select: selectReadOnlySubagent
	}, SubagentReadOnlyComposer));
}
