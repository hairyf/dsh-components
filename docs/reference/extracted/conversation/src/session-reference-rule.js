// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/user-text/session-reference-rule.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Find the nearest Session reference; bare labels read their Facts only at a non-wire @ position. */
const sessionReferenceRule = {
	id: "session",
	order: 10,
	match(text, from, context) {
		let labels;
		let readLabels = false;
		const wire = /@\[([^\]\n]+)\]\(dsh-session:[^)\s]+\)/uy;
		for (let start = text.indexOf("@", from); start >= 0; start = text.indexOf("@", start + 1)) {
			wire.lastIndex = start;
			const explicit = wire.exec(text);
			if (explicit !== null) return {
				id: "session",
				start,
				end: start + explicit[0].length,
				data: { label: explicit[1] }
			};
			if (!readLabels) {
				labels = context.read("sessionLabels");
				readLabels = true;
			}
			let best;
			for (const label of labels ?? []) {
				if (label.length === 0 || !text.startsWith(label, start + 1)) continue;
				const end = start + label.length + 1;
				if (best === void 0 || end > best.end) best = {
					id: "session",
					start,
					end,
					data: { label }
				};
			}
			if (best !== void 0) return best;
		}
	}
};
