// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/toolviews/file-mutation-row.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

const FILE_MUTATION_ICON = (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular, { size: 14 });
const CONTENT_FIELDS = [
	"content",
	"old_string",
	"new_string"
];
const KILOBYTE = 1024;
/** Kilobytes of decoded input at every stage; null before any content field arrives. */
function contentKilobytes(block) {
	const { args } = block;
	const open = CONTENT_FIELDS.find((key) => args.has(key) && !args.complete(key));
	const completed = CONTENT_FIELDS.reduce((total, key) => key !== open && args.complete(key) ? total + (args.stringLength(key, { step: KILOBYTE }) ?? 0) : total, 0);
	if (open === void 0) return CONTENT_FIELDS.some((key) => args.has(key)) ? Math.ceil(completed / KILOBYTE) : null;
	const chars = completed + (args.stringLength(open, {
		step: KILOBYTE,
		offset: completed
	}) ?? 0);
	return Math.ceil(chars / KILOBYTE);
}
/**
* Shows the path and decoded input size through preparation, execution, and
* settlement, with the applied diff available once the call settles.
*/
function FileMutationRow({ toolName, block, cwd, home, openFile, useContextMenu, sessionId, resolveFilePath, inspect, useDisclosure, t }) {
	const { getTriggerProps } = useContextMenu();
	const model = toolRowModel(toolName, block, cwd, home);
	const path = model.filePath;
	const diff = diffCardModel(block);
	const kilobytes = contentKilobytes(block);
	const size = kilobytes === null ? null : t("tool.preparing.content", { kilobytes });
	return (0, react_jsx_runtime.jsx)(ToolRow, {
		fileContextMenuProps: getTriggerProps(path === void 0 ? void 0 : () => ({
			kind: "file",
			value: {
				sessionId,
				path: resolveFilePath(path)
			}
		})),
		useDisclosure,
		t,
		variant: model.variant,
		toolName,
		icon: FILE_MUTATION_ICON,
		title: t(model.titleKey),
		summary: model.summary,
		summarySuffix: size !== null && model.summary !== "" ? size : void 0,
		output: model.output,
		errorSummary: model.errorSummary,
		diff,
		state: model.state,
		filePath: model.filePath,
		onOpenFile: openFile,
		inspect
	});
}
/** Registers file-mutation conversation rows. */
const fileMutationToolview = {
	name: "file-mutation-toolview",
	inject: ["slots", "sessions"],
	apply(ctx) {
		ctx.slots.inject("tool.call.toolview", function* () {
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "apply_patch",
				locale: CONVERSATION_NS,
				inject: toolFileInject(ctx)
			}, FileMutationRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "edit",
				locale: CONVERSATION_NS,
				inject: toolFileInject(ctx)
			}, FileMutationRow);
			yield ctx.slots.register({
				name: "tool.call.toolview",
				key: "write",
				locale: CONVERSATION_NS,
				inject: toolFileInject(ctx)
			}, FileMutationRow);
		});
	}
};
