// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/TurnNavigator.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Fixed-pitch virtual turn rail with independent activation and scroll controls. */
		/** Fixed pitch between neighbouring marks; overflow scrolls inside the frame. */
		const TURN_SPACING_PX = 10;
		/** Rail padding above the first mark and below the last one, per end. */
		const RAIL_INSET_PX = 6;
		/** Fade band the mask reserves at a scrollable end. */
		const FADE_PX = 24;
		function preferredScrollBehavior() {
			return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
		}
		const TurnMark = (0, react.memo)(function TurnMark({ item, index, active, busy, previewId, registerElement, onNavigate, onPreview, onFocusChange, t }) {
			const classes = [TurnNavigator_module_css_default.mark];
			if (item.anchor.kind === "unloaded") classes.push(TurnNavigator_module_css_default.markUnloaded);
			if (active) classes.push(TurnNavigator_module_css_default.markActive);
			else if (previewId !== void 0) classes.push(TurnNavigator_module_css_default.markPreview);
			if (busy) classes.push(TurnNavigator_module_css_default.markBusy);
			return (0, react_jsx_runtime.jsx)("button", {
				ref: registerElement,
				"data-index": index,
				type: "button",
				className: classes.join(" "),
				"aria-label": t(item.anchor.kind === "loaded" ? "chat.turnNavigation.jump" : "chat.turnNavigation.jumpLoad", { turn: item.turn }),
				"aria-current": active ? "true" : void 0,
				"aria-busy": busy ? "true" : void 0,
				"aria-describedby": previewId,
				onPointerMove: () => {
					onPreview(item.turn);
				},
				onClick: () => {
					onNavigate(item);
				},
				onFocus: () => {
					onFocusChange(item.turn);
				},
				onBlur: () => {
					onFocusChange(null);
				}
			});
		});
		function TurnNavigatorRail({ items, activeTurn, busyTurn, onNavigate, t }, ref) {
			const [previewTurn, setPreviewTurn] = (0, react.useState)(null);
			const [focusedTurn, setFocusedTurn] = (0, react.useState)(null);
			const scrollerRef = (0, react.useRef)(null);
			const initialization = (0, react.useRef)({
				placed: false,
				index: 0,
				follow: null,
				publishOffset: null
			});
			/** While the pointer works the rail, follow must not move it under the hand. */
			const pointerInsideRef = (0, react.useRef)(false);
			const previewId = (0, react.useId)();
			const turnIndexes = (0, react.useMemo)(() => {
				const indexes = /* @__PURE__ */ new Map();
				items.forEach((item, index) => {
					indexes.set(item.turn, index);
				});
				return indexes;
			}, [items]);
			const activeIndex = activeTurn === null ? void 0 : turnIndexes.get(activeTurn);
			(0, react.useLayoutEffect)(() => {
				initialization.current.index = activeIndex ?? 0;
			}, [activeIndex]);
			const focusedIndex = focusedTurn === null ? void 0 : turnIndexes.get(focusedTurn);
			const previewIndex = previewTurn === null ? void 0 : turnIndexes.get(previewTurn);
			const onFocusChange = (0, react.useCallback)((turn) => {
				setFocusedTurn(turn);
				setPreviewTurn(turn);
			}, []);
			const virtualizer = (0, _tanstack_react_virtual.useVirtualizer)({
				count: items.length,
				enabled: items.length >= 2,
				directDomUpdates: true,
				directDomUpdatesMode: "transform",
				useScrollendEvent: true,
				getScrollElement: (0, react.useCallback)(() => scrollerRef.current, []),
				getItemKey: (0, react.useCallback)((index) => items[index]?.turn ?? index, [items]),
				estimateSize: () => TURN_SPACING_PX,
				measureElement: () => TURN_SPACING_PX,
				initialRect: {
					width: 0,
					height: 0
				},
				initialOffset: 0,
				scrollToFn: (offset, options, instance) => {
					if (initialization.current.placed) (0, _tanstack_react_virtual.elementScroll)(offset, options, instance);
				},
				observeElementOffset: (instance, notify) => {
					initialization.current.publishOffset = notify;
					const dispose = (0, _tanstack_react_virtual.observeElementOffset)(instance, notify);
					return () => {
						dispose?.();
						initialization.current.placed = false;
						initialization.current.follow = null;
						initialization.current.publishOffset = null;
					};
				},
				observeElementRect: (instance, notify) => {
					const element = instance.scrollElement;
					const Observer = instance.targetWindow?.ResizeObserver;
					if (element === null || Observer === void 0) return;
					const observer = new Observer(([entry]) => {
						if (entry === void 0) return;
						const box = entry.borderBoxSize[0];
						const rect = {
							width: Math.round(box?.inlineSize ?? entry.contentRect.width),
							height: Math.round(box?.blockSize ?? entry.contentRect.height)
						};
						const initial = initialization.current;
						if (!initial.placed && rect.height > 0) {
							const max = Math.max(0, instance.getTotalSize() - rect.height);
							const center = initial.index * TURN_SPACING_PX + RAIL_INSET_PX;
							const target = Math.max(0, Math.min(max, center - rect.height / 2));
							initial.placed = true;
							initial.follow = {
								index: initial.index,
								count: instance.options.count,
								height: rect.height
							};
							element.scrollTop = target;
							initial.publishOffset?.(target, false);
						}
						notify(rect);
					});
					observer.observe(element, { box: "border-box" });
					return () => {
						observer.disconnect();
					};
				},
				paddingStart: RAIL_INSET_PX - TURN_SPACING_PX / 2,
				paddingEnd: RAIL_INSET_PX - TURN_SPACING_PX / 2,
				scrollPaddingStart: FADE_PX,
				scrollPaddingEnd: FADE_PX,
				overscan: 3,
				rangeExtractor: (0, react.useCallback)((range) => {
					const indexes = (0, _tanstack_react_virtual.defaultRangeExtractor)(range);
					if (focusedIndex !== void 0) {
						const last = Math.min(range.count - 1, focusedIndex + 1);
						for (let index = Math.max(0, focusedIndex - 1); index <= last; index++) if (!indexes.includes(index)) indexes.push(index);
						indexes.sort((left, right) => left - right);
					}
					return indexes;
				}, [focusedIndex])
			});
			const scrollTop = virtualizer.scrollOffset ?? 0;
			const viewHeight = virtualizer.scrollRect?.height ?? 0;
			const virtualItems = virtualizer.getVirtualItems();
			const scrollToIndex = (0, react.useCallback)((index, reveal, behavior = preferredScrollBehavior()) => {
				const item = virtualizer.measurementsCache[index];
				const height = virtualizer.scrollRect?.height ?? 0;
				if (item === void 0 || height <= 0) return;
				const current = virtualizer.scrollOffset ?? 0;
				const center = item.start + item.size / 2;
				if (reveal === "if-needed") {
					const { scrollPaddingStart, scrollPaddingEnd } = virtualizer.options;
					if (center >= current + scrollPaddingStart && center <= current + height - scrollPaddingEnd) return;
				}
				const target = center - height / 2;
				const max = Math.max(0, virtualizer.getTotalSize() - height);
				const delta = Math.max(0, Math.min(max, target)) - current;
				if (delta !== 0) virtualizer.scrollBy(delta, { behavior });
			}, [virtualizer]);
			(0, react.useImperativeHandle)(ref, () => ({
				activateTurn(turn) {
					const index = turnIndexes.get(turn);
					const item = index === void 0 ? void 0 : items[index];
					if (item !== void 0) onNavigate(item);
				},
				scrollToTurn(turn) {
					const index = turnIndexes.get(turn);
					if (index !== void 0) scrollToIndex(index, "always");
				}
			}), [
				items,
				turnIndexes,
				onNavigate,
				scrollToIndex
			]);
			(0, react.useEffect)(() => {
				if (viewHeight <= 0) {
					initialization.current.follow = null;
					return;
				}
				if (activeIndex === void 0 || pointerInsideRef.current) return;
				const previous = initialization.current.follow;
				if (previous?.index === activeIndex && previous.count === items.length && previous.height === viewHeight) return;
				initialization.current.follow = {
					index: activeIndex,
					count: items.length,
					height: viewHeight
				};
				scrollToIndex(activeIndex, "if-needed", previous?.count === items.length && previous.height === viewHeight ? preferredScrollBehavior() : "instant");
			}, [
				activeIndex,
				items.length,
				viewHeight,
				scrollToIndex
			]);
			if (items.length < 2) return null;
			const preview = previewIndex === void 0 ? void 0 : items[previewIndex];
			const previewPosition = virtualItems.find((item) => item.index === previewIndex);
			const fadeClasses = [TurnNavigator_module_css_default.scroller];
			if (scrollTop > 1) fadeClasses.push(TurnNavigator_module_css_default.fadeTop);
			if (scrollTop < virtualizer.getTotalSize() - viewHeight - 1) fadeClasses.push(TurnNavigator_module_css_default.fadeBottom);
			return (0, react_jsx_runtime.jsx)("div", {
				className: TurnNavigator_module_css_default.slot,
				children: (0, react_jsx_runtime.jsxs)("nav", {
					className: TurnNavigator_module_css_default.frame,
					"aria-label": t("chat.turnNavigation.label"),
					onPointerEnter: () => {
						pointerInsideRef.current = true;
					},
					onPointerLeave: () => {
						pointerInsideRef.current = false;
						setPreviewTurn(null);
					},
					children: [(0, react_jsx_runtime.jsx)("div", {
						ref: scrollerRef,
						className: fadeClasses.join(" "),
						children: (0, react_jsx_runtime.jsx)("div", {
							ref: virtualizer.containerRef,
							className: TurnNavigator_module_css_default.marks,
							children: virtualItems.map(({ index, key }) => {
								const item = items[index];
								if (item === void 0) return null;
								return (0, react_jsx_runtime.jsx)(TurnMark, {
									item,
									index,
									active: item.turn === activeTurn,
									busy: item.turn === busyTurn,
									previewId: item.turn === previewTurn ? previewId : void 0,
									registerElement: virtualizer.measureElement,
									onNavigate,
									onPreview: setPreviewTurn,
									onFocusChange,
									t
								}, key);
							})
						})
					}), preview !== void 0 && previewPosition !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
						id: previewId,
						role: "tooltip",
						className: TurnNavigator_module_css_default.preview,
						style: { "--turn-preview-center": `${String(previewPosition.start + previewPosition.size / 2 - scrollTop)}px` },
						children: [(0, react_jsx_runtime.jsx)("div", {
							className: TurnNavigator_module_css_default.previewPrompt,
							children: preview.prompt || t("chat.turnNavigation.turn", { turn: preview.turn })
						}), preview.response !== "" && (0, react_jsx_runtime.jsx)("div", {
							className: TurnNavigator_module_css_default.previewResponse,
							children: preview.response
						})]
					})]
				})
			});
		}
		/**
		* Fixed-pitch rail of every known Turn — loaded marks scroll, unloaded marks
		* page history in first — with hover and focus previews. Overflow scrolls
		* inside the frame, gradient fades marking each scrollable end, and the
		* active mark centers only outside the fade-free band while the pointer is
		* elsewhere. Previews follow pointer movement or focus, not scrolling under
		* a stationary pointer.
		*/
		const TurnNavigator = (0, react.memo)((0, react.forwardRef)(TurnNavigatorRail));
