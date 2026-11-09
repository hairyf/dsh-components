// Extracted from @deepseek-ai/dsh-client-ui-secret-mask (lib/client.js); module-level code outside any region.
// Compiled bundle code copied verbatim from the bundle; imports are hoisted in the original bundle, so this file is not standalone.

const prefixed = (literal, shape, run, min, max = 0) => ({
			literal,
			kind: 2,
			shape,
			run,
			min,
			max
		});
		/** Every prefixed format matches more than the 8 characters a mask leaves readable. */
		const CREDENTIAL_FORMATS = [
			{
				literal: "-----BEGIN ",
				kind: 0,
				shape: 0,
				run: 0,
				min: 0,
				max: 0
			},
			{
				literal: "://",
				kind: 1,
				shape: 0,
				run: 0,
				min: 0,
				max: 0
			},
			prefixed("sk-", 2, 1, 20),
			prefixed("AIza", 3, 1, 35),
			prefixed("ghp_", 0, 2, 36),
			prefixed("gho_", 0, 2, 36),
			prefixed("ghu_", 0, 2, 36),
			prefixed("ghs_", 0, 2, 36),
			prefixed("ghr_", 0, 2, 36),
			prefixed("github_pat_", 0, 4, 22),
			prefixed("glpat-", 0, 1, 20),
			prefixed("npm_", 0, 2, 36),
			prefixed("hf_", 0, 2, 30),
			prefixed("AKIA", 1, 16, 16, 16),
			prefixed("ASIA", 1, 16, 16, 16),
			prefixed("LTAI", 1, 2, 12, 20),
			prefixed("AKID", 1, 2, 28, 36),
			prefixed("xoxa-", 0, 8, 10),
			prefixed("xoxb-", 0, 8, 10),
			prefixed("xoxp-", 0, 8, 10),
			prefixed("xoxr-", 0, 8, 10),
			prefixed("xoxs-", 0, 8, 10),
			prefixed("sk_live_", 0, 2, 16),
			prefixed("sk_test_", 0, 2, 16),
			prefixed("rk_live_", 0, 2, 16),
			prefixed("rk_test_", 0, 2, 16),
			prefixed("whsec_", 0, 2, 24),
			prefixed("eyJ", 4, 1, 8, 2048)
		];
		/** Leading characters of a prefixed key left readable: the provider prefix and little else. */
		const VISIBLE_PREFIX = 8;
		const SHARED_MARKS = 4096;
		/** Builds masks; owns the shared mark strings and its sticky run pattern. */
		var CredentialMasks = class {
			marksOnly = "*".repeat(SHARED_MARKS);
			marksLf = `${this.marksOnly}\n`;
			marksCr = `${this.marksOnly}\r`;
			/** Code units that `lines` counts without inspection: neither line breaks nor surrogates. Set `lastIndex` before each test. */
			ordinary = /[^\r\n\ud800-\udfff]*/y;
			/**
			* The display form of `text[start, end)`, whose earliest candidate has `kind`.
			* @param text - the queried text.
			* @param kind - the literal kind of the range's earliest candidate.
			* @param plain - the range holds only prefixed-format characters: ASCII without line breaks.
			* @param start - first offset of the range.
			* @param end - offset after the range.
			* @returns the mask; line breaks stay in place, one mark per code point.
			*/
			masked(text, kind, plain, start, end) {
				if (kind === 1) return this.range(text, start, end);
				if (kind === 2) return text.slice(start, start + VISIBLE_PREFIX) + (plain ? this.marks(end - start - VISIBLE_PREFIX) : this.range(text, start + VISIBLE_PREFIX, end));
				return this.keyBlock(text, start, end);
			}
			/** `count` marks: up to the shared string's length, one slice of it. */
			marks(count) {
				return count <= SHARED_MARKS ? this.marksOnly.slice(0, count) : "*".repeat(count);
			}
			/** `count` marks and then the line break `code`, 10 or 13: one slice where `marks` would be one. */
			marksThen(count, code) {
				return count <= SHARED_MARKS ? (code === 10 ? this.marksLf : this.marksCr).slice(SHARED_MARKS - count) : "*".repeat(count) + (code === 10 ? "\n" : "\r");
			}
			/**
			* Keep the `BEGIN` line, the `END` line when present, and every line break; a block written on
			* one line is masked whole. Both searches stay inside the range, so they cost what the mask costs.
			*/
			keyBlock(text, start, end) {
				let bodyStart = start;
				for (let index = start; index < end; index++) if (text.charCodeAt(index) === 10) {
					bodyStart = index + 1;
					break;
				}
				let bodyEnd = end;
				for (let index = end - 9; index >= bodyStart; index--) if (text.charCodeAt(index) === 10 && text.startsWith("-----END", index + 1)) {
					bodyEnd = index;
					break;
				}
				const body = bodyEnd === text.length || text.charCodeAt(bodyEnd) === 10 || text.charCodeAt(bodyEnd) === 13 ? this.lines(text, bodyStart, bodyEnd) : this.range(text, bodyStart, bodyEnd);
				return text.slice(start, bodyStart) + body + text.slice(bodyEnd, end);
			}
			/**
			* `text[start, end)` with every character except line breaks replaced; a surrogate pair is one
			* character, as `[^\r\n]` with the `u` flag counts it. A character loop: a native run could read far past `end`.
			*/
			range(text, start, end) {
				let masked = "";
				let count = 0;
				for (let index = start; index < end; index++) {
					const code = text.charCodeAt(index);
					if (code === 10 || code === 13) {
						masked += this.marksThen(count, code);
						count = 0;
						continue;
					}
					if (code >= 55296 && code <= 56319 && index + 1 < end) {
						const next = text.charCodeAt(index + 1);
						if (next >= 56320 && next <= 57343) index++;
					}
					count++;
				}
				return masked + this.marks(count);
			}
			/** `range` for a body that ends at a line break or the end of the text, where native runs stop. */
			lines(text, start, end) {
				const ordinary = this.ordinary;
				let masked = "";
				let count = 0;
				let index = start;
				while (index < end) {
					ordinary.lastIndex = index;
					ordinary.test(text);
					const stop = Math.min(ordinary.lastIndex, end);
					count += stop - index;
					if (stop === end) break;
					const code = text.charCodeAt(stop);
					index = stop + 1;
					if (code === 10 || code === 13) {
						masked += this.marksThen(count, code);
						count = 0;
						continue;
					}
					if (code <= 56319 && index < end) {
						const next = text.charCodeAt(index);
						if (next >= 56320 && next <= 57343) index++;
					}
					count++;
				}
				return masked + this.marks(count);
			}
		};
