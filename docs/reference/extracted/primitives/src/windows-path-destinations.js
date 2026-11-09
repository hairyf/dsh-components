// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/markdown/windows-path-destinations.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* A raw destination is a Windows path when it has a backslash and no URL
* scheme, and either has no `/` or has a backslash before a letter or digit,
* which CommonMark cannot read as an escape. A drive letter is not a scheme.
*/
function isWindowsPath(raw) {
	return raw.includes("\\") && !/^[a-z][a-z\d+.-]+:/iu.test(raw) && (!raw.includes("/") || /\\[\p{L}\p{N}]/u.test(raw));
}
function exitDestination(token) {
	const parsed = this.resume();
	const raw = this.sliceSerialize(token);
	const node = this.stack.at(-1);
	node.url = isWindowsPath(raw) ? decodeString(raw.replaceAll("\\", "\\\\")) : parsed;
}
/**
* CommonMark reads `\.` or `\_` in a destination as an escaped character, so
* `D:\repo\.github` would parse as `D:\repo.github`. For a destination that
* is a Windows path, this `fromMarkdown` extension keeps every backslash
* literally, including one before punctuation such as `\(`, while character
* references such as `&amp;` still decode; other destinations parse unchanged.
* @returns The mdast extension.
*/
function windowsPathDestinations() {
	return { exit: {
		resourceDestinationString: exitDestination,
		definitionDestinationString: exitDestination
	} };
}
