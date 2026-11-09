// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/FoldToggle.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render the shared head-tail fold control with caller-owned localized copy.
* @param props - Fold state, localized labels, and toggle callback.
* @returns The accessible expand or collapse button.
*/
function FoldToggle({ className, expanded, hidden, labels, onToggle }) {
	return jsx("button", {
		type: "button",
		className,
		"aria-expanded": expanded,
		"aria-label": expanded ? labels.collapseAria : labels.expandAria(hidden),
		onClick: onToggle,
		children: expanded ? labels.collapse : labels.expand(hidden)
	});
}
