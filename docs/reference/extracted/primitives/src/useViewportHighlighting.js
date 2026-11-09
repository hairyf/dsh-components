// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/markdown/useViewportHighlighting.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

const noop = () => {};
/** One document-wide observer; activated elements leave it permanently. */
var HighlightViewport = class {
	observer;
	activators = /* @__PURE__ */ new Map();
	observe(element, activate) {
		if (typeof IntersectionObserver === "undefined") {
			activate();
			return noop;
		}
		this.observer ??= new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const current = this.activators.get(entry.target);
				/* v8 ignore next -- the observer reports only elements still registered with it. */
				if (current === void 0) continue;
				this.activators.delete(entry.target);
				this.observer?.unobserve(entry.target);
				current();
			}
			this.releaseEmptyObserver();
		});
		this.activators.set(element, activate);
		this.observer.observe(element);
		return () => {
			this.activators.delete(element);
			this.observer?.unobserve(element);
			this.releaseEmptyObserver();
		};
	}
	releaseEmptyObserver() {
		if (this.activators.size > 0) return;
		this.observer?.disconnect();
		this.observer = void 0;
	}
};
const highlightViewport = new HighlightViewport();
/**
* Activate one supported code surface when it first intersects the viewport.
* Activation lasts for the component lifetime; browsers without
* IntersectionObserver activate immediately.
* @param target - Code surface whose plain rendering reserves its geometry.
* @param lang - Optional language hint.
* @returns Whether this component may build highlighted output.
*/
function useViewportHighlighting(target, lang) {
	const supported = supportsHighlighting(lang);
	const [activated, setActivated] = useState(false);
	const activate = useCallback(() => {
		setActivated(true);
	}, []);
	useEffect(() => {
		if (activated || !supported) return;
		const element = target.current;
		/* v8 ignore next -- React attaches the host ref before running effects. */
		if (element === null) return;
		return highlightViewport.observe(element, activate);
	}, [
		activate,
		activated,
		supported,
		target
	]);
	return activated && supported;
}
