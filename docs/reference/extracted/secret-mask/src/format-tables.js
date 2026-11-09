// Extracted from @deepseek-ai/dsh-client-ui-secret-mask (lib/client.js); region lib/types/client/format-tables.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Lookup tables derived from the credential formats, built once on first use. */
		let tables;
		/**
		* The tables for `CREDENTIAL_FORMATS`; the first call builds them.
		* @returns the shared, read-only tables.
		*/
		function formatTables() {
			tables ??= buildTables();
			return tables;
		}
		function buildTables() {
			const formats = CREDENTIAL_FORMATS;
			const literals = formats.map((f) => f.literal);
			const { ending, sharedEndings } = endingTables(literals);
			return {
				classes: charClasses(),
				literals,
				literalLength: Uint8Array.from(literals, (literal) => literal.length),
				literalKind: Uint8Array.from(formats, (f) => f.kind),
				literalShape: Uint8Array.from(formats, (f) => f.shape),
				literalRun: Uint16Array.from(formats, (f) => f.run),
				literalMin: Int32Array.from(formats, (f) => f.min),
				literalMax: Int32Array.from(formats, (f) => f.max),
				literalOverlap: Uint8Array.from(literals, (literal) => overlap(literal, literals)),
				prefixSource: alternation(literals),
				ending,
				sharedEndings
			};
		}
		function charClasses() {
			const classes = new Uint16Array(128);
			for (let code = 0; code < 128; code++) {
				const upper = code >= 65 && code <= 90;
				const lower = code >= 97 && code <= 122;
				const digit = code >= 48 && code <= 57;
				const alnum = upper || lower || digit;
				const authority = !(code >= 9 && code <= 13 || code === 32 || code === 47 || code === 64 || code === 63 || code === 35);
				classes[code] = (alnum || code === 95 || code === 45 ? 1 : 0) | (alnum ? 2 : 0) | (alnum || code === 95 ? 4 : 0) | (alnum || code === 45 ? 8 : 0) | (upper || digit ? 16 : 0) | (upper || digit || code === 32 ? 32 : 0) | (lower || digit || code === 43 || code === 46 || code === 45 ? 64 : 0) | (lower ? 128 : 0) | (authority && code !== 58 ? 256 : 0) | (authority ? 512 : 0);
			}
			return classes;
		}
		function overlap(literal, literals) {
			for (let size = literal.length - 1; size > 0; size--) {
				const suffix = literal.slice(-size);
				if (literals.some((other) => other.startsWith(suffix))) return size;
			}
			return 0;
		}
		function endingTables(literals) {
			const ending = new Int8Array(16384);
			const sharedEndings = [];
			literals.forEach((literal, index) => {
				const key = literal.charCodeAt(literal.length - 2) * 128 + literal.charCodeAt(literal.length - 1);
				const existing = ending[key];
				if (existing === 0) {
					ending[key] = index + 1;
					return;
				}
				if (existing > 0) {
					sharedEndings[key] = [existing - 1];
					ending[key] = -1;
				}
				sharedEndings[key].push(index);
			});
			return {
				ending,
				sharedEndings
			};
		}
		const escape = (literal) => literal.replace(/[.*+?^${}()|[\]\\/]/gu, "\\$&");
		/** Literal alternatives grouped by shared leading characters; groups only factor literals and add no quantifier. */
		function alternation(literals) {
			const groups = /* @__PURE__ */ new Map();
			for (const literal of literals) groups.set(literal.charAt(0), [...groups.get(literal.charAt(0)) ?? [], literal.slice(1)]);
			return [...groups].map(([head, tails]) => tails.length === 1 ? escape(head + tails.join("")) : `${escape(head)}(?:${alternation(tails)})`).join("|");
		}
