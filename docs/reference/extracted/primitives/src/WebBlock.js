// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/WebBlock.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* The URL to link to, or undefined when the URL must render as plain text. Only
* http(s) becomes a navigable external anchor, so a `javascript:`/`data:`/`file:`
* URL or an unparseable string never reaches the DOM as an href. This is the
* http(s) subset of the allowlist MarkdownText applies to untrusted links —
* MarkdownText also permits `mailto:`, deliberately excluded here since a
* retrieval URL is never a mail address.
* @param url - the source or fetch URL, from tool result content.
* @returns the href to use, or undefined for plain text.
*/
function safeHref(url) {
	try {
		const { protocol } = new URL(url);
		return protocol === "http:" || protocol === "https:" ? url : void 0;
	} catch {
		return;
	}
}
/**
* The link's visible label: the title when the provider gave one, otherwise the
* URL's hostname, falling back to the raw URL when it does not parse OR parses
* to an empty hostname (a `file:`/`data:`/`javascript:` URL), so a label is
* never blank.
* @param url - the source URL.
* @param title - the provider title, if any.
* @returns the label text.
*/
function linkLabel(url, title) {
	if (title !== void 0 && title !== "") return title;
	try {
		const { hostname } = new URL(url);
		return hostname === "" ? url : hostname;
	} catch {
		return url;
	}
}
/**
* A single URL rendered as a safe external anchor, or as plain text when the
* URL is not an http(s) link.
* @param props.url - the URL to render.
* @param props.label - the visible label.
* @param props.className - class for the anchor or the plain span.
* @returns the anchor or span element.
*/
function SafeLink({ url, label, className }) {
	const href = safeHref(url);
	if (href === void 0) return jsx("span", {
		className,
		children: label
	});
	return jsxs("a", {
		className,
		href,
		target: "_blank",
		rel: "noopener noreferrer",
		children: [jsx(LinkIconMedium, {
			kind: "url",
			href,
			className: css$40.linkIcon
		}), label]
	});
}
/**
* One source row in a search card: the safe link plus its snippet and date. The
* `<li value>` pins the source's 1-based citation index explicitly rather than
* relying on the `<ol>`'s implicit numbering, so a row reads by its real index
* even inside the scroll container.
* @param props.source - the source to render.
* @param props.ordinal - the source's 1-based position in the full list.
* @returns the source list item.
*/
function SourceItem({ source, ordinal }) {
	return jsxs("li", {
		className: css$40.source,
		value: ordinal,
		children: [
			jsx(SafeLink, {
				url: source.url,
				label: linkLabel(source.url, source.title),
				className: css$40.sourceLink
			}),
			source.snippet !== void 0 && source.snippet !== "" && jsx("div", {
				className: css$40.snippet,
				children: source.snippet
			}),
			source.publishedAt !== void 0 && source.publishedAt !== "" && jsx("div", {
				className: css$40.published,
				children: source.publishedAt
			})
		]
	});
}
/**
* The search card body: the answer over the full source list, which scrolls in
* place once it exceeds the `.sources` container height.
* @param props - see {@link WebSearchBlockProps}.
* @returns the search card element.
*/
function WebSearchBlock({ answer, sources, truncated, labels, className }) {
	const empty = (answer === void 0 || answer === "") && sources.length === 0;
	return jsxs("div", {
		className: clsx(css$40.block, className),
		"data-web": "search",
		children: [
			answer !== void 0 && answer !== "" && jsx("div", {
				className: css$40.answer,
				children: jsx(MarkdownText, {
					text: answer,
					labels: labels.markdown
				})
			}),
			empty ? jsx("div", {
				className: css$40.empty,
				children: labels.noResults
			}) : jsx("ol", {
				className: css$40.sources,
				children: sources.map((source, index) => jsx(SourceItem, {
					source,
					ordinal: index + 1
				}, index))
			}),
			truncated && jsx("div", {
				className: css$40.truncated,
				children: labels.sourcesTruncated
			})
		]
	});
}
/**
* The fetch card body: the linked URL and its HTTP status.
* @param props - see {@link WebFetchBlockProps}.
* @returns the fetch card element.
*/
function WebFetchBlock({ url, statusCode, truncated, labels, className }) {
	return jsxs("div", {
		className: clsx(css$40.block, css$40.fetch, className),
		"data-web": "fetch",
		children: [jsx(SafeLink, {
			url,
			label: url,
			className: css$40.fetchUrl
		}), jsxs("div", {
			className: css$40.fetchMeta,
			children: [jsxs("span", {
				className: css$40.status,
				children: [
					labels.http,
					" ",
					statusCode
				]
			}), truncated && jsx("span", {
				className: css$40.truncated,
				children: labels.contentTruncated
			})]
		})]
	});
}
/**
* Render a completed web retrieval as a structured card.
* @param props - see {@link WebBlockProps}; `kind` selects the search or fetch body.
* @returns the web card element.
*/
function WebBlock(props) {
	return props.kind === "search" ? jsx(WebSearchBlock, { ...props }) : jsx(WebFetchBlock, { ...props });
}
