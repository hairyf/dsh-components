// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/SegmentedTabs.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render equal-width, controlled tabs with a sliding selection indicator.
* @param props.items - non-empty ordered tabs with unique values and DOM ids.
* @param props.value - selected value, which must belong to items.
* @param props.onChange - selection requested by click, Left/Right, or Home/End.
* Keyboard selection also moves focus; only the selected tab is a tab stop.
* @param props.label - localized accessible name for the tab list.
* @param props.className - layout placement; panels remain caller-owned.
* @param props.size - `sm` draws 30px tabs with a 2px inset (34px tall); the default `md` draws 34px tabs with a 4px inset (42px tall).
* @returns the tab list, without its panels.
*/
function SegmentedTabs({ items, value, onChange, label, className, size = "md" }) {
	const selectedIndex = items.findIndex((item) => item.value === value);
	const onKeyDown = (event, index) => {
		let next;
		switch (event.key) {
			case "ArrowLeft":
				next = (index + items.length - 1) % items.length;
				break;
			case "ArrowRight":
				next = (index + 1) % items.length;
				break;
			case "Home":
				next = 0;
				break;
			case "End":
				next = items.length - 1;
				break;
			default: return;
		}
		event.preventDefault();
		event.stopPropagation();
		const tablist = event.currentTarget.parentElement;
		const nextItem = items[next];
		/* v8 ignore next -- the event comes from a mounted direct child and next is bounded by non-empty items. */
		if (tablist === null || nextItem === void 0) return;
		tablist.querySelectorAll("[role=\"tab\"]").item(next).focus();
		onChange(nextItem.value);
	};
	return jsxs("div", {
		role: "tablist",
		"data-size": size,
		"aria-label": label,
		className: clsx(css$13.tabs, className),
		style: { gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` },
		children: [jsx("span", {
			className: css$13.indicator,
			"aria-hidden": "true",
			style: {
				width: `calc((100% - 2 * var(--segmented-tabs-inset)) / ${items.length})`,
				transform: `translateX(${selectedIndex * 100}%)`
			}
		}), items.map((item, index) => jsx(Pill, {
			id: item.id,
			role: "tab",
			className: css$13.tab,
			"aria-selected": value === item.value,
			"aria-controls": item.panelId,
			tabIndex: value === item.value ? 0 : -1,
			onClick: () => {
				onChange(item.value);
			},
			onKeyDown: (event) => {
				onKeyDown(event, index);
			},
			children: item.label
		}, item.value))]
	});
}
