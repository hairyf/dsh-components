// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/skeleton/TodoPanel.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Local exhaustiveness helper — client packages do not depend on `dsh-llm`. */
		/* v8 ignore next 3 -- closed-union backstop; only reached if status is forged */
		function assertNever(value) {
			throw new Error(`unreachable todo status: ${String(value)}`);
		}
		/** Map Todo lifecycle state onto the shared compact status language. */
		function statusDotState(status) {
			switch (status) {
				case "completed": return "done";
				case "in_progress": return "ongoing";
				case "pending": return "idle";
				/* v8 ignore next -- closed TodoItem status union */
				default: return assertNever(status);
			}
		}
		/** Return the localized status announced beside one decorative marker. */
		function statusLabel(status, t) {
			switch (status) {
				case "completed": return t("todo.status.completed");
				case "in_progress": return t("todo.status.inProgress");
				case "pending": return t("todo.status.pending");
				/* v8 ignore next -- closed TodoItem status union */
				default: return assertNever(status);
			}
		}
		/** Header summary: "·"-joined per-status counts; zero-count segments are omitted as noise (a non-empty list keeps at least one). */
		function progressLabel(todos, t) {
			const done = todos.filter((item) => item.status === "completed").length;
			const active = todos.filter((item) => item.status === "in_progress").length;
			const pending = todos.length - done - active;
			return [
				...done > 0 ? [t("todo.progress.done", { done })] : [],
				...active > 0 ? [t("todo.progress.active", { active })] : [],
				...pending > 0 ? [t("todo.progress.pending", { pending })] : []
			].join(" · ");
		}
		function TodoPanel({ todos, t }) {
			const [collapsed, setCollapsed] = (0, react.useState)(true);
			if (todos.length === 0) return null;
			return (0, react_jsx_runtime.jsx)("section", {
				className: TodoPanel_module_css_default.root,
				"data-testid": "todo-panel",
				"aria-label": t("todo.title"),
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: TodoPanel_module_css_default.body,
					children: [(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: TodoPanel_module_css_default.header,
						"aria-expanded": !collapsed,
						onClick: () => {
							setCollapsed((v) => !v);
						},
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: TodoPanel_module_css_default.lead,
								"aria-hidden": true,
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChecklistOutlineRegular, {})
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: TodoPanel_module_css_default.title,
								children: t("todo.title")
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: TodoPanel_module_css_default.progress,
								children: progressLabel(todos, t)
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: TodoPanel_module_css_default.chevron,
								"aria-hidden": true,
								children: collapsed ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})
							})
						]
					}), !collapsed && (0, react_jsx_runtime.jsx)("ul", {
						className: TodoPanel_module_css_default.list,
						children: todos.map((item) => (0, react_jsx_runtime.jsxs)("li", {
							className: TodoPanel_module_css_default.item,
							"data-status": item.status,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: TodoPanel_module_css_default.glyph,
								role: "img",
								"aria-label": statusLabel(item.status, t),
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: statusDotState(item.status) })
							}), (0, react_jsx_runtime.jsx)("span", {
								className: TodoPanel_module_css_default.content,
								children: item.content
							})]
						}, item.content))
					})]
				})
			});
		}
		/** Renders the current todo projection, or nothing when it is absent. */
		function TodoDock({ useProjection, t }) {
			return (0, react_jsx_runtime.jsx)(TodoPanel, {
				todos: useProjection("todos") ?? [],
				t
			});
		}
		/** Registers the projected todo dock. */
		const todoDockEntry = {
			name: "conversation-todo-dock",
			inject: ["slots"],
			apply(ctx) {
				ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
					name: "conversation.input.dock",
					id: "todo",
					order: 0,
					locale: NS
				}, TodoDock));
			}
		};
