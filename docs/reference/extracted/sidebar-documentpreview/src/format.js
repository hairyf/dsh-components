// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/excel/format.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Filename-to-parser selection kept outside the heavy spreadsheet chunk. */
/**
* Resolve a registered filename to its parser.
* @param path - Decoded file path.
* @returns The supported suffix; rejects unsupported filenames.
*/
function excelFormat(path) {
	const suffix = path.slice(path.lastIndexOf(".") + 1).toLowerCase();
	if (suffix === "xlsx" || suffix === "xls" || suffix === "csv" || suffix === "tsv") return suffix;
	throw new ExcelPreviewError("invalid");
}
