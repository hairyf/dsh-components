// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/excel/error.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Locale-independent spreadsheet parser failure categories. */
var ExcelPreviewError = class extends Error {
	code;
	/** @param code - User-actionable parser failure. */
	constructor(code, options) {
		super(code, options);
		this.code = code;
		this.name = "ExcelPreviewError";
	}
};
