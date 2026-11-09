// Extracted from @deepseek-ai/dsh-client-ui-commands (lib/client.js); region lib/types/client/PopupSelectView.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Official popupSelect shell: renders one session's PopupSelectController
		* store into the conversation.input.overlay anchor. Unlike the slash menu
		* (combobox — textarea keeps focus), this shell focuses its search input on
		* desktop; phones and tablets require explicit search focus. Typing filters
		* the loaded options locally, Enter and Tab accept the filtered highlight,
		* ↑↓ walk it (wrapping,
		* scrolled into view), and Escape and Shift+Tab dismiss back to the composer.
		* ←→ keep the search input's native caret. Any pointer interaction outside the
		* box dismisses (the click's own target takes focus). Closed state renders
		* null; the overlay slot stays mounted. The card height clamps to the space
		* above the composer.
		*/
		/** Design cap on the card height (same MenuDropdown family as the slash menu). */
		const MAX_HEIGHT = 320;
		/**
		* Render the popupSelect shell overlay entry.
		* @param props - injected face: the session's shell controller; `t` rides the standard locale seat.
		* @returns the select card while open; null while closed.
		*/
		function PopupSelectView({ popup, t }) {
			const state = (0, react.useSyncExternalStore)((fn) => popup.state.subscribe(fn), () => popup.state.getSnapshot());
			const cardRef = (0, react.useRef)(null);
			const searchRef = (0, react.useRef)(null);
			const viewportRef = (0, react.useRef)(null);
			const rows = (0, react.useMemo)(() => filterOptions(state.options, state.search, state.searchMode), [
				state.options,
				state.search,
				state.searchMode
			]);
			const groups = (0, react.useMemo)(() => groupOptions(rows), [rows]);
			(0, react.useEffect)(() => {
				const viewport = viewportRef.current;
				if (viewport === null) return;
				return (0, _deepseek_ai_dsh_client_ui_primitives.observeStickyMenuGroups)(viewport);
			}, [
				state.open,
				state.status,
				state.confirming,
				groups
			]);
			const maxHeight = (0, _deepseek_ai_dsh_client_ui_primitives.useAnchoredMaxHeight)(cardRef, MAX_HEIGHT, state);
			const active = state.open ? state.active : null;
			(0, react.useEffect)(() => {
				if (active === null) return;
				cardRef.current?.querySelector("[aria-selected=\"true\"]")?.scrollIntoView({ block: "nearest" });
			}, [
				active,
				rows,
				state.confirming
			]);
			(0, react.useEffect)(() => {
				if (!state.open || state.confirming !== null) return;
				const onPointerDown = (ev) => {
					if (cardRef.current !== null && ev.target instanceof Node && cardRef.current.contains(ev.target)) return;
					popup.dismiss();
				};
				document.addEventListener("pointerdown", onPointerDown, true);
				return () => {
					document.removeEventListener("pointerdown", onPointerDown, true);
				};
			}, [
				state.open,
				state.confirming,
				popup
			]);
			(0, react.useEffect)(() => {
				if (!state.open || state.confirming !== null) return;
				if ((0, _deepseek_ai_dsh_client_ui_primitives.isMobileDevice)()) return;
				searchRef.current?.focus();
			}, [state.open, state.confirming]);
			if (!state.open) return null;
			const confirmation = state.confirming?.confirmation;
			const emptyLabel = state.searchLabels === null ? t("status.empty") : state.options.length === 0 ? state.searchLabels.empty : state.searchLabels.noResults;
			const onKeyDown = (ev) => {
				switch (ev.key) {
					case "ArrowDown":
						ev.preventDefault();
						popup.move(1);
						return;
					case "ArrowUp":
						ev.preventDefault();
						popup.move(-1);
						return;
					case "Enter":
						ev.preventDefault();
						popup.select(state.active);
						return;
					case "Tab":
						if (!ev.shiftKey && (state.status !== "ready" || rows.length === 0)) return;
						ev.preventDefault();
						if (ev.shiftKey) popup.dismiss({ focusComposer: true });
						else popup.select(state.active);
						return;
					case "Escape":
						ev.preventDefault();
						popup.dismiss({ focusComposer: true });
						return;
					default:
				}
			};
			const renderOption = (option, index) => (0, react_jsx_runtime.jsxs)("div", {
				role: "option",
				"aria-selected": index === state.active,
				"aria-label": option.badge === void 0 ? void 0 : `${option.label} ${option.badge}`,
				className: clsx(PopupSelectView_module_css_default.row, index === state.active && PopupSelectView_module_css_default.rowActive),
				onClick: () => {
					popup.select(index);
				},
				onMouseEnter: () => {
					popup.highlight(index);
				},
				children: [
					(0, react_jsx_runtime.jsxs)("span", {
						className: PopupSelectView_module_css_default.label,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: PopupSelectView_module_css_default.labelText,
							children: option.label
						}), option.badge !== void 0 && (0, react_jsx_runtime.jsx)("sup", {
							className: PopupSelectView_module_css_default.badge,
							children: option.badge
						})]
					}),
					option.detail !== void 0 && (0, react_jsx_runtime.jsx)("span", {
						className: PopupSelectView_module_css_default.detail,
						children: option.detail
					}),
					option.active === true && (0, react_jsx_runtime.jsx)("span", {
						className: PopupSelectView_module_css_default.check,
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, {})
					})
				]
			}, option.id);
			let optionIndex = 0;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [state.confirming === null && (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.MenuSurface, {
				ref: cardRef,
				className: PopupSelectView_module_css_default.card,
				style: { maxHeight },
				"aria-label": t("overlay.aria", { command: String(state.command) }),
				onKeyDown,
				children: [
					(0, react_jsx_runtime.jsx)("input", {
						ref: searchRef,
						className: PopupSelectView_module_css_default.search,
						type: "text",
						placeholder: state.searchLabels?.placeholder ?? t("search.placeholder"),
						"aria-label": t("search.aria"),
						value: state.search,
						readOnly: state.submitting,
						onChange: (ev) => {
							popup.setSearch(ev.currentTarget.value);
						}
					}),
					state.error !== null && (0, react_jsx_runtime.jsxs)("div", {
						className: PopupSelectView_module_css_default.error,
						role: "alert",
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: PopupSelectView_module_css_default.errorText,
							children: state.error
						}), state.status === "failed" && (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: PopupSelectView_module_css_default.retry,
							onClick: () => {
								popup.retry();
							},
							children: t("retry")
						})]
					}),
					state.status === "pending" && (0, react_jsx_runtime.jsx)("div", {
						className: PopupSelectView_module_css_default.status,
						children: t("status.loading")
					}),
					state.submitting && (0, react_jsx_runtime.jsx)("div", {
						className: PopupSelectView_module_css_default.status,
						children: t("status.applying")
					}),
					state.status === "ready" && rows.length === 0 && (0, react_jsx_runtime.jsx)("div", {
						className: PopupSelectView_module_css_default.status,
						children: emptyLabel
					}),
					state.status === "ready" && (0, react_jsx_runtime.jsx)("div", {
						ref: viewportRef,
						role: "listbox",
						"aria-label": t("listbox.aria", { command: String(state.command) }),
						className: PopupSelectView_module_css_default.viewport,
						children: groups.map(({ group, rows: groupRows }) => group === void 0 ? (0, react_jsx_runtime.jsx)(react.Fragment, { children: groupRows.map((option) => renderOption(option, optionIndex++)) }, "ungrouped") : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuGroup, {
							label: group.label,
							children: groupRows.map((option) => renderOption(option, optionIndex++))
						}, `group:${group.name}`))
					})
				]
			}), confirmation !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.RiskConfirmation, {
				open: true,
				title: confirmation.title,
				description: confirmation.description,
				acknowledgeLabel: confirmation.acknowledgeLabel,
				cancelLabel: confirmation.cancelLabel,
				closeLabel: t("close"),
				confirmLabel: confirmation.confirmLabel,
				acknowledged: state.acknowledged,
				onAcknowledgedChange: (value) => {
					popup.acknowledge(value);
				},
				onCancel: () => {
					popup.cancelConfirmation();
				},
				onConfirm: () => {
					popup.confirm();
				}
			})] });
		}
