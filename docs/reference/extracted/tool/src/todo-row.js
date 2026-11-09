// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/toolviews/todo-row.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		function isItem(value) {
			return typeof value === "object" && value !== null;
		}
		function summarize(argsRaw, t) {
			if (argsRaw === null) return null;
			let parsed;
			try {
				parsed = JSON.parse(argsRaw);
			} catch {
				return null;
			}
			if (typeof parsed !== "object" || parsed === null) return null;
			const todos = parsed.todos;
			if (!Array.isArray(todos) || !todos.every(isItem)) return null;
			const { done, total, activeContent, activeExtra } = planSummary(todos);
			const head = t("todo.completed", {
				done,
				total
			});
			return {
				text: activeContent === null ? head : `${head} · ${activeContent}`,
				extra: activeExtra
			};
		}
		/** Summarizes a plan update without presenting a cancelled call as completed. */
		function TodoRow({ toolName, block, inspect, useDisclosure, useTodoHistory, useSession, t }) {
			const baseline = useTodoHistory((snapshot) => snapshot?.get(block.callId));
			const hasMore = useSession((snapshot) => snapshot.hasMore);
			const diff = (0, react.useMemo)(() => todoDiffModel(block, baseline, hasMore, t), [
				block,
				baseline,
				hasMore,
				t
			]);
			const model = toolRowModel(toolName, block);
			const summary = summarize(model.bodyRaw, t) ?? {
				text: model.summary,
				extra: 0
			};
			return (0, react_jsx_runtime.jsx)(ToolRow, {
				useDisclosure,
				t,
				variant: model.variant,
				toolName,
				icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChecklistOutlineRegular, {}),
				title: t(model.titleKey),
				summary: summary.text,
				summarySuffix: [diff?.summary, summary.extra > 0 ? `+${summary.extra}` : null].filter((part) => part !== null && part !== void 0).join(" · ") || null,
				bodyRaw: model.bodyRaw,
				output: model.output,
				details: diff?.details,
				errorSummary: model.errorSummary,
				state: model.state,
				inspect
			});
		}
		/** Registers the todo conversation row. */
		const todoToolview = {
			name: "todo-toolview",
			inject: ["slots", "uiConversation"],
			apply(ctx) {
				registerTodoHistory(ctx);
				ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
					name: "tool.call.toolview",
					key: "todo_write",
					locale: CONVERSATION_NS,
					inject: (sessionId) => ({ hooks: { todoHistory: ctx.uiConversation.binding(sessionId).target("tool-todo-history") } })
				}, TodoRow));
			}
		};
