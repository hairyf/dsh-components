// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/markdown/frontmatter.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Leading YAML frontmatter split from a Markdown document before Markdown parsing. */
		const FRONTMATTER = /^\uFEFF?---[ \t]*\r?\n(?:([\s\S]*?)\r?\n)??(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/u;
		/**
		* Split a leading YAML frontmatter block from Markdown text without parsing its YAML.
		* @param text - Markdown source; an unterminated block is not frontmatter.
		* @returns frontmatter source and the remaining body, or `undefined` when the text has none.
		*/
		function splitFrontmatter(text) {
			const match = FRONTMATTER.exec(text);
			if (match === null) return void 0;
			return {
				source: match[1] ?? "",
				body: text.slice(match[0].length)
			};
		}
