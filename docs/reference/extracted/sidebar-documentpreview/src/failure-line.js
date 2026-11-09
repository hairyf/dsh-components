// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/failure-line.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Render a byte count the way a person reads one. */
		function humanBytes(bytes) {
			if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} MB`;
			if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
			return `${bytes} B`;
		}
		/**
		* Say what went wrong, in terms of the file rather than of the transport.
		* @param t - namespace-bound translate.
		* @param failure - the settled Remote failure.
		* @returns the line to show in place of the file.
		*/
		function failureLine(t, failure) {
			switch (failure.code) {
				case "workspace-file/not-found": return t("error.notFound");
				case "workspace-file/too-large": return t("error.tooLarge", { limit: humanBytes(failure.details.limit) });
				case "workspace-file/not-text": return t("error.notText");
				case "workspace-file/not-regular-file": return t("error.notRegularFile");
				default: return t("error.unavailable", { message: failure.message });
			}
		}
		/**
		* Choose the empty state's action for one settled read failure.
		* @param failure - the settled Remote failure.
		* @returns `open` for a readable file this preview cannot render, `none` for a
		* path with nothing to show or open, `retry` for the rest: carrier and
		* unclassified failures a second read may resolve.
		*/
		function emptyFailureRecourse(failure) {
			switch (failure.code) {
				case "workspace-file/not-text":
				case "workspace-file/too-large": return "open";
				case "workspace-file/not-found":
				case "workspace-file/not-regular-file": return "none";
				default: return "retry";
			}
		}
