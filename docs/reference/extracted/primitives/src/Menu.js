// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/Menu.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render one `role="menuitem"` row for a {@link Menu} whose rows are
* components rather than `items` data: the same markup and styling as a data
* row, so it joins the list's keyboard walk and post-selection focus return
* without any shared state. Closing the menu stays the owner's decision, as
* it is for data rows.
* @param props.children - visible row label.
* @param props.shortcut - effective key labels and accessible combination.
* @param props.icon - optional leading icon.
* @param props.current - whether the row identifies the currently displayed page or view.
* @param props.disabled - whether the row cannot be activated.
* @param props.disabledReason - why a disabled row cannot be activated, shown in a tooltip and read as its description.
* @param props.danger - whether to use the destructive row colors.
* @param props.separatorBefore - whether this row starts a new group (hairline above it).
* @param props.onSelect - row activation callback.
* @returns one menu-item row.
*/
function MenuItemButton({ children, shortcut, icon, current, disabled = false, disabledReason, danger = false, separatorBefore = false, onSelect }) {
	const reasonId = useId();
	const explained = disabled && disabledReason !== void 0;
	return jsxs("div", {
		className: css$10.itemWrap,
		children: [
			separatorBefore && jsx("div", {
				className: css$10.separator,
				role: "separator"
			}),
			jsx(Tooltip, {
				label: disabledReason ?? "",
				disabled: !explained,
				side: "bottom",
				delayMs: 500,
				maxWidth: 300,
				portal: true,
				children: jsxs("button", {
					type: "button",
					role: "menuitem",
					className: clsx(css$10.item, danger && css$10.danger),
					disabled: disabled && !explained,
					"aria-disabled": explained || void 0,
					"aria-describedby": explained ? reasonId : void 0,
					"aria-keyshortcuts": shortcut?.aria,
					"aria-current": current === true ? "page" : void 0,
					onClick: explained ? void 0 : onSelect,
					children: [
						icon !== void 0 && jsx("span", {
							className: css$10.itemIcon,
							children: icon
						}),
						jsx("span", {
							className: css$10.itemLabel,
							children
						}),
						shortcut !== void 0 && jsx("span", {
							"aria-hidden": "true",
							className: css$10.shortcut,
							children: jsx(ShortcutKeys, {
								keys: shortcut.keys,
								className: css$10.shortcutKeys
							})
						})
					]
				})
			}),
			explained && jsx("span", {
				id: reasonId,
				hidden: true,
				children: disabledReason
			})
		]
	});
}
function isSeparator(entry) {
	return "type" in entry && entry.type === "separator";
}
function isLabel(entry) {
	return "type" in entry && entry.type === "label";
}
/** Mark icon columns within each separator-delimited data group. */
function iconColumns(entries, contextual) {
	const aligned = /* @__PURE__ */ new Set();
	if (!contextual) return aligned;
	let group = [];
	const finish = () => {
		if (group.some((entry) => !isLabel(entry) && !isSeparator(entry) && entry.icon !== void 0)) for (const entry of group) aligned.add(entry);
		group = [];
	};
	for (const entry of entries) if (isSeparator(entry)) finish();
	else group.push(entry);
	finish();
	return aligned;
}
/** Unplaced portal list: hidden but laid out at a fixed origin so offsetWidth/offsetHeight are real. */
const MEASURE_STYLE = {
	visibility: "hidden",
	left: 0,
	top: 0
};
/**
* Render an anchored dropdown menu. While the list is open its keys mirror the
* composer's: Tab settles the focused row — from the trigger, Tab enters the
* list instead — and Escape or Shift+Tab close it and return focus to the
* anchor's first button, and selecting a row does the same — the rows unmount
* with the list. Only a keyboard on the trigger or inside the list is
* intercepted; Tab presses elsewhere on the page stay the browser's.
* @param props.contextual - cursor positioning, context dismissal, and per-divider icon alignment.
* @param props.exiting - retain an inert popup during dismissal or replacement fade.
* @param props.returnFocus - original control captured before asynchronous menu preparation.
* @param props.autoFocus - focus the first item on open; the arrow keys walk the list either way.
* @param props.open - whether the list is showing (owner-controlled).
* @param props.anchor - the trigger element (rendered in place).
* @param props.items - selectable data rows and optional separators (default none; with no `children` either, the list is empty).
* @param props.selectedId - row shown as selected.
* @param props.selectedIds - rows shown as selected when a menu contains independent option groups.
* @param props.onSelect - data-row activation callback (not called for disabled rows or submenu parents that only open children).
* @param props.onClose - invoked on outside click, Escape, or a window blur
* that moved focus into an iframe (the only signal a pointerdown inside a
* cross-origin iframe leaves).
* @param props.align - list alignment against the anchor (default 'start').
* @param props.side - open below (`bottom`, default) or above (`top`) the anchor.
* @param props.portal - render the list into document.body, fixed-positioned
* synchronously (follows movement, resizing, and browser zoom while open)
* and clamped inside the visual viewport. Use when an ancestor's overflow clipping would crop the
* in-place list; default false keeps the pure-CSS in-place behavior.
* @param props.closeOnPointerLeave - close the list once the pointer has left
* both trigger and list for the pointer grace (default false keeps it open
* until outside click/Escape/selection). The grace makes the 4px trigger->list
* gap and a brief overshoot survivable; coming back cancels the close.
* @param props.dense - reduce vertical row spacing without changing the standard typography or card width.
* @param props.compact - use reduced menu typography and spacing.
* @param props.getAnchorRect - portal mode only: supply the anchor rect
* directly (e.g. from a host-owned trigger button) instead of measuring the
* Menu's own wrapper span. Required when the wrapper isn't itself laid out at
* the trigger (render-prop anchors, effect-positioned proxies — measuring the
* wrapper there races the host's layout effects). Called while tracking the
* anchor and on scroll/resize; return null to defer placement.
* @param props.minWidthFromAnchor - in portal mode, keep the menu at least as wide as its anchor, bounded by viewport margins.
* @param props.footer - rows pinned below the scrolling items area, separated
* by a hairline; contextual menus reuse an explicit leading separator. These rows stay visible while the items above scroll.
* @param props.children - component rows rendered after `items` in the same
* list, each a `role="menuitem"` button such as {@link MenuItemButton}; they
* share the keyboard walk, the submenu exclusivity, and the post-selection
* focus return.
* @param props.selection - how a selected row is marked: a trailing check
* (`'check'`, default — figma .Menu_cell) or the hover fill held on the row
* with no check (`'fill'`, for icon-labelled rows where a trailing glyph
* crowds the cell).
* @param props.className - extra class on the anchor wrapper span.
* @param props.listClassName - extra class on the dropdown card itself; the
* only style hook that reaches a portaled list, which renders under
* document.body outside the owner's DOM subtree.
* @returns anchor wrapper with the conditional list.
*/
function Menu({ open, anchor, items = [], children, selectedId, selectedIds, onSelect, onClose, align = "start", side = "bottom", portal = false, closeOnPointerLeave = false, dense = false, compact = false, autoFocus = false, selection = "check", getAnchorRect, minWidthFromAnchor = false, footer, className, listClassName, contextual = false, exiting, returnFocus }) {
	const rootRef = useRef(null);
	const listRef = useRef(null);
	const menuId = useId();
	useLayoutEffect(() => {
		const trigger = returnFocus?.();
		if (!open || !contextual || trigger == null) return;
		const previous = trigger.getAttribute("aria-controls");
		trigger.setAttribute("aria-controls", [previous, menuId].filter(Boolean).join(" "));
		return () => {
			if (previous === null) trigger.removeAttribute("aria-controls");
			else trigger.setAttribute("aria-controls", previous);
		};
	}, [
		open,
		contextual,
		returnFocus,
		menuId
	]);
	/** Index the arrow walk last focused, the resume point when focus left the rows. */
	const walkIndex = useRef(null);
	/**
	* The control that had the keyboard when this menu opened — its own trigger,
	* which an anchor that wraps several controls (a split button) would not be
	* able to name by position.
	*/
	const triggerRef = useRef(null);
	const selectingWithTab = useRef(false);
	/**
	* Hand the keyboard back to the trigger that opened the menu — or, when the
	* anchor never held it, to the anchor's first button. Focus left on a removed
	* row otherwise falls to the page body, where the next Tab restarts from the
	* top of the page.
	* @param navigation - whether explicit keyboard traversal should retain its focus indicator.
	*/
	const refocusAnchor = (navigation = false) => {
		const trigger = returnFocus?.() ?? triggerRef.current;
		const target = trigger !== null && document.contains(trigger) && !trigger.disabled ? trigger : rootRef.current?.querySelector("button:not(:disabled)");
		if (target == null) return;
		if (navigation) target.focus();
		else focusWithoutRing(target);
	};
	/**
	* Post-selection focus, for the paths where the rows unmount with the list.
	* A selection whose owner keeps the menu open is left alone, and so is an
	* owner that moved focus itself (a presented file card hands it to its
	* preview button): only a keyboard left on the closing list (or on the body
	* its removal produced) comes back to the trigger.
	*/
	const refocusAfterSelection = () => {
		const navigation = selectingWithTab.current;
		queueMicrotask(() => {
			if (openRef.current && exitingRef.current === void 0) return;
			const active = document.activeElement;
			if (active === null || active === document.body || listRef.current?.contains(active) === true) refocusAnchor(navigation);
		});
	};
	const exitingRef = useRef(exiting);
	exitingRef.current = exiting;
	const openRef = useRef(open);
	openRef.current = open;
	const [openSubmenuId, setOpenSubmenuId] = useState(null);
	const close = useRef(onClose);
	close.current = onClose;
	const lastAnchorRect = useRef(null);
	const readAnchor = useCallback(() => {
		if ((returnFocus?.() ?? rootRef.current)?.closest("[inert], [hidden]") != null) {
			if (exitingRef.current === void 0) close.current();
			return lastAnchorRect.current;
		}
		lastAnchorRect.current = getAnchorRect === void 0 ? rootRef.current?.getBoundingClientRect() ?? null : getAnchorRect();
		return lastAnchorRect.current;
	}, [getAnchorRect, returnFocus]);
	const fixedPos = useAnchoredPosition({
		open: open && portal,
		anchorRef: rootRef,
		panelRef: listRef,
		side,
		align,
		gap: 4,
		margin: 12,
		frameClearance: !contextual,
		minWidthFromAnchor,
		getAnchorRect: readAnchor
	});
	const positioned = !portal || fixedPos !== null;
	const { arm: armClose, cancel: cancelClose } = usePointerGrace(onClose);
	useEffect(() => {
		if (!open) return;
		const active = document.activeElement;
		triggerRef.current = active instanceof HTMLElement && (getAnchorRect !== void 0 || rootRef.current?.contains(active) === true) ? active : null;
	}, [open]);
	useEffect(() => {
		if (!open || exiting !== void 0 || !autoFocus || !positioned || listRef.current?.contains(document.activeElement)) return;
		const first = listRef.current?.querySelector("button:not(:disabled)");
		walkIndex.current = first === void 0 || first === null ? null : 0;
		if (first != null) focusWithoutRing(first);
	}, [
		open,
		autoFocus,
		items.length,
		footer?.length,
		positioned,
		exiting
	]);
	useEffect(() => {
		if (!open || exiting !== void 0) {
			setOpenSubmenuId(null);
			walkIndex.current = null;
			return;
		}
		const composition = observeComposition(document);
		const onPointerDown = (e) => {
			if (!(e.target instanceof Node) || contextual && e.button === 2) return;
			if (rootRef.current?.contains(e.target) === true) return;
			if (listRef.current?.contains(e.target) === true) return;
			onClose();
		};
		const onKeyDown = (e) => {
			if (composition.guards(e) || isBehindModal(triggerRef.current ?? rootRef.current) || e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey) return;
			const focused = document.activeElement;
			const insideList = listRef.current?.contains(focused) === true;
			const anchored = focused === returnFocus?.() || rootRef.current?.contains(focused) === true || insideList;
			if (e.key === "Escape" && !e.shiftKey) {
				e.preventDefault();
				if (e.repeat) return;
				onClose();
				if (anchored || autoFocus) refocusAnchor();
			}
			if (e.key === "Tab") {
				const list = listRef.current;
				if (list === null || !anchored) return;
				if (e.shiftKey) {
					e.preventDefault();
					onClose();
					refocusAnchor(true);
					return;
				}
				if (insideList) {
					if (focused instanceof Element && focused.getAttribute("role") === "menuitem") {
						e.preventDefault();
						if (focused.getAttribute("aria-disabled") === "true") {
							onClose();
							refocusAnchor(true);
							return;
						}
						selectingWithTab.current = true;
						try {
							focused.click();
						} finally {
							selectingWithTab.current = false;
						}
					}
					return;
				}
				const row = list.querySelector("button:not(:disabled)");
				if (row === null) return;
				e.preventDefault();
				row.focus();
				walkIndex.current = 0;
				return;
			}
			if (![
				"ArrowDown",
				"ArrowUp",
				"Home",
				"End"
			].includes(e.key)) return;
			const list = listRef.current;
			if (list === null || !anchored) return;
			const buttons = Array.from(list.querySelectorAll("button:not(:disabled)"));
			if (buttons.length === 0) return;
			const index = buttons.indexOf(focused);
			const from = index >= 0 ? index : walkIndex.current;
			const next = e.key === "Home" ? 0 : e.key === "End" ? buttons.length - 1 : from === null ? e.key === "ArrowDown" ? 0 : buttons.length - 1 : (from + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
			e.preventDefault();
			walkIndex.current = next;
			buttons[next]?.focus();
		};
		const onWindowBlur = () => {
			if (document.activeElement instanceof HTMLIFrameElement) onClose();
		};
		document.addEventListener("pointerdown", onPointerDown);
		const onEscape = (event) => {
			if (event.key === "Escape") onKeyDown(event);
		};
		const onOtherKey = (event) => {
			if (event.key !== "Escape") onKeyDown(event);
		};
		document.addEventListener("keydown", onOtherKey);
		document.addEventListener("keydown", onEscape, true);
		window.addEventListener("blur", onWindowBlur);
		return () => {
			composition.dispose();
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onOtherKey);
			document.removeEventListener("keydown", onEscape, true);
			window.removeEventListener("blur", onWindowBlur);
		};
	}, [
		open,
		onClose,
		autoFocus,
		contextual,
		exiting
	]);
	useLayoutEffect(() => {
		if (exiting === "dismiss" && listRef.current?.contains(document.activeElement)) refocusAnchor();
	}, [exiting]);
	useEffect(() => {
		if (!open) cancelClose();
	}, [open, cancelClose]);
	const scrollable = !items.some((entry) => !isSeparator(entry) && !isLabel(entry) && entry.submenu !== void 0 && entry.submenu.length > 0);
	const itemColumns = iconColumns(items, contextual);
	const footerColumns = iconColumns(footer ?? [], contextual);
	const renderEntry = (entry, columns) => {
		if (isSeparator(entry)) return jsx("div", {
			className: css$10.separator,
			role: "separator"
		}, entry.id);
		if (isLabel(entry)) return jsx("div", {
			className: css$10.label,
			role: "presentation",
			children: entry.text
		}, entry.id);
		const hasSub = entry.submenu !== void 0 && entry.submenu.length > 0;
		const subOpen = hasSub && openSubmenuId === entry.id;
		const subColumns = iconColumns(entry.submenu ?? [], contextual);
		const selected = entry.id === selectedId || selectedIds?.includes(entry.id) === true;
		return jsxs("div", {
			className: css$10.itemWrap,
			onMouseEnter: hasSub ? () => {
				setOpenSubmenuId(entry.id);
			} : void 0,
			onMouseLeave: () => {
				setOpenSubmenuId(null);
			},
			children: [jsxs("button", {
				type: "button",
				role: "menuitem",
				className: clsx(css$10.item, selected && (selection === "fill" ? css$10.selectedFill : css$10.selected), entry.danger === true && css$10.danger),
				disabled: entry.disabled,
				"aria-keyshortcuts": entry.shortcut?.aria,
				"aria-haspopup": hasSub ? "menu" : void 0,
				"aria-expanded": hasSub ? subOpen : void 0,
				onFocus: hasSub ? () => {
					setOpenSubmenuId(entry.id);
				} : void 0,
				onClick: () => {
					if (hasSub) {
						setOpenSubmenuId(entry.id);
						return;
					}
					onSelect?.(entry.id);
				},
				children: [
					(entry.icon !== void 0 || columns.has(entry)) && jsx("span", {
						"aria-hidden": "true",
						className: css$10.itemIcon,
						children: entry.icon
					}),
					jsx("span", {
						className: css$10.itemLabel,
						children: entry.label
					}),
					entry.shortcut !== void 0 && jsx("span", {
						"aria-hidden": "true",
						className: css$10.shortcut,
						children: jsx(ShortcutKeys, {
							keys: entry.shortcut.keys,
							className: css$10.shortcutKeys
						})
					}),
					selected && selection === "check" && jsx(IconCheckOutlineRegular, { className: css$10.check })
				]
			}), subOpen && entry.submenu !== void 0 && jsx(MenuSurface, {
				compact,
				className: clsx(css$10.submenu, compact && css$10.compactList),
				role: "menu",
				children: entry.submenu.map((sub) => isSeparator(sub) ? jsx("div", {
					className: css$10.separator,
					role: "separator"
				}, sub.id) : isLabel(sub) ? jsx("div", {
					className: css$10.label,
					children: sub.text
				}, sub.id) : jsxs("button", {
					type: "button",
					role: "menuitem",
					className: css$10.item,
					disabled: sub.disabled,
					"aria-keyshortcuts": sub.shortcut?.aria,
					onClick: () => {
						onSelect?.(sub.id);
						refocusAfterSelection();
					},
					children: [
						(sub.icon !== void 0 || subColumns.has(sub)) && jsx("span", {
							"aria-hidden": "true",
							className: css$10.itemIcon,
							children: sub.icon
						}),
						jsx("span", {
							className: css$10.itemLabel,
							children: sub.label
						}),
						sub.shortcut !== void 0 && jsx("span", {
							"aria-hidden": "true",
							className: css$10.shortcut,
							children: jsx(ShortcutKeys, {
								keys: sub.shortcut.keys,
								className: css$10.shortcutKeys
							})
						})
					]
				}, sub.id))
			})]
		}, entry.id);
	};
	const collapseSubmenuFrom = (e) => {
		const row = e.target instanceof Element ? e.target.closest("button[role=\"menuitem\"]") : null;
		if (row === null || row.getAttribute("aria-haspopup") === "menu") return;
		if (row.closest("[role=\"menu\"]") !== e.currentTarget) return;
		setOpenSubmenuId(null);
	};
	const list = open && jsxs(MenuSurface, {
		compact,
		id: contextual ? menuId : void 0,
		ref: listRef,
		className: clsx(css$10.list, listClassName, dense && css$10.denseList, compact && css$10.compactList, scrollable && css$10.scrollable, portal && css$10.portal, side === "top" && !portal && css$10.sideTop, align === "end" && !portal && css$10.alignEnd),
		style: portal ? fixedPos ?? MEASURE_STYLE : void 0,
		role: exiting === void 0 ? "menu" : void 0,
		"aria-hidden": exiting === void 0 ? void 0 : true,
		"data-context-menu": contextual ? "" : void 0,
		phase: contextual ? exiting ?? "enter" : void 0,
		onClick: (e) => {
			e.stopPropagation();
			const row = e.target instanceof Element ? e.target.closest("button[role=\"menuitem\"]") : null;
			if (row !== null && row.getAttribute("aria-haspopup") !== "menu") refocusAfterSelection();
		},
		onContextMenu: contextual ? (event) => {
			event.preventDefault();
			event.stopPropagation();
			onClose();
		} : void 0,
		onMouseOver: collapseSubmenuFrom,
		onFocus: collapseSubmenuFrom,
		children: [jsxs("div", {
			className: css$10.viewport,
			role: "presentation",
			children: [items.map((entry) => renderEntry(entry, itemColumns)), children]
		}), footer !== void 0 && footer.length > 0 && jsx("div", {
			className: css$10.footer,
			role: "presentation",
			children: footer.map((entry) => renderEntry(entry, footerColumns))
		})]
	});
	return jsxs("span", {
		ref: rootRef,
		className: clsx(css$10.root, className),
		onPointerEnter: closeOnPointerLeave ? cancelClose : void 0,
		onPointerLeave: closeOnPointerLeave ? () => {
			if (open) armClose();
		} : void 0,
		children: [anchor, portal ? list !== false && createPortal(list, document.body) : list]
	});
}
