// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/markdown/render.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

function sanitizeUrl(url) {
	if (isExplicitFilePath(url)) return "";
	try {
		switch (new URL(url).protocol) {
			case "javascript:":
			case "vbscript:":
			case "data:":
			case "blob:": return "";
			default: return url;
		}
	} catch {
		return "";
	}
}
function remoteImageUrl(url) {
	try {
		const protocol = new URL(url).protocol;
		return protocol === "http:" || protocol === "https:" ? url : void 0;
	} catch {
		return;
	}
}
/** Authenticated Host media routes as the Desktop application addresses them. */
const DESKTOP_MEDIA_ROUTES = [
	"dsh-app://app/api/file?",
	"dsh-app://app/api/plugin-market/detail-file?",
	"dsh-app://app/api/plugin-manager/detail-file?"
];
/** Rewritten images may use Web media protocols or the Desktop application's media routes. */
function vocabularyImageUrl(url) {
	try {
		const protocol = new URL(url).protocol;
		return protocol === "http:" || protocol === "https:" || protocol === "blob:" || protocol === "data:" || DESKTOP_MEDIA_ROUTES.some((route) => url.startsWith(route)) ? url : void 0;
	} catch {
		return;
	}
}
/**
* The displayable source for one image destination: absolute HTTP(S) as
* authored, otherwise the context's local-path vocabulary when it vouches for
* the destination. Either miss leaves the authored fallback (alt text) to the
* caller.
* @param url - The authored markdown destination.
* @param pathImages - Rewriting vocabulary, when the render pass has one.
* @param load - The mounted image's load number for rewritten URLs.
* @returns The displayable image URL, or undefined.
*/
function imageSource(url, pathImages, load) {
	const remote = remoteImageUrl(sanitizeUrl(normalizeUri(url)));
	if (remote !== void 0) return remote;
	const rewritten = pathImages?.resolve(url);
	const allowed = rewritten === void 0 ? void 0 : vocabularyImageUrl(rewritten);
	return allowed === void 0 ? void 0 : freshImageUrl(allowed, load);
}
let imageLoads = 0;
const nextImageLoad = () => ++imageLoads;
/**
* Tag a Host file-route image URL with its mount's load number. Browsers reuse
* a same-URL image within one document despite `no-store`, so without the tag
* a newly rendered image of a rewritten file would show the earlier bytes.
* @param url - Absolute resolved image URL; URLs outside the `api/file` route stay unchanged.
* @param load - Number allocated once per mounted image or file link.
* @returns The URL with a `load` query parameter, or the unchanged URL.
*/
function freshImageUrl(url, load) {
	let fresh;
	try {
		fresh = new URL(url);
	} catch {
		return url;
	}
	if (!fresh.pathname.endsWith("/api/file")) return url;
	fresh.search = `${fresh.search === "" ? "?" : `${fresh.search}&`}load=${load}`;
	return fresh.href;
}
/**
* Create an empty {@link ReferenceTargets}.
* @returns Fresh empty maps.
*/
function createReferenceTargets() {
	return {
		definitions: /* @__PURE__ */ new Map(),
		footnotes: /* @__PURE__ */ new Map()
	};
}
/**
* Record every definition and footnote definition under `nodes` into
* `targets`, depth-first, keeping the first definition per identifier.
* @param nodes - Subtrees to walk (top-level blocks or any nested children).
* @param targets - Accumulator, typically shared across incremental segments.
*/
function collectReferenceTargets(nodes, targets) {
	for (const node of nodes) {
		if (node.type === "definition") {
			const id = node.identifier.toUpperCase();
			if (!targets.definitions.has(id)) targets.definitions.set(id, node);
		} else if (node.type === "footnoteDefinition") {
			const id = node.identifier.toUpperCase();
			if (!targets.footnotes.has(id)) targets.footnotes.set(id, node);
		}
		if ("children" in node) collectReferenceTargets(node.children, targets);
	}
}
/**
* Render top-level blocks. Nodes that render nothing (definitions, unmapped
* types) are dropped rather than kept as null placeholders, matching the
* replaced pipeline's child lists so separator newlines land identically.
* @param blocks - Blocks with their stream-stable render keys.
* @param context - The pass state; footnote numbering mutates in document order.
* @returns One React node per rendered block.
*/
function renderBlocks(blocks, context) {
	return blocks.map((block) => renderNode(block.node, block.key, context)).filter((element) => element !== null);
}
/**
* Interleave the newline text nodes the replaced pipeline emitted between
* block-level children. They are invisible between elements but coalesce
* into adjacent literal raw-HTML text, where the DOM parity fixtures pin
* them.
* @param elements - Rendered block children with empty renders already dropped.
* @param edges - Also emit the leading and trailing newline (hast's loose wrap).
* @returns The interleaved children.
*/
function wrapBlockChildren(elements, edges) {
	const wrapped = [];
	for (const element of elements) {
		if (edges || wrapped.length > 0) wrapped.push("\n");
		wrapped.push(element);
	}
	if (edges && elements.length > 0) wrapped.push("\n");
	return wrapped;
}
/** Render container children into {@link BlockEntry} values, dropping empty renders. */
function renderBlockEntries(blocks, context) {
	const entries = [];
	for (const [index, block] of blocks.entries()) if (block.type === "paragraph") entries.push({ paragraph: renderChildren(block.children, context) });
	else {
		const element = renderNode(block, index, context);
		if (element !== null) entries.push({ element });
	}
	return entries;
}
function renderChildren(nodes, context) {
	return nodes.map((node, index) => renderNode(node, index, context));
}
function renderNode(node, key, context) {
	switch (node.type) {
		case "text": return node.value;
		case "paragraph": return jsx("p", { children: renderChildren(node.children, context) }, key);
		case "heading": return createElement(`h${node.depth}`, { key }, ...renderChildren(node.children, context));
		case "blockquote": return jsx("blockquote", { children: wrapBlockChildren(renderChildren(node.children, {
			...context,
			inBlockquote: true
		}).filter((child) => child !== null), true) }, key);
		case "thematicBreak": return jsx("hr", {}, key);
		case "break": return jsxs(Fragment$1, { children: [jsx("br", {}), "\n"] }, key);
		case "strong": return jsx("strong", { children: renderChildren(node.children, context) }, key);
		case "emphasis": return jsx("em", { children: renderChildren(node.children, context) }, key);
		case "delete": return jsx("del", { children: renderChildren(node.children, context) }, key);
		case "inlineCode": {
			const value = node.value.replace(/\r?\n|\r/g, " ");
			const href = inlineCodeHttpUrl(value);
			if (href !== void 0) return jsx("code", { children: renderSafeLink(href, [value], "link") }, key);
			const mention = context.inLink === true ? void 0 : context.fileMentions?.resolve(value);
			if (mention !== void 0) return jsx("code", { children: jsxs("button", {
				type: "button",
				className: markdownCss.fileMention,
				title: mention.title,
				"aria-label": mention.label,
				onClick: mention.open,
				...mention.contextMenuProps,
				children: [jsx(LinkIconMedium, {
					kind: classifyLinkPath(value),
					className: markdownCss.linkIcon
				}), value]
			}) }, key);
			return jsx("code", { children: value }, key);
		}
		case "html": return context.omitHtml ? null : node.value;
		case "code": return renderCode(node, key, context);
		case "math": return jsx(Fragment$1, { children: renderTexToReact(node.value, true) }, key);
		case "inlineMath": return jsx(Fragment$1, { children: renderTexToReact(node.value, false) }, key);
		case "list": return renderList(node, key, context);
		case "listItem": return renderListItem(node, listItemLoose(node), key, context);
		case "table": return renderTable(node, key, context);
		case "link": return renderAnchor(node.url, renderChildren(node.children, {
			...context,
			inLink: true
		}), key, !anchorWrapsOnlyImages(node.children), context.streaming);
		case "linkReference": return renderLinkReference(node, key, context);
		case "image": return renderImage(node.url, node.alt ?? "", key, context);
		case "imageReference": return renderImageReference(node, key, context);
		case "footnoteReference": return renderFootnoteReference(node, key, context);
		case "definition":
		case "footnoteDefinition": return null;
		default: return null;
	}
}
function renderCode(node, key, context) {
	const language = node.lang ?? void 0;
	if (node.value === "") return jsx("pre", { children: jsx("code", { className: language === void 0 ? void 0 : `language-${language}` }) }, key);
	const lang = language === void 0 ? void 0 : /^[\w-]+/.exec(language)?.[0];
	if (!context.streaming && lang === "math") return jsx(Fragment$1, { children: renderTexToReact(`${node.value}\n`, true) }, key);
	return jsx(CodeBlock, {
		code: `${node.value}\n`,
		lang,
		streaming: context.streaming,
		copyLabel: context.labels.code.copyLabel,
		copiedLabel: context.labels.code.copiedLabel,
		toolbarLabels: context.labels.code.toolbarLabels
	}, key);
}
/** A list is loose when it or any of its items is spread; every item then keeps its paragraphs. */
function listLoose(list) {
	return (list.spread ?? false) || list.children.some(listItemLoose);
}
function listItemLoose(item) {
	return item.spread ?? item.children.length > 1;
}
function renderList(node, key, context) {
	const loose = listLoose(node);
	const properties = {};
	if (typeof node.start === "number" && node.start !== 1) properties.start = node.start;
	if (node.children.some((item) => typeof item.checked === "boolean")) properties.className = "contains-task-list";
	return createElement(node.ordered === true ? "ol" : "ul", {
		key,
		...properties
	}, ...node.children.map((item, index) => renderListItem(item, loose, index, context)));
}
function renderListItem(item, loose, key, context) {
	const entries = renderBlockEntries(item.children, context);
	const task = typeof item.checked === "boolean";
	if (task) {
		const checkbox = jsx("input", {
			type: "checkbox",
			checked: item.checked === true,
			disabled: true
		}, "task-checkbox");
		const head = entries[0];
		if (head !== void 0 && "paragraph" in head) head.paragraph = head.paragraph.length > 0 ? [
			checkbox,
			" ",
			...head.paragraph
		] : [checkbox];
		else entries.unshift({ paragraph: [checkbox] });
	}
	const parts = [];
	for (const [index, entry] of entries.entries()) {
		const isParagraph = "paragraph" in entry;
		if (loose || index !== 0 || !isParagraph) parts.push("\n");
		if (!isParagraph) parts.push(entry.element);
		else if (loose) parts.push(jsx("p", { children: entry.paragraph }, `p-${index}`));
		else parts.push(jsx(Fragment$1, { children: entry.paragraph }, `p-${index}`));
	}
	const tail = entries[entries.length - 1];
	if (tail !== void 0 && (loose || !("paragraph" in tail))) parts.push("\n");
	return jsx("li", {
		className: task ? "task-list-item" : void 0,
		children: parts
	}, key);
}
function renderTable(node, key, context) {
	const align = node.align ?? null;
	const [headRow, ...bodyRows] = node.children;
	const wide = (align === null ? headRow?.children.length ?? 0 : align.length) >= 4 && context.inBlockquote !== true;
	return jsx("div", {
		className: clsx(markdownCss.tableScroll, wide ? "md-table-wide" : markdownCss.tableFill),
		tabIndex: wide ? 0 : void 0,
		children: jsxs("table", { children: [headRow !== void 0 && jsx("thead", { children: renderTableRow(headRow, "th", align, 0, context) }), bodyRows.length > 0 && jsx("tbody", { children: bodyRows.map((row, index) => renderTableRow(row, "td", align, index + 1, context)) })] })
	}, key);
}
function renderTableRow(row, cellTag, align, key, context) {
	const length = align === null ? row.children.length : align.length;
	const cells = [];
	for (let index = 0; index < length; index++) {
		const cell = row.children[index];
		const alignValue = align?.[index];
		cells.push(createElement(cellTag, {
			key: index,
			style: alignValue == null ? void 0 : { textAlign: alignValue }
		}, ...cell === void 0 ? [] : renderChildren(cell.children, context)));
	}
	return jsx("tr", { children: cells }, key);
}
/**
* True when an anchor's markdown children are all images, so the anchor is a
* clickable picture (badge, thumbnail): the leading URL glyph would dangle
* beside the image instead of leading link text, so those anchors skip it.
*/
function anchorWrapsOnlyImages(children) {
	return children.length > 0 && children.every((child) => child.type === "image" || child.type === "imageReference");
}
/** Anchor over a safe absolute href, with optional owner navigation for HTTP(S). */
function renderSafeLink(href, children, key, glyph = true) {
	const safeHref = sanitizeUrl(href);
	if (safeHref === "") return jsx(Fragment$1, { children }, key);
	return jsx(MarkdownAnchor, {
		href: safeHref,
		glyph,
		children
	}, key);
}
function MarkdownAnchor({ href, glyph, children }) {
	const { openExternalLink, getTriggerProps } = useMarkdownDelegate();
	const external = ["http:", "https:"].includes(new URL(href).protocol);
	const open = external ? openExternalLink : void 0;
	return jsxs("a", {
		href,
		...external ? getTriggerProps?.({
			kind: "url",
			url: href
		}) : {},
		...external ? {
			target: "_blank",
			rel: "noopener noreferrer"
		} : {},
		onClick: open === void 0 ? void 0 : (event) => {
			if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
			event.preventDefault();
			open(href);
		},
		children: [glyph && jsx(LinkIconMedium, {
			kind: "url",
			href,
			className: markdownCss.linkIcon
		}), children]
	});
}
/** Local destinations use the scoped file delegate after settlement. */
function renderAnchor(url, children, key, glyph = true, streaming = false) {
	const file = parseFileLink(url);
	if (file !== void 0) {
		if (streaming) return jsx(Fragment$1, { children }, key);
		return jsx(MarkdownFileLink, {
			file,
			glyph,
			children
		}, key);
	}
	return renderSafeLink(normalizeUri(url), children, key, glyph);
}
function MarkdownFileLink({ file, glyph, children }) {
	const { openFile, fileImages, getTriggerProps } = useMarkdownDelegate();
	const [load] = useState(nextImageLoad);
	if (openFile === void 0) return jsx(Fragment, { children });
	const preview = glyph && classifyLinkPath(file.path) === "image" ? fileImages : void 0;
	const resolved = preview?.resolve(file.path);
	const src = resolved === void 0 ? void 0 : freshImageUrl(resolved, load);
	const anchor = jsxs("button", {
		type: "button",
		className: clsx(markdownCss.fileMention, markdownCss.fileLink),
		title: src === void 0 ? file.path : void 0,
		...getTriggerProps?.({
			kind: "file",
			...file
		}),
		onClick: () => {
			openFile(file.path, file.line === void 0 ? void 0 : { line: file.line });
		},
		children: [glyph && jsx(LinkIconMedium, {
			kind: classifyLinkPath(file.path),
			className: markdownCss.linkIcon
		}), children]
	});
	if (src === void 0 || preview === void 0) return anchor;
	return jsx(HoverCard, {
		inline: true,
		anchor,
		content: jsxs(Fragment, { children: [jsx(ImagePreview, {
			src,
			alt: file.path,
			loadingLabel: preview.labels.loading,
			failedLabel: preview.labels.failed
		}), jsx("span", {
			className: markdownCss.previewName,
			children: file.path.split(/[\\/]/u).pop()
		})] })
	});
}
/**
* The complete inline-code value when it is exactly an absolute HTTP(S) URL
* (no surrounding whitespace); anything else stays inert code.
*/
function inlineCodeHttpUrl(value) {
	if (value.trim() !== value) return void 0;
	try {
		const protocol = new URL(value).protocol;
		return protocol === "http:" || protocol === "https:" ? value : void 0;
	} catch {
		return;
	}
}
function renderImage(url, alt, key, context) {
	return jsx(MarkdownImage, {
		destination: url,
		alt,
		pathImages: context.pathImages,
		streaming: context.streaming,
		inLink: context.inLink === true
	}, `${key}:${url}`);
}
function MarkdownImage({ destination, alt, pathImages, streaming, inLink }) {
	const { fileImages } = useMarkdownDelegate();
	const [load] = useState(nextImageLoad);
	const file = streaming ? void 0 : parseFileLink(destination);
	const resolved = file === void 0 ? void 0 : fileImages?.resolve(file.path);
	const src = resolved === void 0 ? imageSource(destination, pathImages, load) : freshImageUrl(resolved, load);
	if (src === void 0) return jsx("span", {
		className: markdownCss.imageAlt,
		children: alt
	});
	return jsx(LoadedMarkdownImage, {
		src,
		alt,
		destination,
		preview: inLink ? void 0 : fileImages
	}, src);
}
function LoadedMarkdownImage({ src, alt, destination, preview }) {
	const { getTriggerProps } = useMarkdownDelegate();
	const [failed, setFailed] = useState(false);
	const [open, setOpen] = useState(false);
	const close = useCallback(() => {
		setOpen(false);
	}, []);
	if (failed) return jsxs("span", {
		className: markdownCss.imageAlt,
		children: [preview === void 0 ? "" : `${preview.labels.failed} · `, alt || destination]
	});
	const file = parseFileLink(destination);
	const contextMenuProps = getTriggerProps?.({
		kind: "image",
		url: src,
		...file === void 0 ? {} : { path: file.path }
	});
	const imageProps = {
		className: markdownCss.image,
		src,
		alt,
		onError: () => {
			setFailed(true);
		},
		loading: "lazy",
		decoding: "async",
		referrerPolicy: "no-referrer"
	};
	if (preview === void 0) return jsx("img", {
		...imageProps,
		...contextMenuProps
	});
	const localFileName = file?.path.split(/[\\/]/u).at(-1);
	const urlFileName = destination.split("/").at(-1)?.split(/[?#]/u)[0];
	const exportName = localFileName || urlFileName || "image";
	const img = jsx(DraggableImage, {
		fileDrag: preview.fileDrag,
		...imageProps,
		resourceAddress: file === void 0 ? void 0 : preview.resourceAddress?.(file.path),
		name: exportName
	});
	return jsxs(Fragment, { children: [jsx("button", {
		type: "button",
		className: markdownCss.imageButton,
		title: preview.labels.open,
		...contextMenuProps,
		"aria-label": alt ? `${preview.labels.open}: ${alt}` : preview.labels.open,
		onClick: () => {
			setOpen(true);
		},
		children: img
	}), open && jsx(ImageLightbox, {
		src,
		alt,
		labels: preview.labels,
		onClose: close,
		contextMenuProps
	})] });
}
/** The bracketed source text a reference reverts to when its definition is missing. */
function referenceSuffix(node) {
	if (node.referenceType === "collapsed") return "][]";
	if (node.referenceType === "full") return `][${node.label ?? node.identifier}]`;
	return "]";
}
function renderLinkReference(node, key, context) {
	const definition = context.targets.definitions.get(node.identifier.toUpperCase());
	if (definition === void 0) return jsxs(Fragment$1, { children: [
		"[",
		renderChildren(node.children, context),
		referenceSuffix(node)
	] }, key);
	const rendered = renderChildren(node.children, {
		...context,
		inLink: true
	});
	return renderAnchor(definition.url, rendered, key, !anchorWrapsOnlyImages(node.children), context.streaming);
}
function renderImageReference(node, key, context) {
	const definition = context.targets.definitions.get(node.identifier.toUpperCase());
	if (definition === void 0) return `![${node.alt ?? ""}${referenceSuffix(node)}`;
	return renderImage(definition.url, node.alt ?? "", key, context);
}
function renderFootnoteReference(node, key, context) {
	const id = node.identifier.toUpperCase();
	const seen = context.footnoteCounts.get(id);
	if (seen === void 0) context.footnoteOrder.push(id);
	context.footnoteCounts.set(id, (seen ?? 0) + 1);
	return jsx("sup", { children: String(context.footnoteOrder.indexOf(id) + 1) }, key);
}
/**
* Render the trailing footnote section for every footnote referenced during
* the pass, in first-reference order, with one plain-text back-reference
* marker per rendered reference.
* @param context - The pass state after all blocks rendered.
* @returns The section, or null when no referenced footnote has a definition.
*/
function renderFootnoteSection(context) {
	const items = [];
	for (const id of context.footnoteOrder) {
		const definition = context.targets.footnotes.get(id);
		if (definition === void 0) continue;
		const count = context.footnoteCounts.get(id) ?? 0;
		const backrefs = [];
		for (let reference = 1; reference <= count; reference++) {
			if (backrefs.length > 0) backrefs.push(" ");
			backrefs.push("↩");
			if (reference > 1) backrefs.push(jsx("sup", { children: String(reference) }, `re-${reference}`));
		}
		const entries = renderBlockEntries(definition.children, context);
		const tail = entries[entries.length - 1];
		const body = entries.map((entry, index) => "paragraph" in entry ? jsxs("p", { children: [entry.paragraph, entry === tail && jsxs(Fragment, { children: [" ", backrefs] })] }, `p-${index}`) : entry.element);
		if (tail === void 0 || !("paragraph" in tail)) body.push(...backrefs);
		items.push(jsx("li", {
			id: `user-content-fn-${normalizeUri(id.toLowerCase())}`,
			children: wrapBlockChildren(body, true)
		}, id));
	}
	if (items.length === 0) return null;
	return jsxs("section", {
		"data-footnotes": true,
		className: "footnotes",
		children: [jsx("h2", {
			id: "footnote-label",
			className: "sr-only",
			children: context.labels.footnotes
		}), jsx("ol", { children: items })]
	}, "footnotes");
}
