// Extracted from @deepseek-ai/dsh-client-ui-reference (lib/client.js); region lib/types/client/user-text-rules.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

function nextPath(text, from, folder) {
	const tokens = /(?<!\S)(@"[^"\n]+"|@[^\s]+)/gu;
	tokens.lastIndex = from;
	for (let match = tokens.exec(text); match !== null; match = tokens.exec(text)) {
		const token = match[0];
		const raw = token.startsWith("@\"") ? token : token.replace(/[.,;:!?，。；：！？]+$/u, "");
		if (raw.length <= 1) continue;
		const path = raw.slice(1).replace(/^"|"$/gu, "");
		if (path.endsWith("/") !== folder) continue;
		const label = path.split(/[\\/]/u).filter(Boolean).at(-1) ?? raw.slice(1);
		return {
			start: match.index,
			end: match.index + raw.length,
			data: {
				path,
				label
			}
		};
	}
}
/** Return the nearest complete file reference using original whitespace boundaries. */
const fileReferenceRule = {
	id: "file",
	order: 30,
	match(text, from) {
		const candidate = nextPath(text, from, false);
		return candidate === void 0 ? void 0 : {
			id: "file",
			...candidate
		};
	}
};
/** Return the nearest trailing-slash directory using the file-reference grammar. */
const folderReferenceRule = {
	id: "folder",
	order: 30,
	match(text, from) {
		const candidate = nextPath(text, from, true);
		return candidate === void 0 ? void 0 : {
			id: "folder",
			...candidate
		};
	}
};
