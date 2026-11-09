// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/file-size.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Compact human-readable byte counts shared by attachment presenters. @module @deepseek-ai/dsh-client-ui-primitives/file-size */
/**
* Byte count as compact user-facing size text (`312B`, `4.2KB`, `1.5MB`, `2.4GB`).
* @param bytes - exact byte count.
* @returns whole-unit text with one decimal below ten of the chosen unit.
*/
function fileSizeText(bytes) {
	if (bytes < 1024) return `${bytes}B`;
	const kb = bytes / 1024;
	if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)}KB`;
	const mb = kb / 1024;
	if (mb < 1024) return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)}MB`;
	const gb = mb / 1024;
	return `${gb < 10 ? gb.toFixed(1) : Math.round(gb)}GB`;
}
