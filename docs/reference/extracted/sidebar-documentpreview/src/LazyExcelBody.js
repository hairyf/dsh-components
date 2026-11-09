// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/excel/LazyExcelBody.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Load the spreadsheet renderer only when a supported workbook is opened. */
const LoadedExcelBody = (0, react.lazy)(async () => ({ default: (await require.async("./client.excel.js")).ExcelBody }));
/**
* Load the browser spreadsheet renderer for every registered format.
* @param props - Complete file bytes and standard document seats.
* @returns Localized loading state or Excel preview.
*/
function LazyExcelBody(props) {
	const format = excelFormat(hostFileOf(props.resourceAddress).path);
	const loading = (0, react_jsx_runtime.jsx)(LoadingIndicator, { label: props.t("loading") });
	return (0, react_jsx_runtime.jsx)(react.Suspense, {
		fallback: loading,
		children: (0, react_jsx_runtime.jsx)(LoadedExcelBody, {
			...props,
			format,
			loading
		})
	});
}
