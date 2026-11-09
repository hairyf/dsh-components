// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/markdown/parse.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* The markdown renderer's two mdast grammars, one per rendering arm. Each
* arm is internally consistent — the incremental tail parses, the one-shot
* parses, and the plain-text projection of a given grammar always agree on
* where blocks start and end — and the settled grammar is the streaming one
* plus the math extensions, so the arms differ only where TeX delimiters
* begin a math construct (a `$$` block is a paragraph while streaming and a
* math block once settled, by design).
*/
/** GFM strikethrough requires `~~`; a single `~` stays literal, as in ranges such as `10~20`. */
const gfmOptions = { singleTilde: false };
/**
* Parse GFM markdown (the streaming arm's grammar: no math, so incomplete
* TeX never flashes KaTeX errors mid-stream).
* @param text - Markdown source.
* @returns The mdast root.
*/
function parseGfm(text) {
	return recoverLocalImages(fromMarkdown(text, {
		extensions: [gfm(gfmOptions), cjkFriendlyStrong()],
		mdastExtensions: [gfmFromMarkdown(), windowsPathDestinations()]
	}), text);
}
/**
* Parse GFM markdown plus TeX math with the compatibility delimiters
* (the settled arm's grammar).
* @param text - Markdown source.
* @returns The mdast root.
*/
function parseGfmWithMath(text) {
	return recoverLocalImages(fromMarkdown(text, {
		extensions: [
			gfm(gfmOptions),
			cjkFriendlyStrong(),
			mathCompatibility(),
			math()
		],
		mdastExtensions: [
			gfmFromMarkdown(),
			mathFromMarkdown(),
			windowsPathDestinations()
		]
	}), text);
}
