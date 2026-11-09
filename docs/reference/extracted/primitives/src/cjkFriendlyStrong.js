// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/markdown/cjkFriendlyStrong.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Let asterisk strong emphasis close after punctuation when CJK prose continues without whitespace. */
const cjkCharacter = new RegExp([
	"\\p{Script_Extensions=Han}",
	"\\p{Script_Extensions=Hiragana}",
	"\\p{Script_Extensions=Katakana}",
	"\\p{Script_Extensions=Hangul}",
	"\\p{Script_Extensions=Bopomofo}"
].join("|"), "u");
function isCjkCharacter(code) {
	return code !== null && code >= 0 && cjkCharacter.test(String.fromCodePoint(code));
}
const tokenizeCjkFriendlyAttention = function(effects, ok, nok) {
	const configuredAttentionMarkers = this.parser.constructs.attentionMarkers.null;
	if (configuredAttentionMarkers === void 0) throw new Error("micromark CommonMark attention markers are unavailable");
	const attentionMarkers = configuredAttentionMarkers;
	const previous = this.previous;
	const before = classifyCharacter(previous);
	let marker = codes.eof;
	return start;
	function start(code) {
		/* v8 ignore next -- this text construct is dispatched only for an asterisk. */
		if (code !== codes.asterisk) return nok(code);
		marker = code;
		effects.enter("attentionSequence");
		return inside(code);
	}
	function inside(code) {
		if (code === marker) {
			effects.consume(code);
			return inside;
		}
		const token = effects.exit("attentionSequence");
		const after = classifyCharacter(code);
		const open = !after || after === constants.characterGroupPunctuation && Boolean(before) || attentionMarkers.includes(code);
		const commonMarkClose = !before || before === constants.characterGroupPunctuation && Boolean(after) || attentionMarkers.includes(previous);
		const cjkStrongClose = token.end.offset - token.start.offset >= 2 && unicodePunctuation(previous) && isCjkCharacter(code);
		const close = commonMarkClose || cjkStrongClose;
		token._open = open;
		token._close = close;
		return ok(code);
	}
};
const cjkFriendlyAttention = {
	name: "cjkFriendlyAttention",
	resolveAll: attention.resolveAll,
	tokenize: tokenizeCjkFriendlyAttention
};
const cjkFriendlyStrongExtension = { text: { [codes.asterisk]: cjkFriendlyAttention } };
/**
* Extend CommonMark asterisk strong emphasis for punctuation-delimited CJK
* prose, as a micromark syntax extension for `fromMarkdown`.
* @returns The micromark syntax extension.
*/
function cjkFriendlyStrong() {
	return cjkFriendlyStrongExtension;
}
