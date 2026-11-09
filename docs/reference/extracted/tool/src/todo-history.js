// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/models/todo-history.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Durable writes are indexed independently of Tool success receipts. */
const todoWriteDefinition = {
	kind: "tool-todo-write",
	match: (event) => event.type === "todo/write" ? {
		id: String(event.seq),
		role: "start"
	} : null,
	start: (_context, match) => {
		if (match.event.type !== "todo/write") throw new Error("tool-todo-write requires todo/write");
		return match.event.data.todos;
	},
	update: (context) => context.state,
	publication: () => "none"
};
/** Invocation predecessors are repaired by the assembler when older history arrives. */
const todoCallDefinition = {
	kind: "tool-todo-call",
	target: "tool-todo-history",
	match: (event) => {
		if (event.type === "tool/call" && event.data.name === "todo_write") return {
			id: String(event.data.callId),
			role: "start"
		};
		if (event.type === "tool/ptc-dispatch-start" && event.data.name === "todo_write") return {
			id: String(event.data.subCallId),
			role: "start"
		};
		return null;
	},
	start: (_context, _match, reader) => ({ todos: reader.previous("tool-todo-write")?.state }),
	update: (context) => context.state,
	buildViewNode: (context) => context.state === void 0 ? null : {
		key: context.key,
		kind: context.kind,
		id: context.id,
		target: "tool-todo-history",
		data: context.state
	}
};
/** Incremental lookup snapshots preserve earlier call baselines across later writes. */
const todoHistoryView = {
	target: "tool-todo-history",
	create: () => {
		let calls = /* @__PURE__ */ new Map();
		return {
			empty: calls,
			replace: ({ nodes }) => calls = new Map(nodes.map((node) => [node.id, node.data])),
			apply: ({ upserts }) => {
				if (upserts.length > 0) {
					calls = new Map(calls);
					for (const node of upserts) calls.set(node.id, node.data);
				}
				return calls;
			}
		};
	}
};
/**
* Install the recorded-write index and call predecessor target.
* @param ctx - Tool presentation plugin context.
*/
function registerTodoHistory(ctx) {
	ctx.uiConversation.events.register(todoWriteDefinition);
	ctx.uiConversation.events.register(todoCallDefinition);
	ctx.uiConversation.views.register(todoHistoryView);
}
