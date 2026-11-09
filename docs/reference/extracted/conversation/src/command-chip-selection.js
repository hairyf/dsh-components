// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/input/editor/command-chip-selection.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Keys that never clear a selected chip by themselves: bare modifiers, and
* IME or virtual-keyboard keys whose deletion arrives later as an input event.
*/
const PASSIVE_KEYS = new Set([
	"Shift",
	"Control",
	"Alt",
	"Meta",
	"Unidentified",
	"Process"
]);
/** The chip a collapsed caret deletes next in one direction, or null. */
function $commandChipBesideCaret(isBackward) {
	const selection = Kr();
	if (!ur(selection) || !selection.isCollapsed()) return null;
	const node = kl(selection.focus, isBackward);
	return $isCommandChipNode(node) ? node : null;
}
/** Deletion direction of an input event type; null for other input. */
function deletionDirection(inputType) {
	if (inputType === "deleteContentBackward") return true;
	if (inputType === "deleteContentForward") return false;
	return null;
}
/**
* Register two-step deletion for the command chip.
* @param editor - the shell-owned editor.
* @returns the unregister disposer, which also clears a selected chip.
*/
function registerCommandChipSelection(editor) {
	let selected = null;
	/** A keydown with a selected chip whose dispatch has produced no character deletion yet. */
	let keyWithoutDeletion = false;
	const paint = (next) => {
		if (selected !== null && selected.key !== next?.key) editor.getElementByKey(selected.key)?.removeAttribute("data-selected");
		selected = next;
		if (next !== null) editor.getElementByKey(next.key)?.setAttribute("data-selected", "");
		editor.getRootElement()?.toggleAttribute("data-composer-chip-selected", next !== null);
	};
	const clear = () => {
		if (selected !== null) paint(null);
		return false;
	};
	/**
	* Decide one character deletion.
	* @param isBackward - deletion direction.
	* @param clearOnPass - whether letting the deletion run clears the selection here;
	* an input event leaves it for the deletion that follows.
	* @returns true when the deletion only selected the chip and must be consumed.
	*/
	const $decide = (isBackward, clearOnPass) => {
		keyWithoutDeletion = false;
		const chip = $commandChipBesideCaret(isBackward);
		if (chip === null) return clear();
		if (selected?.key === chip.getKey() && selected.isBackward === isBackward) return clearOnPass ? clear() : false;
		paint({
			key: chip.getKey(),
			isBackward
		});
		return true;
	};
	return Eu(editor.registerCommand(ze$2, (event) => {
		const isBackward = deletionDirection(event.inputType);
		if (isBackward === null || !$decide(isBackward, false)) return false;
		event.preventDefault();
		return true;
	}, 3), editor.registerCommand($e$2, (isBackward) => $decide(isBackward, true), 3), editor.registerCommand(tn$2, (event) => {
		if (selected === null || PASSIVE_KEYS.has(event.key)) return false;
		keyWithoutDeletion = true;
		queueMicrotask(() => {
			if (!keyWithoutDeletion) return;
			keyWithoutDeletion = false;
			clear();
		});
		return false;
	}, 4), editor.registerCommand(Ke$2, clear, 4), editor.registerCommand(Mn$1, clear, 4), editor.registerUpdateListener(({ editorState }) => {
		const current = selected;
		if (current === null) return;
		paint(editorState.read(() => $commandChipBesideCaret(current.isBackward)?.getKey() === current.key) ? current : null);
	}), () => {
		paint(null);
	});
}
/**
* Walk the composer document once, producing every projection segment in
* document order. Blocks (paragraphs) contribute a one-newline gap between
* one another in both text projections.
* @returns the layout for this EditorState.
*/
function $composerLayout() {
	const segments = [];
	const byKey = /* @__PURE__ */ new Map();
	const children = /* @__PURE__ */ new Map();
	const bounds = /* @__PURE__ */ new Map();
	let detect = "";
	let clipboard = "";
	const pushLeaf = (kind, node, detectPiece, clipboardPiece) => {
		const segment = {
			kind,
			node,
			detectStart: detect.length,
			detectLength: detectPiece.length,
			clipboardStart: clipboard.length,
			clipboardLength: clipboardPiece.length
		};
		segments.push(segment);
		byKey.set(node.getKey(), segment);
		detect += detectPiece;
		clipboard += clipboardPiece;
	};
	const walkElement = (element) => {
		const start = detect.length;
		const kids = element.getChildren();
		children.set(element.getKey(), kids.map((kid) => kid.getKey()));
		for (const kid of kids) if ($isReferenceChipNode(kid) || $isCommandChipNode(kid) || $isQuoteNode(kid)) pushLeaf("chip", kid, "￼", kid.getTextContent());
		else if (Xo(kid)) {
			const text = kid.getTextContent();
			pushLeaf("text", kid, text, text);
		} else if (Yi(kid)) pushLeaf("linebreak", kid, "\n", "\n");
		else if (Pi(kid))
 /* v8 ignore next 4 -- plain-text composition nests no block elements today; the walk stays total for imported states. */
		walkElement(kid);
		bounds.set(element.getKey(), {
			start,
			end: detect.length
		});
	};
	const root = nl();
	const blocks = root.getChildren();
	children.set(root.getKey(), blocks.map((block) => block.getKey()));
	const rootStart = detect.length;
	blocks.forEach((block, index) => {
		const previous = blocks[index - 1];
		if (index > 0 && previous !== void 0) {
			segments.push({
				kind: "gap",
				node: null,
				detectStart: detect.length,
				detectLength: 1,
				clipboardStart: clipboard.length,
				clipboardLength: 1,
				gapBetween: {
					before: previous.getKey(),
					after: block.getKey()
				}
			});
			detect += "\n";
			clipboard += "\n";
		}
		if (Pi(block)) walkElement(block);
	});
	bounds.set(root.getKey(), {
		start: rootStart,
		end: detect.length
	});
	return {
		segments,
		detectLength: detect.length,
		detectText: detect,
		clipboardText: clipboard,
		byKey,
		children,
		bounds
	};
}
/**
* Fold one clipboard-projection offset to its detect-projection twin.
* Offsets inside a chip's clipboard expansion snap to the chip's trailing
* edge; callers only pass boundaries that were once a document end (submit
* snapshots), which never split a chip.
* @param layout - the current walk product.
* @param clipboardOffset - offset into the clipboard projection.
* @returns the detect offset covering the same document position.
*/
function detectOffsetOfClipboardOffset(layout, clipboardOffset) {
	for (const segment of layout.segments) {
		const end = segment.clipboardStart + segment.clipboardLength;
		if (clipboardOffset > end) continue;
		if (clipboardOffset === end) return segment.detectStart + segment.detectLength;
		if (segment.kind === "chip") return segment.detectStart + segment.detectLength;
		return segment.detectStart + (clipboardOffset - segment.clipboardStart);
	}
	return layout.detectLength;
}
/**
* Fold one selection point to a detect offset.
* @param layout - the current walk product.
* @param point - selection anchor/focus point.
* @returns detect offset, or null when the point references an unknown node.
*/
function $detectOffsetOfPoint(layout, point) {
	if (point.type === "text") {
		const segment = layout.byKey.get(point.key);
		return segment === void 0 ? null : segment.detectStart + Math.min(point.offset, segment.detectLength);
	}
	const kids = layout.children.get(point.key);
	const elementBounds = layout.bounds.get(point.key);
	if (kids === void 0 || elementBounds === void 0) return null;
	if (point.offset >= kids.length) return elementBounds.end;
	const childKey = kids[point.offset];
	if (childKey === void 0) return elementBounds.end;
	const childSegment = layout.byKey.get(childKey);
	if (childSegment !== void 0) return childSegment.detectStart;
	const childBounds = layout.bounds.get(childKey);
	return childBounds === void 0 ? null : childBounds.start;
}
/**
* Project the composer document and its caret.
* @param idOf - stable occurrence-id assignment per chip NodeKey (the shell
* owns the map so ids survive across projections of the same node).
* @returns the three-view projection product.
*/
function $projectComposer(idOf) {
	const layout = $composerLayout();
	const occurrences = [];
	const quotes = [];
	for (const segment of layout.segments) {
		if (segment.kind !== "chip") continue;
		if ($isQuoteNode(segment.node)) {
			quotes.push({
				offset: segment.clipboardStart,
				length: segment.clipboardLength,
				text: segment.node.getQuoteText()
			});
			continue;
		}
		if (!$isReferenceChipNode(segment.node)) continue;
		const chip = segment.node;
		occurrences.push({
			occurrenceId: idOf(chip.getKey()),
			source: chip.getSource(),
			ref: chip.getReference(),
			offset: segment.clipboardStart,
			length: segment.clipboardLength,
			label: chip.getLabel(),
			...chip.getAppearance() === void 0 ? {} : { appearance: chip.getAppearance() },
			clipboardText: chip.getTextContent(),
			...chip.isInvalid() ? { invalid: true } : {}
		});
	}
	const lead = layout.segments[0]?.node;
	const selection = Kr();
	let range = null;
	if (ur(selection)) {
		const anchor = $detectOffsetOfPoint(layout, selection.anchor);
		const focus = $detectOffsetOfPoint(layout, selection.focus);
		if (anchor !== null && focus !== null) range = {
			start: Math.min(anchor, focus),
			end: Math.max(anchor, focus)
		};
	}
	return {
		detectText: layout.detectText,
		clipboardText: layout.clipboardText,
		occurrences,
		quotes,
		selection: range,
		caret: range !== null && range.start === range.end ? range.start : null,
		command: $isCommandChipNode(lead) ? lead.getClaim() : void 0
	};
}
