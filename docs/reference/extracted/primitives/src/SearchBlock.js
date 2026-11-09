// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/SearchBlock.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Result rows shown before the height cap collapses the middle. Matches
* {@link DEFAULT_TERMINAL_MAX_LINES} so a search card and a terminal card cut a
* long result at the same place.
*/
const DEFAULT_SEARCH_MAX_LINES = 16;
/**
* The plain-text form the copy control writes: the whole structured result
* regardless of the height cap or which groups are collapsed, so the clipboard
* carries the result rather than what the card happens to be showing.
* @param props - the card's props.
* @returns the copyable text, or the empty string for an empty result.
*/
function copyText(props) {
	if (props.kind === "paths") return props.paths.join("\n");
	return props.files.map((file) => [file.path, ...file.matches.map((m) => `${m.lineNumber}: ${m.line}`)].join("\n")).join("\n\n");
}
/**
* Number of retained results the card holds: the matched-line count across all
* files for a matches card, the path count for a paths card. This is the count
* the banner summary reports against `total` when the result was capped.
* @param props - the card's props.
* @returns the retained result count.
*/
function shownCount(props) {
	return props.kind === "paths" ? props.paths.length : props.files.reduce((sum, file) => sum + file.matches.length, 0);
}
/**
* The banner summary. When the search was capped it reads `显示 X / 共 N …` so
* the retained count and the pre-cap total sit in one clause (mirroring the read
* card's `显示 X / Y 行`); when it was not capped it is a plain count of what the
* card holds. The unit — `处匹配 · K 个文件` for grep, `个路径` for glob — trails
* the count either way.
* @param props - the card's props.
* @param shown - the retained result count from {@link shownCount}.
* @param truncated - whether the search was capped.
* @param total - the pre-cap total the truncation clause reports.
* @returns the summary text.
*/
function summaryText(props, shown, truncated, total) {
	return props.kind === "paths" ? props.labels.pathsSummary(shown, total, truncated) : props.labels.matchesSummary(shown, total, props.files.length, truncated);
}
/**
* Flatten a card's shape into its render rows, dropping a collapsed file
* group's match rows.
* @param props - the card's props.
* @param collapsed - the set of collapsed file-group indices (matches only).
* @returns the flattened rows in output order.
*/
function toRows(props, collapsed) {
	if (props.kind === "paths") return props.paths.map((path) => ({
		type: "path",
		path
	}));
	const rows = [];
	props.files.forEach((file, index) => {
		const isCollapsed = collapsed.has(index);
		rows.push({
			type: "file",
			path: file.path,
			count: file.matches.length,
			index,
			collapsed: isCollapsed
		});
		if (isCollapsed) return;
		for (const match of file.matches) rows.push({
			type: "match",
			lineNumber: match.lineNumber,
			line: match.line,
			key: `${index}:${match.lineNumber}`,
			fileIndex: index
		});
	});
	return rows;
}
/**
* A stable React key for a flattened render row: the group-scoped match key, a
* file-index-scoped header key, or the path itself. Rows of different types
* never collide, since each key carries its type prefix or the group index.
* @param row - the flattened row.
* @returns the key.
*/
function rowKey(row) {
	switch (row.type) {
		case "match": return `match:${row.key}`;
		case "file": return `file:${row.index}`;
		case "path": return `path:${row.path}`;
	}
}
/**
* Render a completed search as a grouped-matches or flat-path card.
* @param props - see {@link SearchBlockProps}.
* @returns the search block element.
*/
function SearchBlock(props) {
	const { truncated, total, maxLines = 16, className } = props;
	const [expanded, setExpanded] = useState(false);
	const [collapsed, setCollapsed] = useState(() => /* @__PURE__ */ new Set());
	const rows = toRows(props, collapsed);
	const shown = shownCount(props);
	const empty = rows.length === 0;
	const { copied, onCopy } = useClipboardCopy(copyText(props));
	const onToggle = useCallback(() => {
		setExpanded((value) => !value);
	}, []);
	const toggleFile = useCallback((index) => {
		setCollapsed((prev) => {
			const next = new Set(prev);
			if (next.has(index)) next.delete(index);
			else next.add(index);
			return next;
		});
	}, []);
	const { hidden, capped, headLines, tailLines } = headTailCap(rows.length, maxLines, expanded);
	const head = capped ? rows.slice(0, headLines) : rows;
	const naturalTail = capped ? rows.slice(rows.length - tailLines) : [];
	const tailLead = naturalTail[0];
	const tailHeader = tailLead?.type === "match" && !head.some((row) => row.type === "file" && row.index === tailLead.fileIndex) ? rows.find((row) => row.type === "file" && row.index === tailLead.fileIndex) : void 0;
	const tail = tailHeader === void 0 ? naturalTail : naturalTail.slice(1);
	const renderRow = (row) => {
		if (row.type === "path") return jsx("div", {
			className: css$36.line,
			children: row.path
		});
		if (row.type === "match") return jsxs("div", {
			className: css$36.line,
			children: [jsxs("span", {
				className: css$36.lineNumber,
				children: [row.lineNumber, ": "]
			}), row.line]
		});
		return jsxs("button", {
			type: "button",
			className: css$36.fileHeader,
			"aria-expanded": !row.collapsed,
			onClick: () => {
				toggleFile(row.index);
			},
			children: [jsx("span", {
				className: css$36.filePath,
				children: row.path
			}), jsx("span", {
				className: css$36.fileCount,
				children: row.count
			})]
		});
	};
	return jsxs("div", {
		className: clsx(css$36.block, className),
		"data-search": props.kind,
		children: [jsxs("div", {
			className: css$36.header,
			children: [jsx("span", {
				className: css$36.summary,
				children: summaryText(props, shown, truncated, total)
			}), !empty && jsx("button", {
				type: "button",
				className: css$36.copyButton,
				onClick: onCopy,
				children: copied ? props.labels.copied : props.labels.copy
			})]
		}), empty ? jsx("div", {
			className: css$36.empty,
			children: props.labels.noResults
		}) : jsxs("div", {
			className: css$36.body,
			children: [
				head.map((row) => jsx("div", { children: renderRow(row) }, rowKey(row))),
				hidden > 0 && jsx("button", {
					type: "button",
					className: css$36.expand,
					"aria-expanded": expanded,
					"aria-label": expanded ? props.labels.collapseAria : props.labels.expandAria(hidden),
					onClick: onToggle,
					children: expanded ? props.labels.collapse : props.labels.expand(hidden)
				}),
				tailHeader !== void 0 && jsx("div", { children: renderRow(tailHeader) }, `tailHeader:${rowKey(tailHeader)}`),
				tail.map((row) => jsx("div", { children: renderRow(row) }, rowKey(row)))
			]
		})]
	});
}
