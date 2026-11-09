// Extracted from @deepseek-ai/dsh-client-ui-workflow-run (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Browser plugin for durable workflow-run Conversation Nodes. */
/** Required services for Definition, keyed renderer, navigation, and copy. */
const inject = [
	"uiConversation",
	"uiWorkspace",
	"slots",
	"sessions",
	"locale"
];
/** Register the workflow Definition, dictionary, and keyed Chat renderer. */
function apply(ctx) {
	ctx.uiConversation.events.register(workflowRunDefinition);
	ctx.effect(() => ctx.locale.register(NS, {
		zh,
		en,
		ja,
		es,
		fr,
		de,
		ru,
		pt
	}), "ui-workflow-run: dictionaries");
	ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
		name: "conversation.chat.node",
		key: "workflow-run",
		locale: NS,
		inject: () => ({ openSession: (target) => {
			ctx.uiWorkspace.openSession(target);
		} })
	}, WorkflowRunPanel));
}
