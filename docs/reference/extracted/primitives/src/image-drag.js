// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/image-drag.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Image gestures delegate file preparation and transport to the owning feature. */
/**
* Prepare resource-backed images on primary press, other images also on hover; release on leave.
* Releasing inside the image retains preparation for the next gesture; cancelled drags never start late.
* @param actions - stable file preparation and error callbacks.
* @param src - displayed image URL.
* @param name - proposed export name.
* @param original - already loaded original bytes.
* @param resourceAddress - verifiable reference to an unmodified local original.
* @returns image gesture handlers; overflowing images remain owned by their pan handler.
*/
function useImageDrag(actions, src, name, original, resourceAddress) {
	const source = useMemo(() => original === void 0 ? {
		kind: "url",
		url: src,
		name,
		mediaType: "",
		resourceAddress
	} : {
		kind: "blob",
		blob: original,
		name,
		mediaType: original.type,
		resourceAddress
	}, [
		src,
		name,
		original,
		resourceAddress
	]);
	const state = useRef();
	const dragged = useRef(false);
	const release = useCallback(() => {
		const previous = state.current;
		state.current = void 0;
		previous?.abort.abort();
		previous?.prepared?.release();
	}, []);
	useEffect(() => release, [
		release,
		source,
		actions
	]);
	const prepare = useCallback((image) => {
		if (src === "" || state.current !== void 0) return;
		const current = {
			abort: new AbortController(),
			failed: false
		};
		state.current = current;
		window.addEventListener("pointerup", (event) => {
			if (event.target !== image) release();
		}, { signal: current.abort.signal });
		window.addEventListener("blur", release, {
			once: true,
			signal: current.abort.signal
		});
		actions.prepare(source, current.abort.signal).then((prepared) => {
			if (current.abort.signal.aborted) prepared.release();
			else current.prepared = prepared;
		}, (_error) => {
			current.failed = true;
		});
	}, [
		src,
		actions,
		source,
		release
	]);
	const intent = useCallback((event) => {
		if (!event.defaultPrevented && event.currentTarget.draggable && (resourceAddress === void 0 || event.type === "pointerdown")) prepare(event.currentTarget);
	}, [prepare, resourceAddress]);
	const onDragStart = useCallback((event) => {
		if (event.defaultPrevented || src === "") return;
		dragged.current = true;
		const current = state.current;
		if (current?.prepared !== void 0) {
			if (!current.prepared.start(event.dataTransfer, event.currentTarget)) {
				event.preventDefault();
				release();
			}
			return;
		}
		const url = new URL(src, location.href);
		if (original === void 0 && (url.protocol === "https:" || url.protocol === "http:") && url.origin !== location.origin) return;
		event.preventDefault();
		if (current?.failed === true) {
			actions.reportFailure();
			release();
		}
		prepare(event.currentTarget);
	}, [
		src,
		original,
		actions,
		prepare,
		release
	]);
	return {
		onPointerEnter: intent,
		onPointerDown: useCallback((event) => {
			dragged.current = false;
			if (event.button === 0) intent(event);
		}, [intent]),
		onPointerLeave: useCallback((event) => {
			if (event.buttons !== 1) release();
		}, [release]),
		onDragStart,
		onDragEnd: release,
		onClickCapture: useCallback((event) => {
			if (event.detail === 0) {
				dragged.current = false;
				return;
			}
			if (!dragged.current) return;
			event.preventDefault();
			event.stopPropagation();
			dragged.current = false;
		}, [])
	};
}
