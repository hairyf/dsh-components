// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/ZoomControls.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Floating controls shared by every zoomable document renderer. */
function steppedZoom(zoom, direction) {
	const step = direction === -1 ? Math.ceil(zoom / DOCUMENT_ZOOM.step) - 1 : Math.floor(zoom / DOCUMENT_ZOOM.step) + 1;
	return Math.min(DOCUMENT_ZOOM.maximum, Math.max(DOCUMENT_ZOOM.minimum, step * DOCUMENT_ZOOM.step));
}
/**
* Present optional fitting, fixed presets, and incremental controls.
* @param props - committed `zoom`, optional `fit` row (omitted: no fitting row), localized labels, `visible`, optional
*   owner `className`, and zoom and activity callbacks.
* @param ref - `showZoom` displays a transient scale until `zoom` changes.
* @returns a localized zoom toolbar.
*/
const ZoomControls = forwardRef(function ZoomControls({ zoom, fit, className, labels, visible, onZoom, onActiveChange }, ref) {
	const [committed, setCommitted] = useState(zoom);
	const [transient, setTransient] = useState();
	const [open, setOpen] = useState(false);
	const [hovered, setHovered] = useState(false);
	const [focused, setFocused] = useState(false);
	if (committed !== zoom) {
		setCommitted(zoom);
		setTransient(void 0);
	}
	const displayZoom = transient ?? zoom;
	useImperativeHandle(ref, () => ({ showZoom: setTransient }), []);
	useEffect(() => {
		onActiveChange(open || hovered || focused);
	}, [
		focused,
		hovered,
		onActiveChange,
		open
	]);
	const items = [...fit === void 0 ? [] : [{
		id: "fit",
		label: fit.label
	}, {
		type: "separator",
		id: "fit-scale"
	}], ...DOCUMENT_ZOOM.presets.map((value) => ({
		id: String(value),
		label: labels.value(value * 100)
	}))];
	const selectedId = fit?.selected === true ? "fit" : DOCUMENT_ZOOM.presets.some((value) => value === displayZoom) ? String(displayZoom) : void 0;
	return jsxs("div", {
		className: clsx(css$11.panel, visible && css$11.visible, className),
		role: "toolbar",
		"aria-label": labels.controls,
		"data-document-zoom-controls": true,
		"data-document-zoom-visible": visible || void 0,
		onPointerEnter: (event) => {
			if (event.pointerType !== "touch") setHovered(true);
		},
		onPointerLeave: () => {
			setHovered(false);
		},
		onFocusCapture: () => {
			setFocused(true);
		},
		onBlurCapture: (event) => {
			if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
		},
		children: [
			jsx(Tooltip, {
				label: labels.out,
				side: "top",
				children: jsx("span", {
					className: css$11.controlAnchor,
					children: jsx(Button, {
						size: "sm",
						className: css$11.zoomButton,
						"aria-label": labels.out,
						disabled: displayZoom <= DOCUMENT_ZOOM.minimum,
						onMouseDown: (event) => {
							event.preventDefault();
						},
						onClick: () => {
							onZoom(steppedZoom(displayZoom, -1));
						},
						children: jsx("svg", {
							width: "14",
							height: "14",
							viewBox: "0 0 16 16",
							"aria-hidden": "true",
							children: jsx("path", {
								d: "M2 8h12",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "1.5"
							})
						})
					})
				})
			}),
			jsx(Menu, {
				open,
				side: "top",
				align: "start",
				portal: true,
				compact: true,
				listClassName: css$11.zoomMenu,
				anchor: jsxs(Button, {
					size: "sm",
					className: css$11.percent,
					"aria-label": labels.menu,
					"aria-expanded": open,
					onMouseDown: (event) => {
						event.preventDefault();
					},
					onClick: () => {
						setOpen((value) => !value);
					},
					children: [jsx("span", { children: labels.value(Math.round(displayZoom * 100)) }), jsx(IconChevronDownOutlineRegular, { size: 12 })]
				}),
				items,
				selectedId,
				onClose: () => {
					setOpen(false);
				},
				onSelect: (selected) => {
					setOpen(false);
					if (selected === "fit") fit?.onSelect();
					else onZoom(Number(selected));
				}
			}),
			jsx(Tooltip, {
				label: labels.into,
				side: "top",
				children: jsx("span", {
					className: css$11.controlAnchor,
					children: jsx(Button, {
						size: "sm",
						className: css$11.zoomButton,
						"aria-label": labels.into,
						disabled: displayZoom >= DOCUMENT_ZOOM.maximum,
						onMouseDown: (event) => {
							event.preventDefault();
						},
						onClick: () => {
							onZoom(steppedZoom(displayZoom, 1));
						},
						children: jsx(IconPlusOutlineRegular, { size: 14 })
					})
				})
			})
		]
	});
});
