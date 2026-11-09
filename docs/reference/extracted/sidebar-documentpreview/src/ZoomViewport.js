// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/zoom/ZoomViewport.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Shared zoom viewport, gesture handling, anchoring, and fit-width measurement. */
		const PINCH_SETTLE_DELAY_MS = 120;
		const CONTROLS_HIDE_DELAY_MS = 420;
		const CONTROLS_REVEAL_HEIGHT_PX = 72;
		function pointerAnchor(clientX, clientY) {
			const lookup = Reflect.get(document, "elementFromPoint");
			if (typeof lookup !== "function") return void 0;
			const hit = Reflect.apply(lookup, document, [clientX, clientY]);
			const surface = hit instanceof Element ? hit.closest("[data-document-zoom-surface]") : null;
			if (surface === null) return void 0;
			const bounds = surface.getBoundingClientRect();
			return {
				surface,
				x: clientX - bounds.left,
				y: clientY - bounds.top,
				clientX,
				clientY
			};
		}
		/** @returns an actual-size scale that only shrinks content wider than the viewport. */
		function fitWidthZoom(viewportWidth, intrinsicWidth, horizontalInset = 0) {
			if (intrinsicWidth === void 0 || intrinsicWidth <= 0) return 1;
			return Math.min(1, Math.max(1, viewportWidth - horizontalInset) / intrinsicWidth);
		}
		/**
		* Keep zoom controls and trackpad gestures independent from document rendering.
		* @param props - renderer content, intrinsic width, tab preference, and localized labels.
		* @returns the owned scrollport and floating zoom controls.
		*/
		function ZoomViewport(props) {
			const [viewportWidth, setViewportWidth] = (0, react.useState)(0);
			const [controlsVisible, setControlsVisible] = (0, react.useState)(false);
			const fitZoom = fitWidthZoom(viewportWidth, props.intrinsicWidth, props.horizontalInset);
			const zoom = props.preference.kind === "fit-width" ? fitZoom : props.preference.scale;
			const zoomRef = (0, react.useRef)(zoom);
			const modeRef = (0, react.useRef)(props.preference.kind);
			const frame = (0, react.useRef)(null);
			const scrollport = (0, react.useRef)(null);
			const controls = (0, react.useRef)(null);
			const pinchTimer = (0, react.useRef)();
			const controlsHideTimer = (0, react.useRef)();
			const pointerInRevealZone = (0, react.useRef)(false);
			const controlsActive = (0, react.useRef)(false);
			const clearControlsHide = (0, react.useCallback)(() => {
				clearTimeout(controlsHideTimer.current);
				controlsHideTimer.current = void 0;
			}, []);
			const showControls = (0, react.useCallback)(() => {
				clearControlsHide();
				setControlsVisible(true);
			}, [clearControlsHide]);
			const scheduleControlsHide = (0, react.useCallback)(() => {
				clearControlsHide();
				if (pointerInRevealZone.current || controlsActive.current || pinchTimer.current !== void 0) return;
				controlsHideTimer.current = setTimeout(() => {
					controlsHideTimer.current = void 0;
					setControlsVisible(false);
				}, CONTROLS_HIDE_DELAY_MS);
			}, [clearControlsHide]);
			const handleControlsActive = (0, react.useCallback)((active) => {
				controlsActive.current = active;
				if (active) showControls();
				else scheduleControlsHide();
			}, [scheduleControlsHide, showControls]);
			const handlePointerMove = (0, react.useCallback)((event) => {
				const inRevealZone = event.pointerType === "mouse" && event.clientY >= event.currentTarget.getBoundingClientRect().bottom - CONTROLS_REVEAL_HEIGHT_PX;
				pointerInRevealZone.current = inRevealZone;
				if (inRevealZone) showControls();
				else scheduleControlsHide();
			}, [scheduleControlsHide, showControls]);
			const handlePointerLeave = (0, react.useCallback)(() => {
				pointerInRevealZone.current = false;
				scheduleControlsHide();
			}, [scheduleControlsHide]);
			const attachFrame = (0, react.useCallback)((node) => {
				frame.current = node;
				node?.style.setProperty("--document-zoom", String(zoomRef.current));
			}, []);
			const attachScrollport = (0, react.useCallback)((node) => {
				scrollport.current = node;
				props.scrollportRef(node);
			}, [props.scrollportRef]);
			const showZoom = (0, react.useCallback)((next, clientX, clientY) => {
				const node = scrollport.current;
				const previous = zoomRef.current;
				next = Math.min(_deepseek_ai_dsh_client_ui_primitives.DOCUMENT_ZOOM.maximum, Math.max(_deepseek_ai_dsh_client_ui_primitives.DOCUMENT_ZOOM.minimum, next));
				if (next === previous) return previous;
				const bounds = node.getBoundingClientRect();
				const x = clientX === void 0 ? node.clientWidth / 2 : clientX - bounds.left;
				const y = clientY === void 0 ? node.clientHeight / 2 : clientY - bounds.top;
				const anchor = pointerAnchor(bounds.left + x, bounds.top + y);
				const previousScrollLeft = node.scrollLeft;
				const previousScrollTop = node.scrollTop;
				const ratio = next / previous;
				zoomRef.current = next;
				modeRef.current = "fixed";
				frame.current?.setAttribute("data-document-zoom-mode", "fixed");
				frame.current?.style.setProperty("--document-zoom", String(next));
				controls.current?.showZoom(next);
				if (anchor === void 0) {
					node.scrollLeft = (previousScrollLeft + x) * ratio - x;
					node.scrollTop = (previousScrollTop + y) * ratio - y;
				} else {
					const nextBounds = anchor.surface.getBoundingClientRect();
					node.scrollLeft += nextBounds.left + anchor.x * ratio - anchor.clientX;
					node.scrollTop += nextBounds.top + anchor.y * ratio - anchor.clientY;
				}
				return next;
			}, []);
			const setZoom = (0, react.useCallback)((next) => {
				clearTimeout(pinchTimer.current);
				pinchTimer.current = void 0;
				props.onPreference({
					kind: "fixed",
					scale: showZoom(next)
				});
			}, [props.onPreference, showZoom]);
			const fitWidth = (0, react.useCallback)(() => {
				clearTimeout(pinchTimer.current);
				pinchTimer.current = void 0;
				const node = frame.current;
				zoomRef.current = fitZoom;
				modeRef.current = "fit-width";
				node?.setAttribute("data-document-zoom-mode", "fit-width");
				node?.style.setProperty("--document-zoom", String(fitZoom));
				controls.current?.showZoom(fitZoom);
				props.onPreference(FIT_WIDTH);
			}, [fitZoom, props.onPreference]);
			(0, react.useLayoutEffect)(() => {
				const node = scrollport.current;
				const measure = () => {
					setViewportWidth(node.clientWidth);
				};
				measure();
				if (typeof ResizeObserver === "undefined") return;
				const observer = new ResizeObserver(measure);
				observer.observe(node);
				return () => {
					observer.disconnect();
				};
			}, []);
			(0, react.useEffect)(() => {
				if (pinchTimer.current !== void 0) return;
				zoomRef.current = zoom;
				modeRef.current = props.preference.kind;
				frame.current?.setAttribute("data-document-zoom-mode", props.preference.kind);
				frame.current?.style.setProperty("--document-zoom", String(zoom));
				controls.current?.showZoom(zoom);
				props.onRenderZoom?.(zoom);
			}, [
				props.onRenderZoom,
				props.preference.kind,
				zoom
			]);
			(0, react.useEffect)(() => {
				const node = scrollport.current;
				const clearPendingPinch = () => {
					clearTimeout(pinchTimer.current);
					pinchTimer.current = void 0;
					clearControlsHide();
				};
				const wheel = (event) => {
					if (!event.ctrlKey || props.signal.aborted) return;
					event.preventDefault();
					showControls();
					const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? node.clientHeight : 1;
					const delta = Math.max(-40, Math.min(40, event.deltaY * unit));
					showZoom(zoomRef.current * Math.exp(-delta * .01), event.clientX, event.clientY);
					clearTimeout(pinchTimer.current);
					pinchTimer.current = setTimeout(() => {
						pinchTimer.current = void 0;
						props.onPreference({
							kind: "fixed",
							scale: zoomRef.current
						});
						scheduleControlsHide();
					}, PINCH_SETTLE_DELAY_MS);
				};
				node.addEventListener("wheel", wheel, { passive: false });
				props.signal.addEventListener("abort", clearPendingPinch, { once: true });
				return () => {
					node.removeEventListener("wheel", wheel);
					props.signal.removeEventListener("abort", clearPendingPinch);
					clearPendingPinch();
				};
			}, [
				clearControlsHide,
				props.onPreference,
				props.signal,
				scheduleControlsHide,
				showControls,
				showZoom
			]);
			return (0, react_jsx_runtime.jsxs)("section", {
				ref: attachFrame,
				className: ZoomViewport_module_css_default.frame,
				"data-document-zoom-frame": true,
				"data-document-zoom-mode": modeRef.current,
				style: {
					"--document-zoom": zoomRef.current,
					"--document-zoom-reveal-height": `${String(CONTROLS_REVEAL_HEIGHT_PX)}px`
				},
				onPointerMove: handlePointerMove,
				onPointerLeave: handlePointerLeave,
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						ref: attachScrollport,
						className: ZoomViewport_module_css_default.scrollport,
						"data-document-zoom-scrollport": true,
						children: props.children
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: ZoomViewport_module_css_default.revealZone,
						"data-document-zoom-reveal-zone": true,
						"aria-hidden": "true"
					}),
					props.intrinsicWidth !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ZoomControls, {
						ref: controls,
						zoom: zoomRef.current,
						fit: {
							label: props.labels.fitWidth,
							selected: modeRef.current === "fit-width",
							onSelect: fitWidth
						},
						labels: props.labels,
						visible: controlsVisible,
						onZoom: setZoom,
						onActiveChange: handleControlsActive
					})
				]
			});
		}
		/** Shared surface class for actual-size and fit-width layout. */
		const zoomSurfaceClass = ZoomViewport_module_css_default.surface;
