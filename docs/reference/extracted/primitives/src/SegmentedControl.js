// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/SegmentedControl.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

function isWalkKey(key) {
	return key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown" || key === "Home" || key === "End";
}
/**
* The enabled option a walk key lands on from the selected one: arrows step
* to the nearest enabled neighbour and wrap, Home and End jump to the first
* and last enabled option.
*/
function walk(options, from, key) {
	const enabled = options.filter((option) => option.disabled !== true);
	if (key === "Home") return enabled[0];
	if (key === "End") return enabled[enabled.length - 1];
	const step = key === "ArrowRight" || key === "ArrowDown" ? 1 : -1;
	const count = options.length;
	for (let offset = 1; offset < count; offset += 1) {
		const candidate = options[((from + step * offset) % count + count) % count];
		if (candidate !== void 0 && candidate.disabled !== true) return candidate;
	}
}
/**
* Render a segmented control.
* @param props.id - the owner's base id: each tab is `<id>-<value>` and names
* `<id>-<value>-panel` as the panel it controls.
* @param props.value - the selected option's value; the control is fully controlled.
* @param props.options - the segments in display order; at least two.
* @param props.onChange - called with the value a click or a walk key asks for,
* never with the value already selected.
* @param props.label - localized accessible name of the tablist.
* @param props.disabled - lock every segment, typically while the shown panel
* has a write or a fetch in flight that switching would orphan.
* @param props.className - extra class for layout placement.
* @returns the tablist element.
*/
function SegmentedControl({ id, value, options, onChange, label, disabled = false, className }) {
	const list = useRef(null);
	const selected = options.findIndex((option) => option.value === value);
	useEffect(() => {
		const root = list.current;
		/* v8 ignore next -- the ref is attached to the always-rendered root before any effect runs. */
		if (root === null) return;
		if (!root.contains(document.activeElement)) return;
		root.querySelector("[role=\"tab\"][aria-selected=\"true\"]")?.focus();
	}, [value]);
	const onKeyDown = (event) => {
		if (!isWalkKey(event.key)) return;
		event.preventDefault();
		const target = walk(options, selected, event.key);
		if (target !== void 0 && target.value !== value) onChange(target.value);
	};
	const indicator = {
		"--dsh-segment-count": String(options.length),
		"--dsh-segment-index": String(selected)
	};
	return jsxs("div", {
		ref: list,
		role: "tablist",
		"aria-label": label,
		className: clsx(css$17.control, className),
		style: indicator,
		children: [jsx("span", {
			"aria-hidden": "true",
			className: css$17.indicator
		}), options.map((option) => {
			const active = option.value === value;
			return jsx("button", {
				id: `${id}-${option.value}`,
				type: "button",
				role: "tab",
				"aria-selected": active,
				"aria-controls": `${id}-${option.value}-panel`,
				tabIndex: active ? 0 : -1,
				disabled: disabled || option.disabled === true,
				title: option.title,
				className: css$17.tab,
				onClick: () => {
					if (!active) onChange(option.value);
				},
				onKeyDown,
				children: option.label
			}, option.value);
		})]
	});
}
