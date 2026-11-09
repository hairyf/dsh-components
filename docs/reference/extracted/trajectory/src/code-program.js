// Extracted from @deepseek-ai/dsh-client-ui-trajectory (lib/client.js); region lib/types/client/code-program.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Recorded name of the programmatic tool-calling entry point. */
		const PTC_TOOL_NAME = "run_code";
		function record(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
		}
		function parseRecord(value) {
			if (value === void 0) return void 0;
			try {
				return record(JSON.parse(value));
			} catch {
				return;
			}
		}
		function recordedLanguage(schemaRaw) {
			const schema = parseRecord(schemaRaw);
			const declaredLanguage = typeof schema?.description === "string" ? /^Execute a program in `([^`]+)`/.exec(schema.description)?.[1]?.toLowerCase() : void 0;
			if (declaredLanguage !== void 0 && declaredLanguage !== "typescript" && declaredLanguage !== "python") return void 0;
			const description = record(record(record(schema?.parameters)?.properties)?.code)?.description;
			const typescript = declaredLanguage === "typescript" || typeof description === "string" && /\bTypeScript\b/i.test(description);
			if (typescript === (declaredLanguage === "python" || typeof description === "string" && /\bPython\b/i.test(description))) return void 0;
			return typescript ? "typescript" : "python";
		}
		/**
		* Resolve a PTC program without guessing its language from source or current runtime settings.
		* Unknown explicit languages or conflicting recorded hints leave the source unhighlighted.
		* @param cell - Recorded tool arguments and the schema visible at call time.
		* @returns The program, or undefined for another tool or unsupported arguments.
		*/
		function codeProgram(cell) {
			if (cell.kind !== "tool" && cell.kind !== "subtool") return void 0;
			if (cell.toolName !== "run_code" || cell.inputDetail === void 0) return void 0;
			const args = parseRecord(cell.inputDetail);
			if (typeof args?.code !== "string") return void 0;
			if (args.description !== void 0 && typeof args.description !== "string") return void 0;
			return {
				rawInput: cell.inputDetail,
				source: args.code,
				description: typeof args.description === "string" && args.description.trim() !== "" ? args.description : args.code.split(/\r?\n/).find((line) => line.trim() !== "")?.trim() ?? "",
				arguments: args,
				language: recordedLanguage(cell.schemaDetail)
			};
		}
