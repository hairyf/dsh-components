// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/models/primitive-labels.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Localized copy adapters for Cordis-free UI primitives used by Tool cards. */
/**
* Localize the shared code-card toolbar.
* @param t - Conversation locale seat.
* @returns Language fallback and wrapping actions.
*/
function codeToolbarLabels(t) {
	return {
		codeLabel: t("codeBlock.title"),
		wrapLabel: t("codeBlock.wrap"),
		unwrapLabel: t("codeBlock.unwrap")
	};
}
/**
* Build localized Markdown chrome labels.
* @param t - Conversation locale seat.
* @returns Markdown chrome labels.
*/
function markdownLabels(t) {
	return {
		code: {
			copyLabel: t("copy"),
			copiedLabel: t("copied"),
			toolbarLabels: codeToolbarLabels(t)
		},
		footnotes: t("markdown.footnotes")
	};
}
/**
* Build localized diff-card chrome labels.
* @param t - Conversation locale seat.
* @returns Diff-card chrome labels.
*/
function diffBlockLabels(t) {
	return {
		...codeToolbarLabels(t),
		copy: t("copy"),
		copied: t("copied"),
		collapseAria: t("diff.collapseAria"),
		expandAria: (count) => t("diff.expandAria", { count }),
		collapse: t("collapse"),
		expand: (count) => t("diff.expandRest", { count })
	};
}
/**
* Build localized read-card chrome labels.
* @param t - Conversation locale seat.
* @returns Read-card chrome labels.
*/
function readBlockLabels(t) {
	return {
		...codeToolbarLabels(t),
		window: (shown, total) => t("read.window", {
			shown,
			total
		}),
		copy: t("copy"),
		copied: t("copied"),
		collapseAria: t("read.collapseAria"),
		expandAria: (count) => t("read.expandAria", { count }),
		collapse: t("collapse"),
		expand: (count) => t("read.expandRest", { count })
	};
}
/**
* Build localized search-card chrome labels.
* @param t - Conversation locale seat.
* @returns Search-card chrome labels.
*/
function searchBlockLabels(t) {
	return {
		pathsSummary: (shown, total, truncated) => t(truncated ? "search.paths.truncated" : "search.paths", {
			shown,
			total
		}),
		matchesSummary: (shown, total, files, truncated) => t(truncated ? "search.matches.truncated" : "search.matches", {
			shown,
			total,
			files
		}),
		copy: t("copy"),
		copied: t("copied"),
		noResults: t("search.noResults"),
		collapseAria: t("search.collapseAria"),
		expandAria: (count) => t("search.expandAria", { count }),
		collapse: t("collapse"),
		expand: (count) => t("search.expandRest", { count })
	};
}
/**
* Build localized web-card chrome labels.
* @param t - Conversation locale seat.
* @returns Web-card chrome labels.
*/
function webBlockLabels(t) {
	return {
		noResults: t("web.noResults"),
		sourcesTruncated: t("web.sourcesTruncated"),
		http: t("web.http"),
		contentTruncated: t("web.contentTruncated"),
		markdown: markdownLabels(t)
	};
}
