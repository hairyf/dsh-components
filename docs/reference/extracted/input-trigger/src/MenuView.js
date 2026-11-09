// Extracted from @deepseek-ai/dsh-client-ui-input-trigger (lib/client.js); region lib/types/client/MenuView.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Trigger candidate menu: renders the InputTriggerService menu store into the
		* conversation.input.overlay anchor. Closed state renders null (the overlay
		* slot stays mounted); groups render in roster order under localized title
		* rows. A pending group keeps showing the items it already had (the reducer
		* retains them across a query refinement) and falls back to two skeleton
		* rows only while it has none; pointer picks route back through
		* the service (combobox pattern — focus never leaves the textarea, so rows
		* are mousedown-handled and the highlight is exposed via
		* aria-activedescendant on the listbox). A row reads title, then the
		* command-name alias when the title is not the name in another letter case
		* (a localized title), then the description right-aligned. A source publishing crumbs gets a breadcrumb
		* header pinned above the scrolling list.
		*/
		/** Height cap that fits the two headings and eight built-in command rows. */
		const MAX_HEIGHT = 400;
		/**
		* Viewport top margin: the conversation header's 76px block (title row plus
		* view tabs, ui-conversation) plus 8px of air, so a tall list stops below the
		* header instead of sliding under it.
		*/
		const TOP_MARGIN = 84;
		/** DOM id of one option row (the aria-activedescendant target). */
		function optionId(source, index) {
			return `dsh-slash-option-${source}-${index}`;
		}
		/**
		* Render the candidate menu overlay entry.
		* @param props - injected face (the menu store and the pick route); `t` rides the standard locale seat.
		* @returns the dropdown while open; null while closed.
		*/
		function MenuView({ menu, headers, onPick, onCrumb, onHover, onDismiss, t }) {
			const state = (0, react.useSyncExternalStore)((fn) => menu.subscribe(fn), () => menu.getSnapshot());
			const crumbs = (0, react.useSyncExternalStore)((fn) => headers.subscribe(fn), () => headers.getSnapshot());
			const listRef = (0, react.useRef)(null);
			const viewportRef = (0, react.useRef)(null);
			const [hasOverflowBelow, setHasOverflowBelow] = (0, react.useState)(false);
			const maxHeight = (0, _deepseek_ai_dsh_client_ui_primitives.useAnchoredMaxHeight)(listRef, MAX_HEIGHT, state, TOP_MARGIN);
			const updateOverflowHint = (0, react.useCallback)(() => {
				const viewport = viewportRef.current;
				setHasOverflowBelow(viewport !== null && viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 1);
			}, []);
			(0, react.useLayoutEffect)(() => {
				updateOverflowHint();
			}, [
				state,
				maxHeight,
				updateOverflowHint
			]);
			const highlight = state.open ? state.highlight : null;
			(0, react.useEffect)(() => {
				if (highlight === null) return;
				document.getElementById(optionId(highlight.source, highlight.index))?.scrollIntoView({ block: "nearest" });
			}, [highlight]);
			(0, react.useEffect)(() => {
				if (!state.open) return;
				const onPointerDown = (ev) => {
					if (!(ev.target instanceof Node)) return;
					if (listRef.current?.contains(ev.target)) return;
					if ((listRef.current?.closest("[data-composer-card]"))?.contains(ev.target)) return;
					onDismiss();
				};
				document.addEventListener("pointerdown", onPointerDown, true);
				return () => {
					document.removeEventListener("pointerdown", onPointerDown, true);
				};
			}, [state.open, onDismiss]);
			if (!state.open) return null;
			return (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.MenuSurface, {
				ref: listRef,
				className: MenuView_module_css_default.menu,
				style: { maxHeight },
				"data-trigger-menu": "",
				"data-overflow-below": hasOverflowBelow || void 0,
				children: [state.groups.map((group) => {
					const trail = crumbs.get(group.source);
					return trail === void 0 ? null : (0, react_jsx_runtime.jsx)("nav", {
						className: MenuView_module_css_default.crumbs,
						"aria-label": t("crumbs.aria"),
						children: trail.map((crumb, index) => (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [index > 0 && (0, react_jsx_runtime.jsx)("span", {
							className: MenuView_module_css_default.crumbSeparator,
							"aria-hidden": true,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {})
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: clsx(MenuView_module_css_default.crumb, crumb.current === true && MenuView_module_css_default.crumbCurrent),
							"aria-current": crumb.current === true ? "location" : void 0,
							disabled: crumb.current === true,
							onMouseDown: (ev) => {
								ev.preventDefault();
								onCrumb(group.source, index);
							},
							children: crumb.label
						})] }, `${String(index)}-${crumb.value}`))
					}, group.source);
				}), (0, react_jsx_runtime.jsx)("div", {
					ref: viewportRef,
					className: MenuView_module_css_default.viewport,
					role: "listbox",
					"aria-label": t("suggestions.aria"),
					"aria-activedescendant": highlight !== null ? optionId(highlight.source, highlight.index) : void 0,
					onScroll: updateOverflowHint,
					children: state.groups.map((group) => group.status === "ready" && group.items.length === 0 ? null : (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [group.showGroupTitle === false || group.items.some((item) => item.section !== void 0) ? null : (0, react_jsx_runtime.jsx)("div", {
						className: MenuView_module_css_default.groupTitle,
						role: "presentation",
						"data-source": group.source,
						children: t(group.source)
					}), group.status === "pending" && group.items.length === 0 ? (0, react_jsx_runtime.jsxs)("div", {
						role: "status",
						"aria-label": t("loading"),
						"data-source": group.source,
						children: [(0, react_jsx_runtime.jsx)("div", {
							className: MenuView_module_css_default.skeletonRow,
							children: (0, react_jsx_runtime.jsx)("span", {
								className: MenuView_module_css_default.skeletonBar,
								style: { width: "32%" }
							})
						}), (0, react_jsx_runtime.jsx)("div", {
							className: MenuView_module_css_default.skeletonRow,
							children: (0, react_jsx_runtime.jsx)("span", {
								className: MenuView_module_css_default.skeletonBar,
								style: { width: "48%" }
							})
						})]
					}) : group.items.map((item, index) => {
						const active = highlight !== null && highlight.source === group.source && highlight.index === index;
						return (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [item.section !== void 0 && item.section !== group.items[index - 1]?.section ? (0, react_jsx_runtime.jsx)("div", {
							className: MenuView_module_css_default.sectionTitle,
							role: "presentation",
							children: item.section
						}) : null, (0, react_jsx_runtime.jsxs)("button", {
							id: optionId(group.source, index),
							type: "button",
							role: "option",
							"aria-selected": active,
							className: clsx(MenuView_module_css_default.item, active && MenuView_module_css_default.active),
							onMouseDown: (ev) => {
								ev.preventDefault();
								onPick(group.source, index);
							},
							onMouseMove: active ? void 0 : () => {
								onHover(group.source, index);
							},
							children: [
								item.icon !== void 0 && (0, react_jsx_runtime.jsx)("span", {
									className: MenuView_module_css_default.itemIcon,
									"aria-hidden": true,
									children: typeof item.icon === "string" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ReferenceIconRegular, {
										kind: item.icon,
										size: 14
									}) : (0, react_jsx_runtime.jsx)(item.icon, { size: 14 })
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: MenuView_module_css_default.itemName,
									children: item.label ?? item.name
								}),
								item.label !== void 0 && item.label.toLowerCase() !== item.name.toLowerCase() && (0, react_jsx_runtime.jsx)("span", {
									className: MenuView_module_css_default.itemAlias,
									children: item.name
								}),
								item.description !== void 0 && (0, react_jsx_runtime.jsx)("span", {
									className: MenuView_module_css_default.itemDescription,
									children: item.description
								}),
								item.drill === true && (0, react_jsx_runtime.jsxs)("span", {
									className: MenuView_module_css_default.trailing,
									children: [
										(0, react_jsx_runtime.jsx)("span", {
											className: MenuView_module_css_default.drillHintText,
											"aria-hidden": true,
											children: t("drill.hint")
										}),
										(0, react_jsx_runtime.jsx)("kbd", {
											className: MenuView_module_css_default.drillHint,
											"aria-hidden": true,
											children: t("drill.key")
										}),
										(0, react_jsx_runtime.jsx)("span", {
											role: "button",
											"aria-label": t("drill.aria"),
											className: MenuView_module_css_default.drill,
											onMouseDown: (ev) => {
												ev.preventDefault();
												ev.stopPropagation();
												onPick(group.source, index, "drill");
											},
											children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, { size: 12 })
										})
									]
								})
							]
						})] }, optionId(group.source, index));
					})] }, group.source))
				})]
			});
		}
