// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/models/search-card-model.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		function validSearchCall(block) {
			const call = parsedToolCall(block);
			if (call === null) return null;
			const { pattern, path } = call.args;
			if (typeof pattern !== "string") return null;
			if (call.name === "grep" && pattern === "") return null;
			if (call.name === "glob" && pattern.trim() === "") return null;
			if (call.name !== "grep" && call.name !== "glob") return null;
			if (path !== void 0 && (typeof path !== "string" || path.trim() === "")) return null;
			if (call.name === "grep") {
				const { include } = call.args;
				if (include !== void 0 && include !== "" && (typeof include !== "string" || !validInclude(include))) return null;
			}
			return call.name;
		}
		function validInclude(include) {
			if (include.trim() === "" || include.startsWith("!")) return false;
			let braceDepth = 0;
			for (const character of include) if (character === "{") braceDepth += 1;
			else if (character === "}") braceDepth = Math.max(0, braceDepth - 1);
			else if (character === "," && braceDepth === 0) return false;
			return true;
		}
		function searchFiles(value) {
			if (!Array.isArray(value)) return null;
			const files = [];
			for (const file of value) {
				if (typeof file !== "object" || file === null || Array.isArray(file)) return null;
				const { path, matches } = file;
				if (typeof path !== "string" || !Array.isArray(matches)) return null;
				const narrowed = [];
				for (const match of matches) {
					if (typeof match !== "object" || match === null || Array.isArray(match)) return null;
					const { lineNumber, line } = match;
					if (typeof lineNumber !== "number" || !Number.isInteger(lineNumber) || lineNumber < 1) return null;
					if (typeof line !== "string") return null;
					narrowed.push({
						lineNumber,
						line
					});
				}
				files.push({
					path,
					matches: narrowed
				});
			}
			return files;
		}
		function flattenContent(content) {
			const text = content.filter((block) => block.type === "text" && typeof block.text === "string").map((block) => block.text).join("\n");
			return text === "" ? void 0 : text;
		}
		/**
		* Derive a settled root grep/glob card from persisted metadata.
		* @param block - running or settled Tool block.
		* @returns search-card props, or null for the generic path.
		*/
		function searchCardModel(block) {
			if (block.parentCallId !== void 0 || !("kind" in block) || block.isError) return null;
			const tool = validSearchCall(block);
			if (tool === null) return null;
			if (typeof block.meta !== "object" || block.meta === null || Array.isArray(block.meta)) return null;
			const meta = block.meta;
			if (typeof meta.truncated !== "boolean") return null;
			if (typeof meta.total !== "number" || !Number.isInteger(meta.total) || meta.total < 0) return null;
			const common = {
				truncated: meta.truncated,
				total: meta.total
			};
			const recovery = meta.truncated ? flattenContent(block.content) : void 0;
			if (tool === "grep") {
				if (meta.shape !== "matches") return null;
				const files = searchFiles(meta.files);
				return files === null ? null : {
					recovery,
					card: {
						kind: "matches",
						files,
						...common
					}
				};
			}
			if (meta.shape !== "paths" || !Array.isArray(meta.paths)) return null;
			if (!meta.paths.every((path) => typeof path === "string")) return null;
			return {
				recovery,
				card: {
					kind: "paths",
					paths: [...meta.paths],
					...common
				}
			};
		}
		new TextEncoder();
		new TextDecoder();
		/**
		* Standardized, false-precision-safe wording for one {@link Omitted} value —
		* the "may standardize omission wording" half the library owns. `exact` prints
		* the count (`Omitted 3 items`); `unknown` prints NO count because the caller
		* did not provide one. `none` is the empty string.
		*
		* @param omitted The omission metadata from a retainer result.
		* @param unit The noun for the omitted quantity (`items`, `bytes`, `chars`, `lines`).
		* @returns A neutral clause (no trailing space), or `''` when nothing was omitted.
		*/
		function describeOmitted(omitted, unit) {
			switch (omitted.kind) {
				case "none": return "";
				case "exact": return `Omitted ${omitted.count} ${unit}.`;
				case "unknown": return `More ${unit} were omitted.`;
			}
		}
