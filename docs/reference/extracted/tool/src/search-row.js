// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/toolviews/search-row.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

const SEARCH_TITLE_KEYS = {
	grep: "tool.title.grep",
	glob: "tool.title.glob"
};
/** Lets users expand grep or glob results and recover capped searches. */
function SearchRow({ toolName, block, inspect, useDisclosure, t }) {
	const model = toolRowModel(toolName, block);
	const search = searchCardModel(block);
	return (0, react_jsx_runtime.jsx)(ToolRow, {
		useDisclosure,
		t,
		variant: model.variant,
		toolName,
		icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutlineRegular, { size: 14 }),
		title: t(toolName === "grep" ? SEARCH_TITLE_KEYS.grep : toolName === "glob" ? SEARCH_TITLE_KEYS.glob : model.titleKey),
		summary: model.summary,
		output: model.output,
		errorSummary: model.errorSummary,
		search,
		state: model.state,
		inspect
	});
}
/** Registers the grep and glob conversation rows. */
const searchToolview = {
	name: "search-toolview",
	inject: ["slots"],
	apply(ctx) {
		ctx.slots.inject("tool.call.toolview", function* () {
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "grep",
				locale: CONVERSATION_NS
			}, SearchRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "glob",
				locale: CONVERSATION_NS
			}, SearchRow);
		});
	}
};
