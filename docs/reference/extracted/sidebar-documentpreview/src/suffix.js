// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/document/suffix.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Filename suffix matching shared by the preview registry and the owner's
		* unviewable list, so every consumer normalizes paths and suffixes alike.
		*/
		/**
		* Normalize one declared suffix for comparison.
		* @param extension - declared file suffix, with or without a leading dot.
		* @returns the suffix lowercased with any leading dot dropped.
		*/
		function normalizeSuffix(extension) {
			return extension.toLowerCase().replace(/^\./u, "");
		}
		/**
		* The filename a path's suffixes are matched against.
		* @param path - decoded filename or file path; `\` is accepted as a separator.
		* @returns the lowercased final path segment.
		*/
		function documentFileName(path) {
			const normalized = path.replaceAll("\\", "/").toLowerCase();
			return normalized.slice(normalized.lastIndexOf("/") + 1);
		}
		/**
		* The longest declared suffix ending the filename.
		* @param name - lowercased filename from {@link documentFileName}.
		* @param extensions - declared suffixes; compound suffixes such as `tar.gz` are accepted.
		* @returns the matched suffix's normalized length, or 0 when none matches.
		*/
		function matchedSuffixLength(name, extensions) {
			return Math.max(0, ...extensions.map(normalizeSuffix).filter((extension) => name.endsWith(`.${extension}`)).map((extension) => extension.length));
		}
