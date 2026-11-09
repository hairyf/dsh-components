// Extracted from @deepseek-ai/dsh-client-ui-skill (lib/client.js); region lib/types/client/user-text-rules.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Return one nearest confirmed slash token, retaining its original word boundaries. */
const skillReferenceRule = {
	id: "skill",
	order: 20,
	match(text, from, context) {
		const tokens = /(?<!\S)\/([\w-]+)(?!\S)/gu;
		tokens.lastIndex = from;
		let names;
		for (let token = tokens.exec(text); token !== null; token = tokens.exec(text)) {
			if (names === void 0) {
				names = context.read("skillNames");
				if (names === void 0 || names.length === 0) return void 0;
			}
			const name = token[1];
			if (names.includes(name)) return {
				id: "skill",
				start: token.index,
				end: token.index + token[0].length,
				data: { name }
			};
		}
	}
};
