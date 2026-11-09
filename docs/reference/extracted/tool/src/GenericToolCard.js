// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/toolviews/GenericToolCard.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Variant leading icons (figma table); all glyphs render at 14 inside the 16px leading box. */
const VARIANT_ICONS = {
	search: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutlineRegular, { size: 14 }),
	read: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBrowseOutlineRegular, { size: 14 }),
	bash: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconApiOutlineRegular, { size: 14 }),
	write: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular, { size: 14 }),
	edit: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular, { size: 14 }),
	code: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCodeOutlineRegular, { size: 14 }),
	others: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSparkleRegular, { size: 14 })
};
/** @param props - current tool stage and locale. @returns its preparation or dispatched card. */
function GenericToolCard({ toolName, block, cwd, home, openFile, getFileTriggerProps, inspect, useDisclosure, t }) {
	const model = toolRowModel(toolName, block, cwd, home);
	const autoReview = model.autoReviewDenial === null ? null : localizeAutoReviewDenial(model.autoReviewDenial, t);
	const terminal = terminalCardModel(block, cwd);
	const read = readCardModel(block, cwd, home);
	const diff = diffCardModel(block);
	const search = searchCardModel(block);
	const web = webCardModel(block);
	const state = model.state === "ok" && terminal !== null && terminalFailed(terminal) ? "error" : model.state;
	const singleFile = model.filePath !== void 0;
	return (0, react_jsx_runtime.jsx)(ToolRow, {
		fileContextMenuProps: model.filePath === void 0 ? void 0 : getFileTriggerProps(model.filePath),
		useDisclosure,
		t,
		variant: model.variant,
		toolName,
		icon: VARIANT_ICONS[model.variant],
		title: t(model.titleKey),
		summary: model.summary,
		bodyRaw: singleFile || autoReview !== null ? null : model.bodyRaw,
		output: autoReview?.output ?? model.output,
		errorSummary: autoReview?.summary ?? model.errorSummary,
		terminal,
		diff,
		read,
		search,
		web,
		state,
		filePath: model.filePath,
		onOpenFile: singleFile ? openFile : void 0,
		inspect
	});
}
