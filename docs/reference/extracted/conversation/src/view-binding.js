// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/input/editor/view-binding.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Transfer mobile editor focus after a submission empties the draft.
* A control the user already focused retains focus.
* @param editor - the Session-owned editor.
* @param destination - stable, focusable non-text element that retains the composer's keyboard position.
* @returns the update-listener cleanup.
*/
function installDraftKeyboardDismissal(editor, destination) {
	return editor.registerUpdateListener(({ editorState, tags }) => {
		if (!tags.has("dsh-draft-submitted") || !(0, _deepseek_ai_dsh_client_ui_primitives.isMobileDevice)()) return;
		const input = editor.getRootElement();
		if (input === null || input.ownerDocument.activeElement !== input) return;
		if (editorState.read(() => nl().getTextContentSize() === 0) && destination.current !== null) (0, _deepseek_ai_dsh_client_ui_primitives.focusWithoutRing)(destination.current, { preventScroll: true });
	});
}
/**
* Reveal the DOM selection within the draft's own scrollport.
* @param scrollRef - the InputBar-owned scrollport reference.
*/
function revealDraftSelection(scrollRef) {
	const scrollEl = scrollRef.current;
	if (scrollEl === null || scrollEl.scrollHeight <= scrollEl.clientHeight) return;
	const selection = window.getSelection();
	if (selection === null || selection.rangeCount === 0) return;
	let rect = selection.getRangeAt(0).getBoundingClientRect();
	if (rect.height === 0 && rect.width === 0) {
		const anchor = selection.anchorNode;
		const el = anchor instanceof HTMLElement ? anchor : anchor?.parentElement;
		if (el === void 0 || el === null) return;
		rect = el.getBoundingClientRect();
	}
	const box = scrollEl.getBoundingClientRect();
	if (rect.bottom > box.bottom) scrollEl.scrollTop += rect.bottom - box.bottom;
	else if (rect.top < box.top) scrollEl.scrollTop -= box.top - rect.top;
}
/**
* Focus the borrowed editor and reveal its restored selection.
* @param editor - the Session-owned editor.
* @param revealSelection - reveal the selection after Lexical restores it.
*/
function focusDraftEditor(editor, revealSelection) {
	editor.getRootElement()?.focus({ preventScroll: true });
	editor.focus(() => {
		revealSelection();
	});
}
/**
* Forward wheel movement at the draft's edge to its conversation scrollport.
* @param scrollRef - the InputBar-owned scrollport reference.
* @returns the listener cleanup, or undefined when the element is absent.
*/
function installDraftWheel(scrollRef) {
	const el = scrollRef.current;
	if (el === null) return;
	const onWheel = (e) => {
		const host = el.closest("[data-conversation-scroll]");
		if (!(host instanceof HTMLElement) || e.deltaY === 0) return;
		const atTop = el.scrollTop <= 0;
		const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
		if (e.deltaY < 0 && !atTop || e.deltaY > 0 && !atEnd) return;
		e.preventDefault();
		host.scrollTop += e.deltaY;
	};
	el.addEventListener("wheel", onWheel, { passive: false });
	return () => {
		el.removeEventListener("wheel", onWheel);
	};
}
/**
* Bind this view's file dialog through the existing keyboard face.
* @param keyboard - the Session-owned composer operations.
* @param gate - live intake availability retained by InputBar.
* @param fileInputRef - the view's native file input.
* @returns the picker unbind disposer.
*/
function installDraftFilePicker(keyboard, gate, fileInputRef) {
	return keyboard.bindFilePicker({
		available: () => gate.current.canAcceptDrop && fileInputRef.current !== null && !fileInputRef.current.disabled,
		open: () => {
			fileInputRef.current?.click();
		}
	});
}
/**
* Bind editor gestures to the view's live guards and Session operations.
* @param editor - the borrowed Session-owned editor.
* @param keyboard - the existing composer keyboard operations.
* @param gate - live view values read by the installed handlers.
* @returns the keymap disposer.
*/
function installDraftKeymap(editor, keyboard, gate) {
	return registerComposerKeymap(editor, {
		arbitrate: (key, composing) => keyboard.arbitrate(key, composing),
		space: () => {
			if (gate.current.machineBusy || gate.current.locked) return false;
			return keyboard.space();
		},
		dismissPopup: () => {
			keyboard.dismissPopup();
		},
		canSubmit: () => !gate.current.locked && !gate.current.machineBusy,
		submit: (accelerated) => {
			const g = gate.current;
			if (accelerated && g.canSteerQueue) {
				keyboard.steerQueue();
				return;
			}
			if (g.uploadsPending) {
				g.showToast(g.uploadsHeldText);
				return;
			}
			keyboard.submit(resolveSubmitMode(g.busyEnter, g.running, accelerated ? "accelerated" : "enter", g.steeringAvailable), "enter");
		},
		intakeFiles: (files, directories) => {
			gate.current.intakeFiles(files, directories);
		},
		pasteText: (text) => {
			if (gate.current.machineBusy || gate.current.locked) return;
			keyboard.paste(text);
		}
	});
}
/**
* Keep a toolbar press from moving focus away from the draft.
* @param event - the toolbar button's mouse event.
* @param editor - the borrowed editor, absent in the inert view.
*/
function keepDraftFocus(event, editor) {
	event.preventDefault();
	editor?.getRootElement()?.focus({ preventScroll: true });
}
