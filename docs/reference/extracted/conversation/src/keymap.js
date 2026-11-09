// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/input/editor/keymap.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Composition state a keydown can trust (see the module doc's Safari note). */
function isComposingEvent(event, recentlyComposing) {
	return event.isComposing || event.keyCode === 229 || recentlyComposing();
}
function isApplePlatform() {
	return typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}
/** Whether the browser caret touches one side of an atomic quote element. */
function domCaretTouches(element, backward) {
	const selection = element.ownerDocument.defaultView?.getSelection();
	if (selection === null || selection === void 0 || !selection.isCollapsed) return false;
	const focus = selection.focusNode;
	if (focus === null) return false;
	const parent = element.parentNode;
	if (parent === null) return false;
	const offset = selection.focusOffset;
	if (focus === parent) return focus.childNodes.item(backward ? offset - 1 : offset) === element;
	if (focus.nodeType === Node.TEXT_NODE) {
		const size = focus.textContent?.length ?? 0;
		if (backward ? offset !== 0 : offset !== size) return false;
	} else if (backward ? offset !== 0 : offset !== focus.childNodes.length) return false;
	let boundary = focus;
	while (boundary.parentNode !== null && boundary.parentNode !== parent) {
		if ((backward ? boundary.previousSibling : boundary.nextSibling) !== null) return false;
		boundary = boundary.parentNode;
	}
	return boundary.parentNode === parent && (backward ? boundary.previousSibling : boundary.nextSibling) === element;
}
/** Find an atomic quote immediately beside both editor and browser carets. */
function adjacentQuote(editor, backward) {
	const selection = Kr();
	if (!ur(selection) || !selection.isCollapsed()) return null;
	const adjacent = kl(selection.focus, backward);
	if (!$isQuoteNode(adjacent)) return null;
	const element = editor.getElementByKey(adjacent.getKey());
	return element !== null && domCaretTouches(element, backward) ? adjacent : null;
}
function lineLeadingQuoteBeforeSelection(editor) {
	let quote = adjacentQuote(editor, true);
	if (quote === null) return null;
	let previous = quote.getPreviousSibling();
	while (previous !== null) {
		if (Yi(previous)) return quote;
		if ($isQuoteNode(previous)) {
			quote = previous;
			previous = previous.getPreviousSibling();
			continue;
		}
		if (!Xo(previous)) return null;
		const text = previous.getTextContent();
		const lastBreak = text.lastIndexOf("\n");
		if (lastBreak >= 0) return text.slice(lastBreak + 1) === "" ? quote : null;
		if (text.trim() !== "") return null;
		const precedingQuote = previous.getPreviousSibling();
		if (!$isQuoteNode(precedingQuote)) return null;
		quote = precedingQuote;
		previous = quote.getPreviousSibling();
	}
	return quote;
}
/** Put the browser caret before an adjacent line-leading quote. */
function moveBeforeQuote(editor, event) {
	if (event.shiftKey) return false;
	const quote = lineLeadingQuoteBeforeSelection(editor);
	if (quote === null) return false;
	const element = editor.getElementByKey(quote.getKey());
	if (element === null) return false;
	const view = element.ownerDocument.defaultView;
	if (view === null) return false;
	const domSelection = view.getSelection();
	if (domSelection === null) return false;
	const range = element.ownerDocument.createRange();
	range.setStartBefore(element);
	range.collapse(true);
	domSelection.removeAllRanges();
	domSelection.addRange(range);
	event.preventDefault();
	return true;
}
/** Move from immediately before a quote to the end of its hard line. */
function movePastQuote(editor, event) {
	if (!isApplePlatform() || event.key !== "ArrowRight" || !event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return false;
	const quote = adjacentQuote(editor, false);
	if (quote === null) return false;
	const block = quote.getParent();
	if (!Pi(block)) return false;
	let lineEnd = quote.getIndexWithinParent() + 1;
	while (lineEnd < block.getChildrenSize()) {
		const child = block.getChildAtIndex(lineEnd);
		if (Yi(child)) break;
		if (Xo(child)) {
			const hardBreak = child.getTextContent().indexOf("\n");
			if (hardBreak >= 0) {
				event.preventDefault();
				child.select(hardBreak, hardBreak);
				return true;
			}
		}
		lineEnd += 1;
	}
	event.preventDefault();
	block.select(lineEnd, lineEnd);
	return true;
}
/**
* Register the composer keymap on one editor.
* @param editor - the shell-owned editor.
* @param handlers - bar-supplied behavior.
* @returns the unregister disposer.
*/
function registerComposerKeymap(editor, handlers) {
	let composing = false;
	let composingUntil = 0;
	let rootElement = null;
	const syncComposition = () => {
		rootElement?.toggleAttribute("data-composer-composing", composing || editor.isComposing());
	};
	const onCompositionStart = () => {
		composing = true;
		syncComposition();
	};
	const onCompositionEnd = () => {
		composing = false;
		composingUntil = Date.now() + 10;
		editor.update(() => {}, { onUpdate: syncComposition });
	};
	const recentlyComposing = () => composing || Date.now() < composingUntil;
	const arrow = (key) => (event) => {
		const inComposition = event !== null && isComposingEvent(event, recentlyComposing);
		if (handlers.arbitrate(key, inComposition) !== "pass") {
			event?.preventDefault();
			return true;
		}
		return false;
	};
	return Eu(editor.registerRootListener((root, prevRoot) => {
		prevRoot?.removeEventListener("compositionstart", onCompositionStart);
		prevRoot?.removeEventListener("compositionend", onCompositionEnd);
		prevRoot?.removeAttribute("data-composer-composing");
		composing = false;
		composingUntil = 0;
		rootElement = root;
		root?.addEventListener("compositionstart", onCompositionStart);
		root?.addEventListener("compositionend", onCompositionEnd);
		syncComposition();
	}), editor.registerCommand(tn$2, (event) => {
		if (!isApplePlatform() || !event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return false;
		if (event.key.toLowerCase() === "a") return moveBeforeQuote(editor, event);
		return false;
	}, 4), editor.registerCommand(nn$2, (event) => movePastQuote(editor, event), 4), editor.registerUpdateListener(syncComposition), editor.registerCommand(sn$2, arrow("up"), 4), editor.registerCommand(ln$2, arrow("down"), 4), editor.registerCommand(hn$2, (event) => arrow(event.shiftKey ? "tabBack" : "tab")(event), 4), editor.registerCommand(fn$1, (event) => {
		handlers.dismissPopup();
		if (handlers.arbitrate("escape", isComposingEvent(event, recentlyComposing)) === "consumed") {
			event.preventDefault();
			return true;
		}
		return false;
	}, 4), editor.registerCommand(an$1, (event) => {
		if (isComposingEvent(event, recentlyComposing)) return false;
		if (handlers.space()) {
			event.preventDefault();
			return true;
		}
		return false;
	}, 4), editor.registerCommand(cn$1, (event) => {
		if (event !== null && (event.altKey || event.getModifierState("AltGraph") || event.ctrlKey && event.metaKey || event.shiftKey && (event.ctrlKey || event.metaKey))) return true;
		if (event?.shiftKey === true) return false;
		if (event !== null && isComposingEvent(event, recentlyComposing)) return true;
		if (handlers.arbitrate("enter", false) !== "pass") {
			event?.preventDefault();
			return true;
		}
		event?.preventDefault();
		if (event?.repeat === true) return true;
		if (!handlers.canSubmit()) return true;
		handlers.submit(event?.ctrlKey === true || event?.metaKey === true);
		return true;
	}, 4), editor.registerCommand(Je$2, (event) => {
		const clipboardData = event.clipboardData ?? null;
		if (clipboardData === null) return false;
		const files = [];
		const directories = /* @__PURE__ */ new Set();
		for (const item of clipboardData.items) {
			if (item.kind !== "file") continue;
			const file = item.getAsFile();
			if (file === null) continue;
			files.push(file);
			if (typeof item.webkitGetAsEntry === "function" && item.webkitGetAsEntry()?.isDirectory === true) directories.add(file);
		}
		if (files.length > 0) handlers.intakeFiles(files, directories.size === 0 ? void 0 : directories);
		const text = clipboardData.getData("text/plain");
		if (text === "") {
			if (files.length === 0) return false;
			event.preventDefault();
			return true;
		}
		event.preventDefault();
		handlers.pasteText(text);
		return true;
	}, 4));
}
