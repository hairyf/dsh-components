// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/toolviews/details-row.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Keyed recorded-result rows sharing the compact detail body. */
const LSP_TITLE_KEYS = {
	goToDefinition: "tool.title.findDefinition",
	findReferences: "tool.title.findReferences",
	goToImplementation: "tool.title.findImplementation",
	hover: "tool.title.hoverSymbol"
};
/** Teammate-coordination tools presented with the two-person team icon. */
const TEAMMATE_TOOLS = new Set([
	"spawn_teammate",
	"list_agents",
	"send_message",
	"interrupt_agent",
	"wait_agent"
]);
function detailIcon(toolName) {
	if (TEAMMATE_TOOLS.has(toolName)) return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconUsersOutlineRegular, { size: 14 });
	if (toolName.startsWith("schedule_")) return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, { size: 14 });
	if (toolName.endsWith("_goal")) return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconGoalOutlineRegular, { size: 14 });
	if (toolName.startsWith("cordis_")) return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCordisPluginOutlineRegular, {});
	if (toolName.startsWith("terminal_")) return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCodeOutlineRegular, { size: 14 });
	if (toolName.startsWith("session_") || toolName === "lsp") return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutlineRegular, { size: 14 });
	if (toolName.startsWith("job_") || toolName.startsWith("team_task_")) return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChecklistOutlineRegular, {});
	if (toolName === "workflow" || toolName === "ralph") return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBranchOutlineRegular, { size: 14 });
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconAgentPresetOutlineRegular, { size: 14 });
}
/**
* Present recorded entities, receipts, and report fields in the existing expandable row.
* @param props - Tool call, row actions, and locale supplied by the keyed slot.
* @returns A Tool row with structured details or generic input/output.
*/
function DetailsRow({ toolName, block, cwd, home, openFile, inspect, useDisclosure, t }) {
	const model = toolRowModel(toolName, block, cwd, home);
	const locale = document.documentElement.lang;
	const details = (0, react.useMemo)(() => detailsCardModel(block, t, locale), [
		block,
		t,
		locale
	]);
	const operation = toolName === "lsp" ? parsedToolCall(block)?.args.operation : void 0;
	const titleKey = typeof operation === "string" && Object.hasOwn(LSP_TITLE_KEYS, operation) ? LSP_TITLE_KEYS[operation] : model.titleKey;
	return (0, react_jsx_runtime.jsx)(ToolRow, {
		useDisclosure,
		t,
		variant: model.variant,
		toolName,
		icon: detailIcon(toolName),
		title: t(titleKey),
		summary: details?.summary ?? details?.items[0]?.title ?? details?.empty ?? model.summary,
		details,
		bodyRaw: model.bodyRaw,
		output: model.output,
		errorSummary: model.errorSummary,
		state: model.state,
		inspect,
		onOpenFile: openFile
	});
}
/** Register recorded-result details through the standard atomic Tool slot. */
const detailsToolview = {
	name: "details-toolview",
	inject: ["slots"],
	apply(ctx) {
		ctx.slots.inject("tool.call.toolview", function* () {
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "create_goal",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "get_goal",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "update_goal",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "schedule_create",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "schedule_list",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "schedule_view",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "schedule_edit",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "schedule_delete",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "schedule_update",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "cordis_inspect_list",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "cordis_inspect_query",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "cordis_inspect_self",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "workflow",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "ralph",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "session_event_read",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "session_event_search",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "session_event_trace",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "session_search",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "session_trace",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "list_subagent_models",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "subagent",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "list_agents",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "send_message",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "interrupt_agent",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "job_list",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "job_output",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "job_kill",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "terminal_open",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "terminal_read",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "terminal_list",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "terminal_signal",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "terminal_close",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "lsp",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "spawn_teammate",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "team_task_create",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "team_task_get",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "team_task_update",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "team_task_list",
				locale: CONVERSATION_NS
			}, DetailsRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "wait_agent",
				locale: CONVERSATION_NS
			}, DetailsRow);
		});
	}
};
