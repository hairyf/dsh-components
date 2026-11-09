// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/user-text/whitespace-rules.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

function replacement(text, start, end, display) {
	return {
		id: "text",
		start,
		end,
		data: {
			text: text.slice(start, end),
			display
		}
	};
}
/** Offer the next whitespace run whose display collapses to one space. */
const collapseWhitespaceRule = {
	id: "text.collapse-whitespace",
	order: 1010,
	match(text, from, context) {
		if (!context.read("collapseWhitespace")) return void 0;
		const spaces = /\s+/gu;
		spaces.lastIndex = from;
		for (let match = spaces.exec(text); match !== null; match = spaces.exec(text)) {
			if (match.index > 0 && /\s/u.test(text.slice(match.index - 1, match.index)) || match[0] === " ") continue;
			return replacement(text, match.index, match.index + match[0].length, " ");
		}
	}
};
/** Offer original document-edge whitespace, winning same-start collisions with collapse. */
const trimWhitespaceRule = {
	id: "text.trim-whitespace",
	order: 1e3,
	match(text, from, context) {
		if (!context.read("trimWhitespace")) return void 0;
		if (from === 0) {
			const leading = /^\s+/u.exec(text);
			if (leading !== null) return replacement(text, 0, leading[0].length, "");
		}
		let start = text.length;
		const whitespace = /\s/u;
		while (start > 0 && whitespace.test(text.charAt(start - 1))) start--;
		return start === text.length || start < from ? void 0 : replacement(text, start, text.length, "");
	}
};
