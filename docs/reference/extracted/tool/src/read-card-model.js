// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/models/read-card-model.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Whether a model-supplied argument is a 1-based line position or count: an integer of at least 1. */
		function positiveInteger$1(value) {
			return typeof value === "number" && Number.isInteger(value) && value >= 1;
		}
		function validReadCall(block) {
			const call = parsedToolCall(block);
			if (call?.name !== "read") return false;
			const { file_path: path, offset, limit } = call.args;
			if (typeof path !== "string" || path.trim() === "") return false;
			if (offset !== void 0 && !positiveInteger$1(offset)) return false;
			if (limit !== void 0 && !positiveInteger$1(limit)) return false;
			return true;
		}
		function readMeta(meta) {
			if (typeof meta !== "object" || meta === null || Array.isArray(meta)) return null;
			const { path, offset, lines, totalLines, lang } = meta;
			if (typeof path !== "string" || typeof offset !== "number" || !Number.isInteger(offset) || offset < 1) return null;
			if (typeof totalLines !== "number" || !Number.isInteger(totalLines) || totalLines < 0 || !Array.isArray(lines)) return null;
			if (lang !== void 0 && typeof lang !== "string") return null;
			const narrowed = [];
			let previous = offset - 1;
			for (const line of lines) {
				if (typeof line !== "object" || line === null || Array.isArray(line)) return null;
				const { number, text } = line;
				if (typeof number !== "number" || !Number.isInteger(number) || number < 1 || number <= previous) return null;
				if (number > totalLines || typeof text !== "string") return null;
				previous = number;
				narrowed.push({
					number,
					text
				});
			}
			return {
				path,
				offset,
				lines: narrowed,
				totalLines,
				...lang === void 0 ? {} : { lang }
			};
		}
		/**
		* The line one `read` call was about, from its arguments.
		*
		* `offset` is the read tool's own 1-based start line, so opening the path can
		* land where the model looked. Available while the call is still running,
		* unlike the persisted metadata, because the arguments carry it. The arguments
		* are model-produced JSON: only an integer of at least 1 is a line, and a call
		* whose `offset` is anything else names none.
		* @param block - running or settled Tool block.
		* @returns the 1-based line, or undefined when the call named none.
		*/
		function readCallLine(block) {
			if (!validReadCall(block)) return void 0;
			const { offset } = parsedToolCall(block)?.args ?? {};
			return positiveInteger$1(offset) ? offset : void 0;
		}
		/**
		* Derive a settled root read card after validating its persisted metadata and
		* model-facing read envelope.
		* @param block - running or settled Tool block.
		* @param sessionCwd - the session workspace root; a workspace-rooted absolute
		*   path label displays relative to it. Absent leaves the path as authored.
		* @param home - host account home; a leftover POSIX home path displays as `~`.
		* @returns the read-card props, or null for the generic path.
		*/
		function readCardModel(block, sessionCwd, home) {
			if (block.parentCallId !== void 0 || !("kind" in block) || block.isError) return null;
			if (!validReadCall(block)) return null;
			const meta = readMeta(block.meta);
			if (meta === null) return null;
			const text = singleResultText(block);
			if (text === void 0) return null;
			if (/^<path>[^\n]*<\/path>\n<type>file<\/type>\n<content>\n([\s\S]*)\n<\/content>$/u.exec(text)?.[1] === void 0) return null;
			return {
				label: abbreviateHomePath(relativizeToCwd(meta.path, sessionCwd), home),
				lines: meta.lines,
				totalLines: meta.totalLines,
				lang: meta.lang
			};
		}
