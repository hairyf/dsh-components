// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.excel.js); region lib/types/client/excel/parse.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Browser lifetime for the isolated spreadsheet parser. */
/**
* Parse workbook bytes in a disposable Worker, copying the retained preview buffer.
* @param bytes - Borrowed complete file bytes.
* @param format - Format selected by the registered filename suffix.
* @param limits - File, matrix, and elapsed-time limits.
* @param signal - Document body's lifetime.
* @returns Parsed sheets; rejects with a locale key on parser failures.
*/
function parseExcel(bytes, format, limits, signal) {
	signal.throwIfAborted();
	if (bytes.byteLength > limits.maxBytes) return Promise.reject(/* @__PURE__ */ new Error("tooLarge"));
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(new Blob([_dsh_excel_worker_source_default], { type: "text/javascript" }));
		let worker;
		try {
			worker = new Worker(url, { name: "dsh-excel" });
		} catch (error) {
			URL.revokeObjectURL(url);
			reject(new Error("invalid", { cause: error }));
			return;
		}
		const finish = () => {
			clearTimeout(timer);
			signal.removeEventListener("abort", abort);
			worker.onmessage = null;
			worker.onerror = null;
			worker.onmessageerror = null;
			worker.terminate();
			URL.revokeObjectURL(url);
		};
		const abort = () => {
			finish();
			reject(new DOMException("Excel preview closed", "AbortError"));
		};
		const fail = () => {
			finish();
			reject(/* @__PURE__ */ new Error("invalid"));
		};
		const timer = setTimeout(() => {
			finish();
			reject(/* @__PURE__ */ new Error("timeout"));
		}, limits.timeoutMs);
		worker.onerror = fail;
		worker.onmessageerror = fail;
		worker.onmessage = (event) => {
			const message = event.data;
			if (typeof message !== "object" || message === null || !("ok" in message)) {
				fail();
				return;
			}
			if (message.ok === true && "value" in message && validPreview(message.value)) {
				finish();
				resolve(message.value);
			} else if (message.ok === false && "code" in message && [
				"invalid",
				"tooLarge",
				"timeout",
				"encoding"
			].includes(String(message.code))) {
				finish();
				reject(new Error(String(message.code)));
			} else fail();
		};
		signal.addEventListener("abort", abort, { once: true });
		try {
			const copy = bytes.slice();
			worker.postMessage({
				bytes: copy,
				format,
				limits
			}, [copy.buffer]);
		} catch (error) {
			finish();
			reject(new Error("invalid", { cause: error }));
		}
	});
}
function validPreview(value) {
	if (typeof value !== "object" || value === null || !("sheets" in value) || !("missingResults" in value)) return false;
	return typeof value.missingResults === "number" && Number.isSafeInteger(value.missingResults) && value.missingResults >= 0 && "unsupportedFeatures" in value && Array.isArray(value.unsupportedFeatures) && value.unsupportedFeatures.every((feature) => EXCEL_UNSUPPORTED_FEATURES.some((known) => known === feature)) && Array.isArray(value.sheets) && value.sheets.length > 0 && value.sheets.every((sheet) => typeof sheet === "object" && sheet !== null && "name" in sheet && typeof sheet.name === "string" && "celldata" in sheet && Array.isArray(sheet.celldata));
}
