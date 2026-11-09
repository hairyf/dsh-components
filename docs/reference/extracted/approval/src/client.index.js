// Extracted from @deepseek-ai/dsh-client-ui-approval (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Required services: Agent scopes, Remote Events, Session UI, Slot registry, and copy. */
const inject = [
	"sessions",
	"remote",
	"uiSession",
	"slots",
	"locale"
];
const NS = "approval";
/** Present one request until the user answers or its lifetime ends. */
async function answerApproval(ctx, owner, request, next, registerPendingInteraction) {
	const sessionId = ctx.sessions.scopeOf(owner);
	if (sessionId === void 0) return next();
	const pending = new PendingApproval(sessionId, {
		toolName: request.toolName,
		...request.callId === void 0 ? {} : { callId: request.callId },
		...request.reason === void 0 ? {} : { reason: request.reason },
		...request.displayReason === void 0 ? {} : { displayReason: request.displayReason },
		...request.signal === void 0 ? {} : { signal: request.signal }
	});
	const completed = Promise.withResolvers();
	const remove = registerPendingInteraction(pending, async () => {
		pending.delegate();
		await completed.promise;
	});
	try {
		try {
			return await pending.result;
		} catch (error) {
			if (pending.isDelegation(error)) return await next();
			throw error;
		}
	} finally {
		remove();
		completed.resolve();
	}
}
/**
* Install approval copy and the scoped waterfall consumer.
* @param ctx - Client root context.
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
	}), "ui-approval: dictionaries");
	ctx.inject(["shortcuts"], (scope) => {
		const t = ctx.locale.bind(NS);
		scope.effect(() => scope.shortcuts.registerFixed({
			id: "approval.allow",
			label: () => t("allow"),
			keys: ["Enter"],
			bindings: [{
				code: "Enter",
				modifiers: []
			}],
			group: "approval"
		}), "ui-approval: fixed allow reference");
		scope.effect(() => scope.shortcuts.registerFixed({
			id: "approval.reject",
			label: () => t("reject"),
			keys: ["Esc"],
			bindings: [{
				code: "Escape",
				modifiers: []
			}],
			group: "approval"
		}), "ui-approval: fixed reject reference");
	});
	const registerPendingInteraction = ctx.uiSession.registerPendingInteraction(() => 0);
	ctx.slots.registerFactory({
		name: "conversation.approval.card",
		scope: "session",
		locale: NS,
		children: { "conversation.approval.detail": {
			kind: "single",
			scope: "session"
		} }
	}, ApprovalCard);
	ctx.slots.inject("conversation.composer", () => ctx.slots.register({
		name: "conversation.composer",
		priority: 1,
		select: ({ pendingInteraction }) => pendingInteraction instanceof PendingApproval ? pendingInteraction : null,
		locale: NS,
		inject: () => ({ resolveReason: (reason) => ctx.locale.resolveText(reason) })
	}, ApprovalPanel));
	ctx.remote.$on("approval/request", function(request, next) {
		return answerApproval(ctx, this, request, next, registerPendingInteraction);
	});
}
