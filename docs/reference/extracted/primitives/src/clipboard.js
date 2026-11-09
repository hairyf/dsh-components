// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/clipboard.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Write text to the host clipboard, preferring the async Clipboard API and
* falling back to `execCommand('copy')` on hosts (jsdom, insecure contexts)
* that omit it.
* @param text - the exact text to place on the clipboard.
* @returns true only when the host accepted the write.
*/
async function writeClipboard(text) {
	if (navigator.clipboard?.writeText) try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
	const exec = typeof document.execCommand === "function" ? document.execCommand.bind(document) : void 0;
	if (exec === void 0) return false;
	const el = document.createElement("textarea");
	el.value = text;
	el.setAttribute("readonly", "");
	el.style.position = "fixed";
	el.style.left = "-9999px";
	document.body.appendChild(el);
	el.select();
	try {
		return exec("copy");
	} catch {
		return false;
	} finally {
		el.remove();
	}
}
