// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/StateDot.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Pin the loader's CSS animations to document time zero. A CSS animation starts
* when its element is inserted and restarts when the element is moved or shown
* again, so loaders started at different moments rotate out of phase; one shared
* start time keeps every visible loader in step. Mount pins the first start; the
* element's own `animationstart` listener pins each restart.
* @param element - the mounted loader, or null on unmount.
*/
function syncSpinner(element) {
	if (element === null) return;
	pinSpinner(element);
	element.addEventListener("animationstart", () => {
		pinSpinner(element);
	});
}
/**
* Set every CSS animation in the loader's subtree to start at document time zero.
* @param element - the mounted loader.
*/
function pinSpinner(element) {
	const spinner = element;
	for (const animation of spinner.getAnimations?.({ subtree: true }) ?? []) animation.startTime = 0;
}
/**
* Render a state dot.
* @param props.state - which of `done`, `warning`, `ongoing`, `error`, or `idle` to show.
* @param props.size - outer diameter in px; defaults to 14 for ongoing and 10 for solid states.
* @param props.className - extra class for layout placement.
* @param props.appearance - compact dot by default; step uses a filled check or hollow pending circle.
* @returns the dot element (aria-hidden; pair with text for accessibility).
*/
function StateDot({ state, size, className, appearance = "dot" }) {
	const edge = size ?? (state === "ongoing" ? 14 : 10);
	if (state === "ongoing") return jsx("svg", {
		ref: syncSpinner,
		className: clsx(css$1.spinner, className),
		"data-state": "ongoing",
		width: edge,
		height: edge,
		viewBox: "0 0 24 24",
		"aria-hidden": "true",
		children: jsxs("g", {
			className: css$1.spinnerMotion,
			children: [jsx("circle", {
				className: css$1.spinnerTrack,
				cx: "12",
				cy: "12",
				r: "9.5"
			}), jsx("circle", {
				className: css$1.spinnerArc,
				cx: "12",
				cy: "12",
				r: "9.5"
			})]
		})
	});
	return jsx("span", {
		className: clsx(appearance === "step" ? css$1.step : css$1.dot, className),
		"data-state": state,
		style: {
			width: edge,
			height: edge
		},
		"aria-hidden": "true",
		children: appearance === "step" && state === "done" && jsx(IconCheckOutlineRegular, { size: edge - 2 })
	});
}
