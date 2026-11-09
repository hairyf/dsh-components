// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.pdf.js); region lib/types/client/pdf/errors.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Structured PDF worker failures; the renderer's locale owns visible explanations. */
var PdfWorkerFailure = class extends Error {
	/** Distinguishes Worker startup/transport failures from document parsing errors. */
	kind = "worker";
	/** @param cause - native error or messageerror event, retained for diagnostics. */
	constructor(cause) {
		super(void 0, { cause });
		this.name = "PdfWorkerFailure";
	}
};
