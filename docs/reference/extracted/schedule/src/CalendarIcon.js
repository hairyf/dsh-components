// Extracted from @deepseek-ai/dsh-client-ui-schedule (lib/client.js); region lib/types/client/CalendarIcon.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Draw the 14px calendar outline the Date row's trigger carries.
*
* The shared product icon set has no calendar glyph, so this package draws the
* one its own picker needs, at that set's regular 1px stroke.
* @param props - extra class for layout placement.
* @returns the decorative glyph.
*/
function IconCalendarOutlineRegular({ className }) {
	return (0, react_jsx_runtime.jsxs)("svg", {
		width: "14",
		height: "14",
		className,
		viewBox: "0 0 14 14",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		"aria-hidden": "true",
		strokeWidth: "1",
		children: [
			(0, react_jsx_runtime.jsx)("rect", {
				x: "1.4",
				y: "2.6",
				width: "11.2",
				height: "10",
				rx: "1.6",
				stroke: "currentColor"
			}),
			(0, react_jsx_runtime.jsx)("path", {
				d: "M1.4 5.6H12.6",
				stroke: "currentColor"
			}),
			(0, react_jsx_runtime.jsx)("path", {
				d: "M4.4 1.4V3.6M9.6 1.4V3.6",
				stroke: "currentColor"
			})
		]
	});
}
