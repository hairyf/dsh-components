// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/code-highlighting.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Shared filename-to-grammar selection and lazy line highlighter for source views. */
/**
* Bind the shared lazy highlighter to one language and refresh after its grammar loads.
* @param language - grammar hint selected from the source filename.
* @returns a stable fragment highlighter; unknown and loading grammars return `undefined` for plain-text fallback.
*/
function useCodeHighlighter(language) {
	return useCallback((code) => highlightLines(code, language), [language, useSyncExternalStore(subscribeGrammarLoaded, grammarLoadCount, grammarLoadCount)]);
}
