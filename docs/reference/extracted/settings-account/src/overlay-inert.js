// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/overlay-inert.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Shared inert ownership for overlapping account overlays. */
const owners = /* @__PURE__ */ new WeakMap();
/**
* Disable background interaction until every account overlay releases the element.
* @param element - background element covered by an overlay.
* @returns an idempotent release restoring the original inert state after the last owner.
*/
function acquireOverlayInert(element) {
	const state = owners.get(element) ?? {
		count: 0,
		previous: element.inert
	};
	state.count++;
	owners.set(element, state);
	element.inert = true;
	let released = false;
	return () => {
		if (released) return;
		released = true;
		if (--state.count === 0) {
			element.inert = state.previous;
			owners.delete(element);
		}
	};
}
