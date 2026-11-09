// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/focus.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Mobile-device detection and automatic focus presentation. */
const releases = /* @__PURE__ */ new WeakMap();
const navigationKeys = new Set([
	"Tab",
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"Home",
	"End"
]);
let mobileDevice;
/**
* Identify iOS and Android phones and tablets from the current browser's device information.
* MacIntel with multiple touch points identifies desktop-mode iPads.
* The first result is shared by all callers until the page reloads.
* @returns true for recognized mobile devices; false for other devices, including unrecognized UAs.
*/
function isMobileDevice() {
	if (mobileDevice !== void 0) return mobileDevice;
	const { userAgent, platform, maxTouchPoints } = navigator;
	mobileDevice = /Android|iPhone|iPad|iPod/i.test(userAgent) || platform === "MacIntel" && maxTouchPoints > 1;
	return mobileDevice;
}
/**
* Focus an automatic destination without a focus outline until keyboard navigation or blur.
* The theme suppresses outlines while data-dsh-automatic-focus is present; borders and shadows remain intact.
* Tab and directional navigation restore normal focus styling.
* @param element - control or container receiving automatic focus.
* @param options - browser focus options, including scroll preservation.
*/
function focusWithoutRing(element, options) {
	releases.get(element)?.();
	const release = () => {
		element.removeAttribute("data-dsh-automatic-focus");
		element.removeEventListener("blur", release);
		element.removeEventListener("keydown", navigate, true);
		releases.delete(element);
	};
	const navigate = (event) => {
		if (!event.isComposing && !event.ctrlKey && !event.altKey && !event.metaKey && navigationKeys.has(event.key)) release();
	};
	releases.set(element, release);
	element.setAttribute("data-dsh-automatic-focus", "");
	element.addEventListener("blur", release);
	element.addEventListener("keydown", navigate, true);
	element.focus(options);
	if (!element.matches(":focus")) release();
}
