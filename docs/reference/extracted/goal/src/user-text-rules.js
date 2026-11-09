// Extracted from @deepseek-ai/dsh-client-ui-goal (lib/client.js); region lib/types/client/user-text-rules.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Return the nearest exact confirmed command, checking boundaries against the original string. */
		const goalCommandReferenceRule = {
			id: "command",
			order: 20,
			match(text, from, context) {
				const slash = /(?<!\S)\//gu;
				slash.lastIndex = from;
				if (!slash.test(text)) return void 0;
				const commands = context.read("commands");
				let best;
				for (const { start, end, name } of commands ?? []) {
					if (start < from || end > text.length || text.slice(start, end) !== `/${name}` || start !== 0 && !/\s/u.test(text.slice(start - 1, start)) || end !== text.length && !/\s/u.test(text.slice(end, end + 1))) continue;
					if (best === void 0 || start < best.start || start === best.start && end > best.end) best = {
						id: "command",
						start,
						end,
						data: { name }
					};
				}
				return best;
			}
		};
