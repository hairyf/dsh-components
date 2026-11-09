// Extracted from @deepseek-ai/dsh-client-ui-trajectory (lib/client.js); region lib/types/client/trajectory-preview.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Bounded Markdown-to-text projection shared by trajectory consumers. */
		const PREVIEW_SOURCE_CHARACTERS = 2048;
		const PREVIEW_OUTPUT_CHARACTERS = 512;
		/**
		* Build a bounded one-line preview without parsing the complete Markdown document.
		* @param text - Untrusted message, reasoning, payload, or result text.
		* @returns A compact preview capped independently from the retained source.
		*/
		function trajectoryPreviewText(text) {
			const source = text.slice(0, PREVIEW_SOURCE_CHARACTERS);
			const compact = (0, _deepseek_ai_dsh_client_ui_primitives.extractMarkdownPlainText)(source).replace(/\s+/g, " ").trim();
			const preview = compact.slice(0, PREVIEW_OUTPUT_CHARACTERS).trimEnd();
			return source.length < text.length || preview.length < compact.length ? `${preview}…` : preview;
		}
