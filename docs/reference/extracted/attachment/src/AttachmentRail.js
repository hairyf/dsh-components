// Extracted from @deepseek-ai/dsh-client-ui-attachment (lib/client.js); region lib/types/AttachmentRail.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Draft-attachment rail: scrollbar-less horizontal overflow paged by edge arrows. */
		/** Approximate pixels per wheel step for `deltaMode` LINE deltas (Firefox
		* notch wheels report lines, not pixels). */
		const WHEEL_LINE_PX = 16;
		/** Smooth paging unless the user asked for reduced motion. */
		function pageBehavior() {
			const matchMedia = window.matchMedia;
			return matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
		}
		/**
		* Horizontal rail over the caller's ordered draft attachments.
		*
		* The rail scrolls with its scrollbar hidden; overflow is announced by edge
		* arrows recomputed from scroll geometry on scroll, item-count changes, and
		* rail size changes (a ResizeObserver on the rail element, so sidebar or
		* panel resizes count, not only window resizes). A vertical wheel pans the
		* rail horizontally and is consumed exclusively (non-passive listener), a
		* newly added item is revealed at the rail's end while a rail that mounts
		* over an existing draft keeps its start position. The owner renders each
		* item and decides mounting; it renders the rail only while items exist.
		*
		* @param props.items - attachments in draft order.
		* @param props.labels - rail-level strings (group name and paging arrows).
		* @param props.renderItem - render one attachment card in draft order.
		* @returns the rail group with its paging arrows.
		*/
		function AttachmentRail({ items, labels, renderItem }) {
			const railRef = (0, react.useRef)(null);
			const countRef = (0, react.useRef)(null);
			const [edges, setEdges] = (0, react.useState)({
				left: false,
				right: false
			});
			const updateEdges = (0, react.useCallback)(() => {
				const el = railRef.current;
				/* v8 ignore next -- defensive: every caller runs while the rail element is mounted. */
				if (el === null) return;
				const left = el.scrollLeft > 1;
				const right = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;
				setEdges((prev) => prev.left === left && prev.right === right ? prev : {
					left,
					right
				});
			}, []);
			(0, react.useLayoutEffect)(() => {
				const grew = countRef.current !== null && items.length > countRef.current;
				countRef.current = items.length;
				const el = railRef.current;
				/* v8 ignore next -- defensive: the rail div renders unconditionally, so the layout effect always finds it. */
				if (el === null) return;
				if (grew) el.scrollLeft = el.scrollWidth - el.clientWidth;
				updateEdges();
			}, [items.length, updateEdges]);
			(0, react.useEffect)(() => {
				const el = railRef.current;
				/* v8 ignore next -- defensive: the rail div renders unconditionally, so the mount effect always finds it. */
				if (el === null) return;
				let disconnect = () => {};
				if (typeof ResizeObserver !== "undefined") {
					const observer = new ResizeObserver(updateEdges);
					observer.observe(el);
					disconnect = () => {
						observer.disconnect();
					};
				}
				const onWheel = (event) => {
					if (event.deltaY === 0) return;
					const scale = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? WHEEL_LINE_PX : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? el.clientWidth : 1;
					event.preventDefault();
					el.scrollBy({
						left: event.deltaX !== 0 ? event.deltaX * scale : Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY) * scale, 60),
						behavior: "auto"
					});
				};
				el.addEventListener("wheel", onWheel, { passive: false });
				return () => {
					disconnect();
					el.removeEventListener("wheel", onWheel);
				};
			}, [updateEdges]);
			const page = (direction) => {
				const el = railRef.current;
				/* v8 ignore next -- defensive: the arrows render only while the rail is mounted, so a click cannot find a null ref. */
				if (el === null) return;
				el.scrollBy({
					left: direction * Math.max(el.clientWidth - 64, 200),
					behavior: pageBehavior()
				});
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: AttachmentRail_module_css_default.root,
				children: [
					edges.left && (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: clsx(AttachmentRail_module_css_default.arrow, AttachmentRail_module_css_default.arrowLeft),
						"aria-label": labels.scrollLeft,
						onClick: () => {
							page(-1);
						},
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutlineRegular, {})
					}),
					(0, react_jsx_runtime.jsx)("div", {
						ref: railRef,
						className: AttachmentRail_module_css_default.rail,
						role: "group",
						"aria-label": labels.group,
						onScroll: updateEdges,
						children: items.map((item) => (0, react_jsx_runtime.jsx)("div", {
							className: AttachmentRail_module_css_default.item,
							children: renderItem(item)
						}, item.id))
					}),
					edges.right && (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: clsx(AttachmentRail_module_css_default.arrow, AttachmentRail_module_css_default.arrowRight),
						"aria-label": labels.scrollRight,
						onClick: () => {
							page(1);
						},
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {})
					})
				]
			});
		}
