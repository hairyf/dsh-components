// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/MenuSurface.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Shared menu material and the macOS backing that lets Chromium blur transparent windows. */
/** Context-menu transition durations in milliseconds, shared with its lifecycle owner. */
const MENU_TRANSITION_MS = Object.freeze({
	enter: 40,
	dismiss: 80,
	replace: 10,
	prepare: 20
});
/**
* Paint a menu and, on macOS, an opaque backing behind the page content within its bounds.
* CSS anchors keep each backing aligned during placement, resizing, and nested-menu movement.
* @param props - Div content and placement, and compact geometry.
* @param ref - The visible menu div, excluding the non-interactive backing.
* @returns Menu content plus a backing portal removed with the menu.
*/
const MenuSurface = forwardRef(function MenuSurface({ compact = false, phase, className, style, children, ...props }, ref) {
	const id = useId();
	const backingRef = useRef(null);
	useLayoutEffect(() => {
		document.body.appendChild(backingRef.current);
	}, []);
	const anchorStyle = {
		"--dsh-menu-anchor": `--dsh-menu-${id.replaceAll(":", "")}`,
		"--dsh-menu-enter": `${MENU_TRANSITION_MS.enter}ms`,
		"--dsh-menu-dismiss": `${MENU_TRANSITION_MS.dismiss}ms`,
		"--dsh-menu-replace": `${MENU_TRANSITION_MS.replace}ms`
	};
	return jsxs(Fragment, { children: [jsxs("div", {
		...props,
		ref,
		"data-menu-material": "translucent",
		"data-menu-phase": phase,
		className: clsx(css$8.surface, compact && css$8.compact, className),
		style: {
			...style,
			...anchorStyle
		},
		children: [jsx("div", {
			"aria-hidden": "true",
			className: css$8.material
		}), children]
	}), createPortal(jsx("div", {
		ref: backingRef,
		"aria-hidden": "true",
		"data-menu-backing": "",
		"data-menu-phase": phase,
		className: clsx(css$8.backing, compact && css$8.compact),
		style: {
			...anchorStyle,
			visibility: style?.visibility
		}
	}), document.body)] });
});
