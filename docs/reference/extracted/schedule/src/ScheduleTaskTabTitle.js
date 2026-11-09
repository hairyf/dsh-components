// Extracted from @deepseek-ai/dsh-client-ui-schedule (lib/client.js); region lib/types/client/ScheduleTaskTabTitle.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render the clock glyph and the named task's stored title as the chip text.
* @param props - tab information, the Host task catalog, the tab bindings, and localized copy.
* @returns the clock glyph followed by the task's stored title, or the detail label without a catalog row.
*/
function ScheduleTaskTabTitle({ sessionId, useTabInfo, useCatalog, taskBindings, t }) {
	const { tab } = useTabInfo();
	const { params } = useTaskTabTarget(sessionId, tab, taskBindings);
	const records = useCatalog((snapshot) => snapshot.records);
	const record = params === void 0 ? void 0 : records.find((item) => item.id === params.id);
	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, {
		size: 16,
		className: TaskManagerPage_module_css_default.tabTitleIcon
	}), record === void 0 ? t("detail.label") : taskName(record)] });
}
