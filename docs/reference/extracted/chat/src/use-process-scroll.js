// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/use-process-scroll.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Capped process-group scrolling and fades over the shared follow controller. */
const AT_REST = {
	canScrollUp: false,
	canScrollDown: false
};
const SCROLL_KEYS = new Set([
	"ArrowUp",
	"ArrowDown",
	"PageUp",
	"PageDown",
	"Home",
	"End",
	" "
]);
/**
* Observe one group's body and content without coupling its follow intent to the outer transcript.
* Wheel, touchstart, any pointerdown, and unprevented scroll keys interrupt active animations,
* including events from editable controls; subsequent position sampling determines follow intent.
* @param bodyRef - capped scrolling body.
* @param contentRef - uncapped content whose size reports growth.
* @param open - local disclosure state.
* @param grouped - whether the display mode retains the group's height cap.
* @returns edge fades, DOM event bindings, and one-shot positioning for manual opening.
*/
function useProcessScroll(bodyRef, contentRef, open, grouped) {
	const follow = useScrollFollow(false, 1);
	const initialPosition = (0, react.useRef)(null);
	const [edges, setEdges] = (0, react.useState)(AT_REST);
	const initialize = (0, react.useCallback)((position) => {
		initialPosition.current = position;
	}, []);
	const sync = (0, react.useCallback)((cause) => {
		const body = bodyRef.current;
		let next = AT_REST;
		if (body !== null && body.closest("[hidden], [data-group-expanded-mode]") === null) {
			let metrics = scrollMetrics(body);
			const initial = cause === "resize" ? initialPosition.current : null;
			if (initial !== null) {
				metrics = follow.jump(body, metrics, initial === "bottom" ? metrics.floor : 0);
				if (initial === "top") follow.setFollowing(false);
				initialPosition.current = null;
			} else {
				const wasAnimating = follow.animating;
				if (cause === "scrollend") follow.settle(metrics);
				else follow.sample(metrics);
				if (follow.active && (cause === "resize" || cause === "scrollend" && wasAnimating)) metrics = follow.toBottom(body, metrics, "smooth");
			}
			next = {
				canScrollUp: metrics.top > 1,
				canScrollDown: metrics.top < metrics.floor - 1
			};
		} else follow.reset();
		setEdges((previous) => previous.canScrollUp === next.canScrollUp && previous.canScrollDown === next.canScrollDown ? previous : next);
	}, [bodyRef, follow]);
	const interrupt = (0, react.useCallback)(() => {
		const body = bodyRef.current;
		if (body !== null && follow.animating) follow.interrupt(body, scrollMetrics(body));
	}, [bodyRef, follow]);
	const events = (0, react.useMemo)(() => ({
		onScroll: () => {
			sync("scroll");
		},
		onWheel: interrupt,
		onTouchStart: interrupt,
		onPointerDown: interrupt,
		onKeyDown: (event) => {
			if (!event.defaultPrevented && SCROLL_KEYS.has(event.key)) interrupt();
		}
	}), [interrupt, sync]);
	(0, react.useLayoutEffect)(() => {
		interrupt();
		follow.reset();
		if (!grouped || !open) initialPosition.current = null;
	}, [
		follow,
		grouped,
		interrupt,
		open
	]);
	(0, react.useLayoutEffect)(() => {
		const body = bodyRef.current;
		if (body === null || !open || typeof ResizeObserver === "undefined") return;
		const unbind = follow.bind(body);
		const observer = new ResizeObserver(() => {
			sync("resize");
		});
		const onScrollEnd = (event) => {
			if (event.target === body) sync("scrollend");
		};
		body.addEventListener("scrollend", onScrollEnd);
		observer.observe(body);
		if (contentRef.current !== null) observer.observe(contentRef.current);
		return () => {
			unbind();
			observer.disconnect();
			body.removeEventListener("scrollend", onScrollEnd);
		};
	}, [
		bodyRef,
		contentRef,
		follow,
		open,
		sync
	]);
	return {
		edges,
		events,
		initialize
	};
}
