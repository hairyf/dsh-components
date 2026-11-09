// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/head-tail-cap.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Compute the head/tail cap metrics for a list of `total` rows against `maxLines`,
* given whether the surface is expanded. Pure arithmetic; the caller slices its
* own rows with `headLines`/`tailLines` so a block can layer its own concerns
* (SearchBlock restores a tail file header) on top.
* @param total - the list's row count.
* @param maxLines - the collapsed-height cap in rows.
* @param expanded - whether the surface is expanded (uncaps the list).
* @returns the split metrics.
*/
function headTailCap(total, maxLines, expanded) {
	const hidden = total - maxLines;
	const headLines = Math.ceil(maxLines / 2);
	return {
		hidden,
		capped: hidden > 0 && !expanded,
		headLines,
		tailLines: maxLines - headLines
	};
}
