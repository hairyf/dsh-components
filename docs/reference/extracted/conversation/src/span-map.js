// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/input/editor/span-map.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Resolve one detect offset to a selection point. Ownership rule: the first
* segment whose half-open [start, end) contains the offset resolves it; the
* document end falls to the last block. Atomic segments (chip, linebreak)
* resolve to element points beside them, so a span can only ever address a
* chip as a whole; a gap offset is the end of the block before it.
* @param layout - current walk product.
* @param offset - detect offset in [0, detectLength].
* @returns the point, or null when the offset is out of bounds.
*/
function resolvePoint(layout, offset) {
	if (offset < 0 || offset > layout.detectLength) return null;
	for (const segment of layout.segments) {
		if (offset >= segment.detectStart + segment.detectLength) continue;
		if (segment.kind === "text" && segment.node !== null) return {
			key: segment.node.getKey(),
			offset: offset - segment.detectStart,
			type: "text"
		};
		if (segment.kind === "gap" && segment.gapBetween !== void 0) {
			const before = segment.gapBetween.before;
			return {
				key: before,
				offset: layout.children.get(before)?.length ?? 0,
				type: "element"
			};
		}
		/* v8 ignore next -- non-gap segments always carry their node. */
		if (segment.node === null) return null;
		const element = segment.node.getParent();
		/* v8 ignore next -- a walked leaf always has a parent element. */
		if (element === null) return null;
		return {
			key: element.getKey(),
			offset: segment.node.getIndexWithinParent(),
			type: "element"
		};
	}
	const blocks = nl().getChildren();
	const last = blocks[blocks.length - 1];
	if (last === void 0) return {
		key: nl().getKey(),
		offset: 0,
		type: "element"
	};
	return {
		key: last.getKey(),
		offset: layout.children.get(last.getKey())?.length ?? 0,
		type: "element"
	};
}
/**
* Build and apply a live RangeSelection over one detect span.
* @param layout - current walk product.
* @param span - detect span.
* @returns the applied selection, or null when either endpoint fails to map.
*/
function selectSpan(layout, span) {
	if (span.start < 0 || span.start > span.end || span.end > layout.detectLength) return null;
	const anchor = resolvePoint(layout, span.start);
	const focus = resolvePoint(layout, span.end);
	/* v8 ignore next -- bounds were checked above; resolvePoint only fails out of bounds. */
	if (anchor === null || focus === null) return null;
	const selection = Fr();
	selection.anchor.set(anchor.key, anchor.offset, anchor.type);
	selection.focus.set(focus.key, focus.offset, focus.type);
	ol(selection);
	return selection;
}
/**
* Replace one detect span with plain text (empty text deletes the span).
* The caret lands after the insertion.
* @param span - detect span to replace.
* @param text - replacement text.
* @returns whether the span mapped and the edit applied.
*/
function $replaceDetectSpanWithText(span, text) {
	const selection = selectSpan($composerLayout(), span);
	if (selection === null) return false;
	if (text === "" && !selection.isCollapsed()) selection.removeText();
	else selection.insertText(text);
	return true;
}
/**
* Replace one detect span with nodes (chip insertion path). The caret lands
* after the last inserted node.
* @param span - detect span to replace.
* @param nodes - replacement nodes in order.
* @returns whether the span mapped and the edit applied.
*/
function $replaceDetectSpanWithNodes(span, nodes) {
	const selection = selectSpan($composerLayout(), span);
	if (selection === null) return false;
	selection.insertNodes([...nodes]);
	return true;
}
