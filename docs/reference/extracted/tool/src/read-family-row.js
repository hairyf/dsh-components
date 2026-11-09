// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/toolviews/read-family-row.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Compose a read-family row: the shared chrome and model-derived fields, plus the
* caller's card material.
* @param props - the toolview runtime share and locale seat.
* @param card - the card props this row owns.
* @param getTriggerProps - ordinary menu bindings supplied by the toolview Slot.
* @returns the assembled ToolRow.
*/
function readFamilyRow({ toolName, block, cwd, home, openFile, resolveFilePath, sessionId, inspect, useDisclosure, t }, card, getTriggerProps) {
	const model = toolRowModel(toolName, block, cwd, home);
	const path = model.filePath;
	return (0, react_jsx_runtime.jsx)(ToolRow, {
		fileContextMenuProps: getTriggerProps(path === void 0 ? void 0 : () => ({
			kind: "file",
			value: {
				sessionId,
				path: resolveFilePath(path),
				...card.filePathLine === void 0 ? {} : { line: card.filePathLine }
			}
		})),
		useDisclosure,
		t,
		variant: model.variant,
		toolName,
		icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBrowseOutlineRegular, { size: 14 }),
		title: t(model.titleKey),
		summary: model.summary,
		bodyRaw: null,
		output: model.output,
		errorSummary: model.errorSummary,
		...card,
		state: model.state,
		filePath: model.filePath,
		onOpenFile: openFile,
		inspect
	});
}
