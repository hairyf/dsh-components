// Extracted from @deepseek-ai/dsh-client-ui-model-selection (lib/client.js); region lib/types/client/ModelSelect.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* ModelSelect: the composer's named model seat (`conversation.input.model`).
		* Two-level selection per figma 496:26454's MenuDropdown: the root menu is
		* the Model / Effort row pair (label + current value + a right chevron),
		* each drilling into its own list — the provider-grouped model list over
		* the shared directory, and the effort levels. The trigger (313:14108's
		* ToggleButton) shows both: model name + effort in the caption tone.
		* Model catalogs above four entries show search, which retains focus while
		* ↑/↓ cycle the highlighted result; Enter and Tab accept it. Smaller model
		* catalogs, root panes, and effort panes move focus between rows. Escape and Shift+Tab leave a drilled pane first and otherwise close
		* back to the trigger. A drilled pane focuses the current effort or model
		* search field. Provider headings paint their background only while pinned
		* by scrolling. Clearing a query restores the full list and search focus.
		* Selecting restores trigger focus without a ring until the trigger loses focus
		* or the menu reopens. Mobile devices restore button focus when opening or
		* drilling; model search takes focus only after explicit user input.
		* Model names match a case-insensitive ordered subsequence
		* within each provider group, ranked by
		* prefix, alignment score, then catalog order. Returning to the root pane
		* hands focus back to the cell that opened it. Data and submission ride the
		* same per-session ModelDirectory as the /model popup; exact-model reasoning
		* metadata and the selected effort come from the Host rather than a
		* client-owned vocabulary. A rejected selection announces through the shared
		* transient Toast anchored to the composer card; the in-menu strip with
		* Retry remains the catalog-load surface. While the directory's pending
		* selection is unsettled, the trigger shows a spinner in place of its
		* chevron, and each row whose value that selection carries shows one in place
		* of its check mark.
		*/
		/** Unplaced portal card: hidden but laid out at a fixed origin so offsetWidth/offsetHeight are real (Menu primitive's measure pass). */
		const MEASURE_STYLE = {
			visibility: "hidden",
			left: 0,
			top: 0
		};
		/**
		* Render the composer model seat.
		* @param props - owner share (locked) + injected face (shared directory
		* store/verbs) + the standard locale seat.
		* @returns the trigger and, while open, the two-level menu.
		*/
		function ModelSelect({ locked, available, directory, load, select, resolveText, t, renderSlot }) {
			const state = (0, react.useSyncExternalStore)((fn) => directory.subscribe(fn), () => directory.getSnapshot());
			const [open, setOpen] = (0, react.useState)(false);
			const [pane, setPane] = (0, react.useState)("root");
			const [query, setQuery] = (0, react.useState)("");
			const [highlightedIndex, setHighlightedIndex] = (0, react.useState)(null);
			const [selectionFocus, setSelectionFocus] = (0, react.useState)(false);
			const lastActionRef = (0, react.useRef)("load");
			const [toast, setToast] = (0, react.useState)(null);
			const toastSeq = (0, react.useRef)(0);
			const rootRef = (0, react.useRef)(null);
			const triggerRef = (0, react.useRef)(null);
			const searchRef = (0, react.useRef)(null);
			const menuRef = (0, react.useRef)(null);
			const groupsRef = (0, react.useRef)(null);
			const menuPos = (0, _deepseek_ai_dsh_client_ui_primitives.useAnchoredPosition)({
				open: open && available,
				anchorRef: triggerRef,
				panelRef: menuRef,
				side: "top",
				align: "end",
				gap: 8,
				margin: 12,
				layoutKey: pane
			});
			const itemRefs = (0, react.useRef)([]);
			const id = (0, react.useId)();
			const accountProviderName = t("provider.account");
			const groups = (0, react.useMemo)(() => orderModelProviders(state.groups).map((group) => ({
				...group,
				provider: {
					id: group.id,
					name: group.id === "deepseek-account" ? accountProviderName : group.name
				}
			})), [state.groups, accountProviderName]);
			const choices = (0, react.useMemo)(() => groups.flatMap((group) => group.models.map((model) => ({
				group,
				model,
				selection: {
					provider: group.id,
					model: model.id,
					...model.reasoning?.defaultEffort === void 0 ? {} : { reasoningEffort: model.reasoning.defaultEffort }
				}
			}))), [groups]);
			const showSearch = choices.length > 4;
			const filteredGroups = (0, react.useMemo)(() => groups.map((group) => ({
				...group,
				models: (0, _deepseek_ai_dsh_client_ui_primitives.rankByName)(group.models, showSearch ? query.trim() : "")
			})).filter((group) => group.models.length > 0), [
				groups,
				query,
				showSearch
			]);
			const visibleModels = (0, react.useMemo)(() => filteredGroups.flatMap((group) => group.models.map((model) => ({
				provider: group.id,
				model: model.id
			}))), [filteredGroups]);
			const currentVisibleIndex = visibleModels.findIndex((model) => model.provider === state.current?.provider && model.model === state.current.model);
			const activeModelIndex = Math.min(highlightedIndex ?? Math.max(0, currentVisibleIndex), visibleModels.length - 1);
			const currentChoice = choices[state.current === null ? -1 : choices.findIndex((c) => c.selection.provider === state.current?.provider && c.selection.model === state.current.model)];
			const reasoning = currentChoice?.model.reasoning;
			const effectiveEffort = state.current?.reasoningEffort ?? reasoning?.defaultEffort;
			const effortLabel = currentChoice === void 0 ? void 0 : reasoning === void 0 ? state.retainedEffort : effectiveEffort === void 0 ? t("effort.providerDefault") : reasoning.efforts.find((level) => level.id === effectiveEffort)?.name ?? effectiveEffort;
			const effortChoices = (0, react.useMemo)(() => reasoning === void 0 ? [] : [...reasoning.defaultEffort === void 0 ? [{
				key: "provider-default",
				effort: void 0,
				label: t("effort.providerDefault")
			}] : [], ...reasoning.efforts.map((effort) => ({
				key: `effort:${effort.id}`,
				effort: effort.id,
				label: effort.name
			}))], [reasoning, t]);
			const { pending } = state;
			const busy = pending !== null;
			const reload = () => {
				lastActionRef.current = "load";
				load();
			};
			(0, react.useEffect)(() => {
				if (!open) return;
				const closeOutside = (event) => {
					if (rootRef.current?.contains(event.target) === true) return;
					if (menuRef.current?.contains(event.target) === true) return;
					setOpen(false);
				};
				document.addEventListener("mousedown", closeOutside);
				return () => {
					document.removeEventListener("mousedown", closeOutside);
				};
			}, [open]);
			(0, react.useLayoutEffect)(() => {
				if (!showSearch) {
					setQuery("");
					setHighlightedIndex(null);
				}
			}, [showSearch]);
			const paneFocus = (0, react.useRef)(null);
			const previousShowSearch = (0, react.useRef)(showSearch);
			(0, react.useEffect)(() => {
				const changedSearchMode = previousShowSearch.current !== showSearch;
				previousShowSearch.current = showSearch;
				const intent = paneFocus.current ?? (changedSearchMode && pane === "model" ? "drill" : null);
				paneFocus.current = null;
				if (!open || intent === null) return;
				if (intent === "drill") {
					if (pane === "model" && showSearch && !(0, _deepseek_ai_dsh_client_ui_primitives.isMobileDevice)()) {
						searchRef.current?.focus();
						return;
					}
					(menuRef.current?.querySelector("[role=\"menuitemradio\"][aria-checked=\"true\"]:not([disabled])") ?? itemRefs.current.find((item) => item !== null && !item.disabled) ?? triggerRef.current)?.focus();
					return;
				}
				const cell = itemRefs.current[intent === "effort" ? 1 : 0];
				(cell !== null && cell !== void 0 && !cell.disabled ? cell : triggerRef.current)?.focus();
			}, [
				open,
				pane,
				showSearch
			]);
			(0, react.useEffect)(() => {
				const viewport = groupsRef.current;
				if (viewport === null) return;
				return (0, _deepseek_ai_dsh_client_ui_primitives.observeStickyMenuGroups)(viewport);
			}, [
				available,
				open,
				pane,
				filteredGroups
			]);
			(0, react.useLayoutEffect)(() => {
				if (open && pane === "model" && activeModelIndex >= 0) itemRefs.current[activeModelIndex]?.scrollIntoView({ block: "nearest" });
			}, [
				open,
				pane,
				activeModelIndex,
				visibleModels
			]);
			if (!available) return null;
			const show = () => {
				setSelectionFocus(false);
				triggerRef.current?.focus();
				setQuery("");
				setHighlightedIndex(null);
				if (currentChoice === void 0) paneFocus.current = "drill";
				setPane(currentChoice === void 0 ? "model" : "root");
				setOpen(true);
				reload();
			};
			const changeQuery = (next) => {
				setQuery(next);
				setHighlightedIndex(0);
			};
			const close = (restoreFocus = false) => {
				setOpen(false);
				setPane("root");
				if (restoreFocus) queueMicrotask(() => {
					triggerRef.current?.focus();
				});
			};
			const closeAfterSelection = () => {
				setSelectionFocus(true);
				close(true);
			};
			const drill = (next) => {
				setQuery("");
				setHighlightedIndex(null);
				paneFocus.current = "drill";
				setPane(next);
			};
			/** Leave a drilled pane for the root one, handing the keyboard back to its cell. */
			const back = (from) => {
				paneFocus.current = from;
				setPane("root");
			};
			const moveFocus = (offset) => {
				const items = itemRefs.current.filter((item) => item !== null);
				if (items.length === 0) return;
				const active = items.findIndex((item) => item === document.activeElement);
				items[active === -1 ? offset > 0 ? 0 : items.length - 1 : (active + offset + items.length) % items.length]?.focus();
			};
			const onRootKeyDown = (event) => {
				if (event.nativeEvent.isComposing) return;
				if (event.key === "Escape" && open) {
					event.preventDefault();
					if (pane !== "root" && currentChoice !== void 0) back(pane);
					else close(true);
					return;
				}
				if (!open) return;
				if (pane === "model" && showSearch && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
					event.preventDefault();
					if (!busy && visibleModels.length > 0) {
						setHighlightedIndex((activeModelIndex + (event.key === "ArrowDown" ? 1 : -1) + visibleModels.length) % visibleModels.length);
						searchRef.current?.focus();
					}
					return;
				}
				if (pane === "model" && showSearch && event.target instanceof HTMLInputElement && (event.key === "Enter" || event.key === "Tab" && !event.shiftKey)) {
					if (event.key === "Tab" && visibleModels.length === 0) return;
					event.preventDefault();
					const highlighted = visibleModels[activeModelIndex];
					if (!busy && highlighted !== void 0) choose(highlighted);
					return;
				}
				if (event.key === "Tab") {
					if (event.shiftKey) {
						event.preventDefault();
						if (pane !== "root" && currentChoice !== void 0) back(pane);
						else close(true);
						return;
					}
					const focused = document.activeElement;
					const rows = itemRefs.current.filter((item) => item !== null);
					if (focused instanceof HTMLButtonElement && rows.includes(focused)) {
						event.preventDefault();
						focused.click();
						return;
					}
					if (focused !== triggerRef.current) return;
					event.preventDefault();
					if (pane === "model" && showSearch) {
						setHighlightedIndex(null);
						searchRef.current?.focus();
						return;
					}
					(menuRef.current?.querySelector("[role=\"menuitemradio\"][aria-checked=\"true\"]:not([disabled])") ?? rows.find((item) => !item.disabled))?.focus();
					return;
				}
				if (event.key === "ArrowDown" || event.key === "ArrowUp") {
					event.preventDefault();
					moveFocus(event.key === "ArrowDown" ? 1 : -1);
				}
			};
			const onBlur = (event) => {
				if (event.relatedTarget instanceof Node && (rootRef.current?.contains(event.relatedTarget) === true || menuRef.current?.contains(event.relatedTarget) === true)) return;
				close();
			};
			const settleSelection = (result) => {
				if (result === void 0) return;
				if (result.ok) {
					if (rootRef.current !== null) closeAfterSelection();
					return;
				}
				const { error } = result;
				toastSeq.current += 1;
				setToast({
					seq: toastSeq.current,
					text: error.code === "session/writer-held" ? t("error.sessionInUse") : t("error.action", { message: `${error.code}: ${error.message}` })
				});
			};
			const submit = (selection) => {
				lastActionRef.current = "select";
				setSelectionFocus(true);
				triggerRef.current?.focus();
				select(selection).then(settleSelection);
			};
			const choose = (selection) => {
				if (state.current?.provider === selection.provider && state.current.model === selection.model) {
					closeAfterSelection();
					return;
				}
				submit(selection);
			};
			const chooseEffort = (effort) => {
				if (state.current === null) return;
				if (effectiveEffort === effort) {
					closeAfterSelection();
					return;
				}
				submit({
					provider: state.current.provider,
					model: state.current.model,
					...effort === void 0 ? {} : { reasoningEffort: effort }
				});
			};
			const waiting = currentChoice === void 0 && state.status === "loading";
			const modelLabel = waiting ? t("trigger.loading") : currentChoice?.model.name ?? t("trigger.fallback");
			const triggerLabel = effortLabel === void 0 ? modelLabel : `${modelLabel} · ${effortLabel}`;
			const triggerAria = waiting ? t("trigger.loading") : currentChoice === void 0 ? t("trigger.selectAria") : effortLabel === void 0 ? t("trigger.aria", { model: modelLabel }) : t("trigger.ariaEffort", {
				model: modelLabel,
				effort: effortLabel
			});
			const renderModelLabel = (provider, model, placement, selected) => (0, react_jsx_runtime.jsx)("span", {
				"data-provider-id": provider.id,
				"data-model-id": model.id,
				children: renderSlot("conversation.input.model.label", {
					provider,
					model,
					placement,
					selected
				}, { fallback: model.badge === void 0 ? model.name : (0, react_jsx_runtime.jsxs)("span", {
					className: ModelSelect_module_css_default.badgedName,
					children: [
						placement === "trigger" ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
							className: ModelSelect_module_css_default.badge,
							tone: model.badge.tone,
							children: resolveText(model.badge.text)
						}), " "] }) : null,
						(0, react_jsx_runtime.jsx)("span", {
							className: ModelSelect_module_css_default.badgedNameText,
							children: model.name
						}),
						placement === "trigger" ? null : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [" ", (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
							className: ModelSelect_module_css_default.badge,
							tone: model.badge.tone,
							children: resolveText(model.badge.text)
						})] })
					]
				}) })
			});
			let itemIndex = 0;
			let modelIndex = 0;
			const itemRef = () => {
				const at = itemIndex++;
				return (node) => {
					itemRefs.current[at] = node;
				};
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: ModelSelect_module_css_default.root,
				onKeyDown: onRootKeyDown,
				onBlur,
				onMouseDown: (event) => {
					if (event.target instanceof Element && event.target.closest("button") !== null) event.preventDefault();
				},
				children: [
					(0, react_jsx_runtime.jsxs)("button", {
						ref: triggerRef,
						type: "button",
						className: ModelSelect_module_css_default.trigger,
						"aria-label": triggerAria,
						"aria-haspopup": "menu",
						"aria-expanded": open,
						"aria-controls": open ? `${id}-menu` : void 0,
						title: triggerLabel,
						"aria-busy": busy,
						"data-selection-focus": selectionFocus ? "" : void 0,
						onBlur: () => {
							setSelectionFocus(false);
						},
						disabled: locked,
						onClick: () => {
							if (open) close(true);
							else show();
						},
						children: [
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutlineRegular, {
								className: ModelSelect_module_css_default.triggerIcon,
								size: 16
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: ModelSelect_module_css_default.triggerLabel,
								children: currentChoice === void 0 ? modelLabel : renderModelLabel(currentChoice.group.provider, currentChoice.model, "trigger", true)
							}),
							effortLabel !== void 0 && (0, react_jsx_runtime.jsx)("span", {
								className: ModelSelect_module_css_default.triggerEffort,
								children: effortLabel
							}),
							busy ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { className: clsx(ModelSelect_module_css_default.chevron, open && ModelSelect_module_css_default.chevronOpen) })
						]
					}),
					open && (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.MenuSurface, {
						ref: menuRef,
						id: `${id}-menu`,
						className: ModelSelect_module_css_default.menu,
						style: menuPos ?? MEASURE_STYLE,
						role: pane === "model" ? "group" : "menu",
						"aria-label": t("menu.aria"),
						"aria-busy": state.status === "loading" || busy,
						children: [
							pane === "root" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("button", {
								ref: itemRef(),
								type: "button",
								role: "menuitem",
								className: ModelSelect_module_css_default.cell,
								onClick: () => {
									drill("model");
								},
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: ModelSelect_module_css_default.cellLabel,
										children: t("menu.model")
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: ModelSelect_module_css_default.cellValue,
										children: currentChoice === void 0 ? modelLabel : renderModelLabel(currentChoice.group.provider, currentChoice.model, "menu", true)
									}),
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, { className: ModelSelect_module_css_default.cellChevron })
								]
							}), reasoning !== void 0 && (0, react_jsx_runtime.jsxs)("button", {
								ref: itemRef(),
								type: "button",
								role: "menuitem",
								className: ModelSelect_module_css_default.cell,
								onClick: () => {
									drill("effort");
								},
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: ModelSelect_module_css_default.cellLabel,
										children: t("menu.effort")
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: ModelSelect_module_css_default.cellValue,
										children: effortLabel
									}),
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, { className: ModelSelect_module_css_default.cellChevron })
								]
							})] }),
							pane === "model" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								showSearch && (0, react_jsx_runtime.jsxs)("div", {
									className: ModelSelect_module_css_default.searchRow,
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
										ref: searchRef,
										className: clsx(ModelSelect_module_css_default.search, query !== "" && ModelSelect_module_css_default.searchWithQuery),
										type: "text",
										role: "searchbox",
										"aria-label": t("search.placeholder"),
										"aria-controls": `${id}-models`,
										"aria-activedescendant": activeModelIndex < 0 ? void 0 : `${id}-model-${activeModelIndex}`,
										placeholder: t("search.placeholder"),
										value: query,
										readOnly: busy,
										onChange: (event) => {
											changeQuery(event.target.value);
										}
									}), query !== "" && (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ModelSelect_module_css_default.searchClear,
										"aria-label": t("search.clear"),
										disabled: busy,
										onClick: () => {
											changeQuery("");
											searchRef.current?.focus();
										},
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseFillRegular, {})
									})]
								}),
								state.status === "loading" && (0, react_jsx_runtime.jsx)("div", {
									className: ModelSelect_module_css_default.status,
									children: t("status.loading")
								}),
								state.error !== null && lastActionRef.current === "load" && (0, react_jsx_runtime.jsxs)("div", {
									className: ModelSelect_module_css_default.error,
									children: [(0, react_jsx_runtime.jsx)("span", { children: t("error.action", { message: state.error }) }), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ModelSelect_module_css_default.retry,
										onClick: reload,
										children: t("retry")
									})]
								}),
								state.failures.map((failure) => (0, react_jsx_runtime.jsxs)("div", {
									className: ModelSelect_module_css_default.warning,
									children: [(0, react_jsx_runtime.jsx)("span", { children: t("warning.groupLoad", {
										name: failure.id === "deepseek-account" ? t("provider.account") : failure.name,
										message: failure.message
									}) }), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ModelSelect_module_css_default.retry,
										onClick: reload,
										children: t("retry")
									})]
								}, failure.id)),
								(0, react_jsx_runtime.jsx)("div", {
									ref: groupsRef,
									id: `${id}-models`,
									className: clsx(ModelSelect_module_css_default.groups, "scrollable"),
									role: "menu",
									"aria-label": t("menu.model"),
									hidden: filteredGroups.length === 0,
									children: filteredGroups.map((group) => {
										return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuGroup, {
											label: group.provider.name,
											children: group.models.map((model) => {
												const index = modelIndex++;
												const selected = state.current?.provider === group.id && state.current.model === model.id;
												return (0, react_jsx_runtime.jsxs)("button", {
													ref: itemRef(),
													type: "button",
													role: "menuitemradio",
													"aria-checked": selected,
													id: `${id}-model-${index}`,
													tabIndex: showSearch ? -1 : 0,
													onFocus: () => {
														setHighlightedIndex(index);
													},
													"data-highlighted": index === activeModelIndex ? "" : void 0,
													className: clsx(ModelSelect_module_css_default.option, ModelSelect_module_css_default.modelOption, selected && ModelSelect_module_css_default.selected, index === activeModelIndex && ModelSelect_module_css_default.optionActive),
													onMouseMove: busy || index === activeModelIndex ? void 0 : () => {
														if (showSearch) setHighlightedIndex(index);
														else itemRefs.current[index]?.focus();
													},
													title: model.name,
													disabled: busy,
													onClick: () => {
														choose({
															provider: group.id,
															model: model.id
														});
													},
													children: [(0, react_jsx_runtime.jsx)("span", {
														className: ModelSelect_module_css_default.optionCopy,
														children: (0, react_jsx_runtime.jsx)("span", {
															className: ModelSelect_module_css_default.modelName,
															children: renderModelLabel(group.provider, model, "option", selected)
														})
													}), (0, react_jsx_runtime.jsx)("span", {
														className: ModelSelect_module_css_default.check,
														children: pending?.provider === group.id && pending.model === model.id ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" }) : selected ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, {}) : null
													})]
												}, model.id);
											})
										}, group.id);
									})
								}),
								state.status === "ready" && filteredGroups.length === 0 && (0, react_jsx_runtime.jsx)("div", {
									className: ModelSelect_module_css_default.empty,
									role: "status",
									children: t(choices.length === 0 ? "empty.models" : "search.empty")
								})
							] }),
							pane === "effort" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [state.error !== null && lastActionRef.current === "load" && (0, react_jsx_runtime.jsxs)("div", {
								className: ModelSelect_module_css_default.error,
								children: [(0, react_jsx_runtime.jsx)("span", { children: t("error.action", { message: state.error }) }), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: ModelSelect_module_css_default.retry,
									onClick: reload,
									children: t("action.reload")
								})]
							}), (0, react_jsx_runtime.jsx)("div", {
								className: clsx(ModelSelect_module_css_default.groups, "scrollable"),
								children: effortChoices.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
									className: ModelSelect_module_css_default.empty,
									children: t("empty.efforts")
								}) : effortChoices.map((level) => (0, react_jsx_runtime.jsxs)("button", {
									ref: itemRef(),
									type: "button",
									role: "menuitemradio",
									"aria-checked": effectiveEffort === level.effort,
									className: clsx(ModelSelect_module_css_default.option, effectiveEffort === level.effort && ModelSelect_module_css_default.selected),
									disabled: busy,
									onClick: () => {
										chooseEffort(level.effort);
									},
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: ModelSelect_module_css_default.optionCopy,
										children: (0, react_jsx_runtime.jsx)("span", {
											className: ModelSelect_module_css_default.modelName,
											children: level.label
										})
									}), (0, react_jsx_runtime.jsx)("span", {
										className: ModelSelect_module_css_default.check,
										children: pending !== null && pending.provider === state.current?.provider && pending.model === state.current.model && pending.reasoningEffort === level.effort ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" }) : effectiveEffort === level.effort ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, {}) : null
									})]
								}, level.key))
							})] })
						]
					}), document.body),
					toast !== null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
						text: toast.text,
						icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
						anchor: rootRef.current?.closest("[data-composer-card]") ?? null,
						onDone: () => {
							setToast(null);
						}
					}, toast.seq)
				]
			});
		}
