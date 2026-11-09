// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/models/tool-call-model.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Locale key per generic row variant. */
		const VARIANT_TITLE_KEYS = {
			search: "tool.title.search",
			read: "tool.title.read",
			bash: "tool.title.bash",
			write: "tool.title.write",
			edit: "tool.title.edit",
			code: "tool.title.code",
			others: "tool.title.generic"
		};
		/**
		* Known tool name -> variant.
		*
		* `cordis_define` is deliberately absent: ui-cordis registers a keyed
		* `tool.call.toolview` entry for it, and a keyed hit REPLACES the generic row
		* (this table is only reached through GenericToolCard, the dispatch fallback in
		* ToolCallTree). An entry here would be unreachable, and a second title for the
		* same call would be a second answer to a question the card already owns.
		*/
		const TOOL_VARIANTS = {
			bash: "bash",
			pwsh: "bash",
			read: "read",
			read_image: "read",
			web_fetch: "read",
			web_search: "search",
			grep: "search",
			glob: "search",
			write: "write",
			edit: "edit",
			apply_patch: "edit",
			run_code: "code",
			cordis_package_inspect: "read",
			cordis_runtime_inspect: "read",
			cordis_run: "others",
			cordis_stop: "others",
			cordis_undefine: "others"
		};
		/** Tool-owned titles that refine a generic row variant without replacing it. */
		const TOOL_TITLE_KEYS = {
			apply_patch: "tool.title.applyPatch",
			cordis_package_inspect: "tool.title.inspect",
			cordis_runtime_inspect: "tool.title.inspect",
			cordis_run: "tool.title.runCordis",
			cordis_stop: "tool.title.stopCordis",
			cordis_undefine: "tool.title.removeCordis",
			pwsh: "tool.title.pwsh",
			read_image: "tool.title.readImage",
			todo_write: "todo.rowTitle",
			ask_user_question: "ask.rowTitle",
			create_goal: "tool.title.createGoal",
			get_goal: "tool.title.getGoal",
			update_goal: "tool.title.updateGoal",
			schedule_create: "tool.title.createSchedule",
			schedule_list: "tool.title.listSchedules",
			schedule_view: "tool.title.viewSchedule",
			schedule_edit: "tool.title.editSchedule",
			schedule_delete: "tool.title.deleteSchedule",
			schedule_update: "tool.title.updateSchedule",
			cordis_inspect_list: "tool.title.inspectProviders",
			cordis_inspect_query: "tool.title.queryRuntime",
			cordis_inspect_self: "tool.title.inspectPlugins",
			workflow: "tool.title.workflow",
			ralph: "tool.title.ralph",
			session_event_read: "tool.title.readEvent",
			session_event_search: "tool.title.searchEvents",
			session_event_trace: "tool.title.traceEvent",
			session_search: "tool.title.searchSessions",
			session_trace: "tool.title.traceSession",
			list_subagent_models: "tool.title.listModels",
			subagent: "tool.title.subagent",
			list_agents: "tool.title.listAgents",
			send_message: "tool.title.sendMessage",
			interrupt_agent: "tool.title.interruptAgent",
			job_list: "tool.title.listJobs",
			job_output: "tool.title.readJob",
			job_kill: "tool.title.killJob",
			terminal_open: "tool.title.openTerminal",
			terminal_read: "tool.title.readTerminal",
			terminal_list: "tool.title.listTerminals",
			terminal_signal: "tool.title.signalTerminal",
			terminal_close: "tool.title.closeTerminal",
			lsp: "tool.title.lsp",
			spawn_teammate: "tool.title.spawnTeammate",
			team_task_create: "tool.title.createTeamTask",
			team_task_get: "tool.title.getTeamTask",
			team_task_update: "tool.title.updateTeamTask",
			team_task_list: "tool.title.listTeamTasks",
			wait_agent: "tool.title.waitAgent"
		};
		/**
		* Classify a tool name into its row variant.
		* @param toolName - wire tool name.
		* @returns matching variant, others when unknown.
		*/
		function classifyTool(toolName) {
			return TOOL_VARIANTS[toolName] ?? "others";
		}
		/**
		* Select a tool-owned or generic title without reading arguments.
		* @param toolName - wire tool name.
		* @returns the localized title key.
		*/
		function toolTitleKey(toolName) {
			return TOOL_TITLE_KEYS[toolName] ?? VARIANT_TITLE_KEYS[classifyTool(toolName)];
		}
		function deriveAutoReviewDenial(block) {
			if (!("kind" in block) || !block.isError) return null;
			const error = block.error;
			if (error?.name !== "AutoReviewDeniedError" || error.code !== "AUTO_REVIEW_DENIED") return null;
			return { reason: typeof error.reason === "string" ? error.reason : null };
		}
		/**
		* Flatten a settled result's content blocks to display text: text blocks
		* verbatim, other block shapes as pretty JSON. Empty content on a failed call
		* falls back to the structured error's `name: code` line.
		* @param node - the settled result node.
		* @returns the flattened result text (may be empty).
		*/
		function resultText(node) {
			const parts = [];
			for (const block of node.content) if (block.type === "text") parts.push(block.text);
			else parts.push(JSON.stringify(block, null, 2));
			if (parts.length === 0 && node.error !== void 0) parts.push(`${node.error.name}: ${node.error.code}`);
			return parts.join("\n");
		}
		function parseArgs(argsRaw) {
			try {
				return JSON.parse(argsRaw);
			} catch {
				return;
			}
		}
		function firstLine(text) {
			const nl = text.indexOf("\n");
			return nl === -1 ? text : text.slice(0, nl);
		}
		function pickString(args, keys) {
			for (const key of keys) {
				const v = args[key];
				if (typeof v === "string" && v !== "") return v;
			}
		}
		/** Summary key preference per variant (args-derived; result-derived summaries are a ledger item). */
		const SUMMARY_KEYS = {
			bash: ["description", "command"],
			read: [
				"path",
				"file_path",
				"url"
			],
			search: [
				"query",
				"pattern",
				"url"
			],
			write: ["path", "file_path"],
			edit: ["path", "file_path"],
			code: ["description"],
			others: []
		};
		function deriveSummary(variant, argsRaw) {
			const parsed = parseArgs(argsRaw);
			if (typeof parsed !== "object" || parsed === null) return firstLine(argsRaw);
			const args = parsed;
			if (variant === "search" && Array.isArray(args.queries)) {
				const queries = args.queries.filter((query) => typeof query === "string" && query !== "");
				if (queries.length > 0) return queries.map(firstLine).join(", ");
			}
			const picked = pickString(args, SUMMARY_KEYS[variant]);
			if (picked !== void 0) return firstLine(picked);
			for (const v of Object.values(args)) if (typeof v === "string" && v !== "") return firstLine(v);
			return firstLine(argsRaw);
		}
		/** Path keys only — never `url` (web_fetch lands on the read variant). */
		const FILE_PATH_KEYS = ["path", "file_path"];
		/** File-tool variants whose summary may be an openable workspace path. */
		const FILE_PATH_VARIANTS = new Set([
			"read",
			"write",
			"edit"
		]);
		/**
		* Summary material read the same way at every stage from the argument view: a
		* complete `file_path` for file tools, otherwise the `description` text so far.
		* Empty when the view carries neither, so the caller falls back to the raw text.
		*/
		function argumentSummary(variant, args, cwd, home) {
			if (FILE_PATH_VARIANTS.has(variant)) {
				const path = args.complete("file_path") ? args.text("file_path") : void 0;
				const filePath = path !== void 0 && path !== "" && args.complete("file_path") ? firstLine(path) : void 0;
				return {
					summary: filePath === void 0 ? "" : abbreviateHomePath(relativizeToCwd(filePath, cwd), home),
					filePath
				};
			}
			const description = args.text("description");
			return {
				summary: description === void 0 ? "" : firstLine(description),
				filePath: void 0
			};
		}
		function deriveFilePath(variant, argsRaw) {
			if (!FILE_PATH_VARIANTS.has(variant)) return void 0;
			const parsed = parseArgs(argsRaw);
			if (typeof parsed !== "object" || parsed === null) return void 0;
			const picked = pickString(parsed, FILE_PATH_KEYS);
			return picked === void 0 ? void 0 : firstLine(picked);
		}
		/**
		* Format one argument payload when its generic input body becomes visible.
		* @param variant - row presentation selected for the Tool name.
		* @param argsRaw - original argument JSON or incomplete raw text.
		* @returns display body, or null for empty input.
		*/
		function formatToolBody(variant, argsRaw) {
			if (argsRaw === "") return null;
			const parsed = parseArgs(argsRaw);
			if (parsed === void 0) return argsRaw;
			if (variant === "code" && typeof parsed === "object" && parsed !== null) {
				const code = parsed.code;
				if (typeof code === "string" && code !== "") return code;
			}
			return JSON.stringify(parsed, null, 2);
		}
		/**
		* Derive the full row model from a frozen call slice.
		* @param toolName - wire tool name (dispatch-supplied; survives windowless results).
		* @param block - preparing call, dispatched call, or result from the snapshot.
		* @param cwd - session workspace root; workspace-rooted path summaries display relative to it.
		* @param home - host account home; a leftover POSIX home path displays as `~`.
		* @returns the row model.
		*/
		function toolRowModel(toolName, block, cwd, home) {
			const variant = classifyTool(toolName);
			const titleKey = toolTitleKey(toolName);
			const done = "kind" in block;
			const argsRaw = done ? block.call?.argsRaw ?? "" : block.phase === "start" ? block.argsRaw : null;
			const stopped = done && typeof block.meta === "object" && block.meta !== null && !Array.isArray(block.meta) && block.meta.stopped === true;
			const primary = argumentSummary(variant, block.args, cwd, home);
			const argumentPath = primary.filePath ?? (argsRaw === null ? void 0 : deriveFilePath(variant, argsRaw));
			const recordedPath = done ? recordedAbsolutePath(block.meta, "path") : void 0;
			const canUseArgumentPath = argumentPath !== void 0 && (isAbsoluteWorkspacePath(argumentPath) || done && !block.isError && block.parentCallId === void 0);
			const filePath = argumentPath === void 0 ? void 0 : recordedPath ?? (canUseArgumentPath ? argumentPath : void 0);
			const state = !done ? block.phase === "preparing" ? "preparing" : "running" : block.error?.code === "interrupted" ? "stopped" : block.isError || stopped ? "error" : "ok";
			const base = toolName === "apply_patch" ? "" : primary.summary !== "" || argsRaw === null ? primary.summary : argsRaw === "" ? block.callId : abbreviateHomePath(relativizeToCwd(deriveSummary(variant, argsRaw), cwd), home);
			const summary = [titleKey === "tool.title.generic" ? toolName : "", base].filter(Boolean).join(" · ");
			const output = done ? resultText(block) || null : null;
			const errorSummary = state === "error" && output !== null ? firstLine(output) : null;
			return {
				variant,
				titleKey,
				summary,
				filePath,
				bodyRaw: argsRaw === "" ? null : argsRaw,
				output,
				errorSummary,
				autoReviewDenial: deriveAutoReviewDenial(block),
				state
			};
		}
