// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/toolviews/web-row.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

const WEB_TITLE_KEYS = {
	web_search: "tool.title.webSearch",
	web_fetch: "tool.title.webFetch"
};
/** Lets users expand a completed web search or fetch result. */
function WebRow({ toolName, block, useContextMenu, sessionId, inspect, useDisclosure, t }) {
	const { getTriggerProps } = useContextMenu();
	const href = webFetchHref(block);
	const model = toolRowModel(toolName, block);
	const web = webCardModel(block);
	const icon = toolName === "web_fetch" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBrowseOutlineRegular, { size: 14 }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconGlobeOutlineRegular, { size: 14 });
	return (0, react_jsx_runtime.jsx)(ToolRow, {
		urlContextMenuProps: getTriggerProps(href === void 0 ? void 0 : {
			kind: "url",
			value: {
				sessionId,
				url: href
			}
		}),
		useDisclosure,
		t,
		variant: model.variant,
		toolName,
		icon,
		title: t(toolName === "web_search" ? WEB_TITLE_KEYS.web_search : toolName === "web_fetch" ? WEB_TITLE_KEYS.web_fetch : model.titleKey),
		summary: model.summary,
		output: model.output,
		errorSummary: model.errorSummary,
		web,
		href,
		state: model.state,
		inspect
	});
}
/** Registers the web search and fetch conversation rows. */
const webToolview = {
	name: "web-toolview",
	inject: ["slots"],
	apply(ctx) {
		ctx.slots.inject("tool.call.toolview", function* () {
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "web_search",
				locale: CONVERSATION_NS
			}, WebRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "web_fetch",
				locale: CONVERSATION_NS
			}, WebRow);
		});
	}
};
