// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/input-modality.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Document-wide input tracking shared by tooltips and focus-ring styles.
* Tooltips follow the last input; rings follow navigation or a key followed by
* focus on a different control. Modifiers and refocusing alone keep rings silent.
* Module-level listeners live for the document lifetime; Node imports are inert.
*/
/** Modality values published on the document element. */
const INPUT_MODALITY = {
	pointer: "pointer",
	keyboard: "keyboard"
};
/** Attribute carrying whether focus navigation last owned focus. */
const INPUT_MODALITY_ATTRIBUTE = "data-input-modality";
const FOCUS_NAVIGATION = new Set([
	"Tab",
	"Home",
	"End",
	"PageUp",
	"PageDown"
]);
let pointer = false;
let pointerOwnsFocus = false;
let keyFocusOrigin;
function publish() {
	document.documentElement.setAttribute(INPUT_MODALITY_ATTRIBUTE, pointerOwnsFocus ? INPUT_MODALITY.pointer : INPUT_MODALITY.keyboard);
}
/**
* Whether the last input came from a pointer, independently of ring visibility.
* @returns True after pointer input; false after any key.
*/
function pointerModality() {
	return pointer;
}
if (typeof window !== "undefined") {
	window.addEventListener("pointerdown", () => {
		pointer = true;
		pointerOwnsFocus = true;
		keyFocusOrigin = void 0;
		publish();
	}, true);
	window.addEventListener("keydown", (event) => {
		pointer = false;
		if (event.isComposing) {
			keyFocusOrigin = void 0;
			return;
		}
		keyFocusOrigin = event.composedPath()[0];
		if (!FOCUS_NAVIGATION.has(event.key) && !event.key.startsWith("Arrow")) return;
		pointerOwnsFocus = false;
		publish();
	}, true);
	window.addEventListener("focusin", (event) => {
		if (keyFocusOrigin === void 0 || event.composedPath()[0] === keyFocusOrigin) return;
		keyFocusOrigin = void 0;
		if (!pointerOwnsFocus) return;
		pointerOwnsFocus = false;
		publish();
	}, true);
	window.addEventListener("blur", () => {
		keyFocusOrigin = void 0;
	});
}
