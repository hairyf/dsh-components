// Extracted from @deepseek-ai/dsh-client-ui-layout (lib/client.js); region lib/types/client/AppFrame.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Three-column shell frame, registered into the built-in 'root' slot (the web
		* shell renders only 'root'). Owns the grid tracks (sidebar | center |
		* rightbar), the drag handles (pointer capture + rAF throttle), the column
		* solve (columns.ts), and the child-slot render decisions: the sidebar slot
		* receives live parameters from that solve. The root-scoped main slot selects
		* the Conversation or a global panel. Each column occupant owns its Session
		* binding and reports the geometry it needs.
		*
		* The right column is a track, not a box: its occupant draws its panel anchored
		* to the frame's right edge at the resolved normal width, and the
		* track only decides whether the centre makes room for it. The occupant reports
		* shown/track/fullscreen through `ctx.layout`; fullscreen keeps the reported
		* track but hides the outer resize handle. Everything arrives through the framework
		* shares — zero cordis or framework imports, zero self-made hooks.
		*/
		/** Center column grid item (session-body building block). */
		function CenterColumn(props) {
			return (0, react_jsx_runtime.jsx)("div", {
				className: AppFrame_module_css_default.centerCol,
				inert: props.inert ? "" : void 0,
				children: props.children
			});
		}
		/** Subscribe to the main key without subscribing the column frame to each panel id. */
		function MainPanel({ usePanelInfo, renderSlot }) {
			const panelId = usePanelInfo((info) => info.activePanelId);
			return (0, react_jsx_runtime.jsx)("div", {
				className: AppFrame_module_css_default.mainPanel,
				"data-global-panel": panelId !== null || void 0,
				children: renderSlot("main", {}, { entryKey: panelId ?? "conversation" })
			});
		}
		/**
		* Right column grid item. Zero-width unless the occupant asked for a track; the
		* occupant's panel is positioned against the column's right edge, which never
		* moves, so it can hang over the centre when there is no track.
		*/
		function RightbarColumn(props) {
			return (0, react_jsx_runtime.jsx)("div", {
				className: AppFrame_module_css_default.rightbarCol,
				"data-rightbar-col": true,
				inert: props.inert ? "" : void 0,
				children: props.children
			});
		}
		/**
		* One drag handle: pointer capture, rAF-throttled dx reports against the drag-start origin.
		* `side` keys the hover-reveal CSS to the owning column.
		*/
		function DragHandle(props) {
			const [dragging, setDragging] = (0, react.useState)(false);
			const origin = (0, react.useRef)(0);
			const latest = (0, react.useRef)(0);
			const frame = (0, react.useRef)(null);
			const capture = (0, react.useRef)(null);
			const callbacks = (0, react.useRef)({
				onStart: props.onStart,
				onDrag: props.onDrag,
				onEnd: props.onEnd
			});
			callbacks.current = {
				onStart: props.onStart,
				onDrag: props.onDrag,
				onEnd: props.onEnd
			};
			const endDrag = (0, react.useCallback)(() => {
				const active = capture.current;
				if (active === null) return;
				capture.current = null;
				if (frame.current !== null) {
					cancelAnimationFrame(frame.current);
					frame.current = null;
				}
				if (active.element.hasPointerCapture(active.id)) active.element.releasePointerCapture(active.id);
				setDragging(false);
				callbacks.current.onEnd();
			}, []);
			(0, react.useEffect)(() => endDrag, [endDrag]);
			const onPointerDown = (0, react.useCallback)((e) => {
				if (e.button !== 0 || capture.current !== null) return;
				e.preventDefault();
				e.currentTarget.setPointerCapture(e.pointerId);
				capture.current = {
					element: e.currentTarget,
					id: e.pointerId
				};
				origin.current = e.clientX;
				latest.current = e.clientX;
				callbacks.current.onStart();
				setDragging(true);
			}, []);
			const onPointerMove = (0, react.useCallback)((e) => {
				if (capture.current?.id !== e.pointerId) return;
				latest.current = e.clientX;
				frame.current ??= requestAnimationFrame(() => {
					frame.current = null;
					callbacks.current.onDrag(latest.current - origin.current);
				});
			}, []);
			const onPointerUp = (0, react.useCallback)((e) => {
				if (capture.current?.id !== e.pointerId) return;
				callbacks.current.onDrag(e.clientX - origin.current);
				endDrag();
			}, [endDrag]);
			const onPointerCancel = (0, react.useCallback)((e) => {
				if (capture.current?.id === e.pointerId) endDrag();
			}, [endDrag]);
			return (0, react_jsx_runtime.jsx)("div", {
				className: AppFrame_module_css_default.handle,
				style: { left: props.left },
				"data-side": props.side,
				"data-dragging": dragging || void 0,
				onPointerDown,
				onPointerMove,
				onPointerUp,
				onPointerCancel,
				onLostPointerCapture: onPointerCancel
			});
		}
		/** The three-column frame (see module doc). */
		function AppFrame({ useStore, useSessions, usePanelInfo, useFoldedLandscape, actions, renderSlot, t }) {
			const layoutInfo = useStore((state) => state.layoutInfo);
			const frameRef = (0, react.useRef)(null);
			const viewport = layoutInfo.viewportWidth;
			const foldedLandscape = useFoldedLandscape((matches) => matches);
			(0, react.useLayoutEffect)(() => {
				const el = frameRef.current;
				/* v8 ignore next -- the ref is always attached by effect time: the frame div renders unconditionally. */
				if (el === null) return;
				let raf = null;
				let disposed = false;
				const measure = () => {
					const width = el.getBoundingClientRect().width;
					if (width > 0) actions.setViewportWidth(width);
				};
				measure();
				const observer = new ResizeObserver(() => {
					if (disposed) return;
					raf ??= requestAnimationFrame(() => {
						raf = null;
						measure();
					});
				});
				observer.observe(el);
				return () => {
					disposed = true;
					observer.disconnect();
					if (raf !== null) cancelAnimationFrame(raf);
				};
			}, [actions]);
			const narrow = viewport < SIDEBAR_AUTO_COLLAPSE;
			const windowsTitlebar = document.documentElement.hasAttribute("data-windows-titlebar");
			const drawer = viewport < 768 && !windowsTitlebar;
			const centeredSidebar = foldedLandscape && viewport >= 768;
			const sidebarCollapsed = narrow ? !layoutInfo.narrowExpanded : layoutInfo.sidebar === 0;
			const drawerOpen = drawer && !sidebarCollapsed;
			const [sidebarTransition, setSidebarTransition] = (0, react.useState)({
				drawer,
				collapsed: sidebarCollapsed,
				instant: true
			});
			if (sidebarTransition.drawer !== drawer || sidebarTransition.collapsed !== sidebarCollapsed) setSidebarTransition({
				drawer,
				collapsed: sidebarCollapsed,
				instant: drawer && sidebarCollapsed && sidebarTransition.collapsed
			});
			const sidebarPreference = sidebarCollapsed ? 0 : layoutInfo.sidebar === 0 ? 280 : layoutInfo.sidebar;
			const rightbarPreference = layoutInfo.rightbar ?? viewport * .45;
			const darwin = document.documentElement.dataset.platform === "darwin";
			const collapsedWidth = drawer || darwin || windowsTitlebar ? 0 : 56;
			const normal = computeColumns(viewport, !layoutInfo.rightbarShown && narrow ? 0 : sidebarPreference, rightbarPreference, collapsedWidth, centeredSidebar);
			const cols = computeColumns(viewport, drawer ? 0 : sidebarPreference, layoutInfo.rightbarTrack ? rightbarPreference : 0, collapsedWidth, centeredSidebar);
			const colsRef = (0, react.useRef)(cols);
			colsRef.current = cols;
			const rightbarWidth = (0, react.useRef)(normal.rightbar);
			rightbarWidth.current = normal.rightbar;
			const sidebarBase = (0, react.useRef)(0);
			const rightbarBase = (0, react.useRef)(0);
			const [dragging, setDragging] = (0, react.useState)(false);
			const [animating, setAnimating] = (0, react.useState)(0);
			const trackToggle = `${sidebarCollapsed}:${layoutInfo.rightbarTrack}:${centeredSidebar}`;
			const previousToggle = (0, react.useRef)(trackToggle);
			const previousViewport = (0, react.useRef)(viewport);
			const animateTracks = previousViewport.current === viewport && (animating > 0 || previousToggle.current !== trackToggle);
			(0, react.useLayoutEffect)(() => {
				const viewportChanged = previousViewport.current !== viewport;
				previousViewport.current = viewport;
				if (viewportChanged) {
					previousToggle.current = trackToggle;
					setAnimating(0);
					return;
				}
				if (previousToggle.current === trackToggle) return;
				previousToggle.current = trackToggle;
				setAnimating((token) => token + 1);
			}, [trackToggle, viewport]);
			(0, react.useEffect)(() => {
				if (animating === 0) return;
				const frame = frameRef.current;
				/* v8 ignore next -- the ref is always attached by effect time: the frame div renders unconditionally. */
				if (frame === null) return;
				const settle = () => {
					setAnimating(0);
				};
				const onTransitionEnd = (event) => {
					if (event.target === frame && event.propertyName === "grid-template-columns") settle();
				};
				frame.addEventListener("transitionend", onTransitionEnd);
				const timer = setTimeout(settle, 600);
				return () => {
					frame.removeEventListener("transitionend", onTransitionEnd);
					clearTimeout(timer);
				};
			}, [animating]);
			const onDragEnd = (0, react.useCallback)(() => {
				setDragging(false);
			}, []);
			const onSidebarStart = (0, react.useCallback)(() => {
				sidebarBase.current = colsRef.current.sidebar;
				setDragging(true);
			}, []);
			const onSidebarDrag = (0, react.useCallback)((dx) => {
				actions.setSidebar(sidebarBase.current + dx);
			}, [actions]);
			const onRightbarStart = (0, react.useCallback)(() => {
				rightbarBase.current = rightbarWidth.current;
				setDragging(true);
			}, []);
			const onRightbarDrag = (0, react.useCallback)((dx) => {
				actions.setRightbar(rightbarBase.current - dx);
			}, [actions]);
			const productTitle = "DeepSeek Harness";
			const rightbarMax = cols.rightbar === 0 ? 0 : clampWidth(rightbarPreference, 300, viewport * RIGHTBAR_MAX_RATIO);
			const sidebarWidth = drawer ? Math.min(layoutInfo.sidebar || 280, Math.max(0, viewport - 48)) : cols.sidebar;
			const sidebar = (0, react.useMemo)(() => renderSlot("sidebar", {
				collapsed: sidebarCollapsed,
				width: sidebarWidth,
				drawer
			}), [
				renderSlot,
				sidebarCollapsed,
				sidebarWidth,
				drawer
			]);
			const main = (0, react.useMemo)(() => (0, react_jsx_runtime.jsx)(MainPanel, {
				usePanelInfo,
				renderSlot
			}), [usePanelInfo, renderSlot]);
			const overlays = (0, react.useMemo)(() => renderSlot("shell.overlay", {}), [renderSlot]);
			const leading = (0, react.useMemo)(() => renderSlot("shell.leading", {}), [renderSlot]);
			const leadingMounted = drawer || darwin && sidebarCollapsed;
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: frameRef,
				className: AppFrame_module_css_default.frame,
				style: {
					...windowsTitlebar ? { "--dsh-windows-sidebar-width": `${cols.sidebar}px` } : {},
					gridTemplateColumns: `${cols.sidebar}px minmax(${cols.rightbar === 0 ? 0 : 400}px, 1fr) minmax(0px, ${rightbarMax}px)`
				},
				"data-sidebar-collapsed": sidebarCollapsed || void 0,
				"data-sidebar-drawer": drawer || void 0,
				"data-sidebar-instant": drawer && sidebarCollapsed && sidebarTransition.instant || void 0,
				"data-rightbar-collapsed": cols.rightbar === 0 || void 0,
				"data-rightbar-fullscreen": layoutInfo.rightbarFullscreen || void 0,
				"data-rightbar-instant": layoutInfo.rightbarInstant || void 0,
				"data-dragging": dragging || void 0,
				"data-animating": animateTracks || void 0,
				children: [
					(0, react_jsx_runtime.jsx)(DocumentTitle, {
						productTitle,
						useSessions,
						usePanelInfo
					}),
					drawer && (0, react_jsx_runtime.jsx)("div", {
						className: AppFrame_module_css_default.drawerMask,
						"data-sidebar-mask": true,
						"aria-hidden": "true",
						onClick: drawerOpen ? () => {
							actions.toggleSidebar();
						} : void 0
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: AppFrame_module_css_default.sidebarCol,
						style: drawer ? { width: sidebarWidth } : void 0,
						inert: drawer && sidebarCollapsed ? "" : void 0,
						children: sidebar
					}),
					(0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(CenterColumn, {
						inert: drawerOpen,
						children: main
					}), (0, react_jsx_runtime.jsx)(RightbarColumn, {
						inert: drawerOpen,
						children: renderSlot("rightbar", {
							width: normal.rightbar,
							viewportWidth: viewport,
							canShow: normal.rightbar > 0
						})
					})] }),
					(0, react_jsx_runtime.jsx)("div", {
						className: AppFrame_module_css_default.bottomRow,
						"data-shell-bottom": true,
						inert: drawerOpen ? "" : void 0,
						children: renderSlot("shell.bottom", {})
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: AppFrame_module_css_default.overlayLayer,
						"data-shell-overlay": true,
						children: overlays
					}),
					leadingMounted && (0, react_jsx_runtime.jsx)("div", {
						className: AppFrame_module_css_default.leadingSeat,
						"data-shell-leading": true,
						inert: drawerOpen ? "" : void 0,
						children: leading
					}),
					!drawer && !centeredSidebar && !sidebarCollapsed && (0, react_jsx_runtime.jsx)(DragHandle, {
						side: "sidebar",
						left: cols.sidebar,
						onStart: onSidebarStart,
						onDrag: onSidebarDrag,
						onEnd: onDragEnd
					}),
					layoutInfo.rightbarShown && !layoutInfo.rightbarFullscreen && normal.rightbar > 0 && (0, react_jsx_runtime.jsx)(DragHandle, {
						side: "rightbar",
						left: viewport - normal.rightbar,
						onStart: onRightbarStart,
						onDrag: onRightbarDrag,
						onEnd: onDragEnd
					})
				]
			});
		}
