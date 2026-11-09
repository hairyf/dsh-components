// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/Toast.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Full-opacity hold before the fade starts, when the owner names none. */
const HOLD_MS = 3e3;
/** Fade duration. Must agree with the stylesheet's toast-fade duration. */
const FADE_MS = 1e3;
/**
* Transient top-center banner: slides in, holds at full opacity, fades out,
* then reports done so the owner can unmount it. Re-showing the same text
* restarts the cycle when the owner remounts the component (key it by a
* per-show sequence). Rendered through a body portal so an owner inside a
* transformed or filtered ancestor cannot trap the fixed banner in that
* ancestor's box.
* With unchanged holdMs, parent rerenders do not extend the lifetime.
* Completion calls the latest onDone handler; fully faded actions receive no input.
*
* The hold is the owner's to set, because how long a banner has to stay
* depends on how much there is to read: a one-line limit lands in the default
* window, while a failure that names what broke does not. One value drives
* both the unmount timer and the stylesheet's fade delay — the stylesheet
* reads it as a custom property — so the two can no longer disagree and leave
* the banner unmounting mid-fade.
* @param props.text - resolved banner copy; the owner passes localized text.
* @param props.icon - optional leading glyph (e.g. a warning icon); ignored
* under `tone="success"`, which brings its own glyph.
* @param props.tone - 'success' renders the design's circled green check as
* the leading glyph; omitted, the icon seat keeps its warning tint.
* @param props.actions - optional inline actions continuing the sentence:
* each renders its plain-text `prefix` (a connective like 或) followed by its
* localized `label` as blue clickable text, flowing after `text` as one
* sentence. Each press is the owner's to handle (e.g. undo the reported
* change, then unmount the toast). The banner surface stays click-through —
* only the action text takes the pointer.
* @param props.holdMs - full-opacity hold before the fade; defaults to 3000.
* @param props.anchor - optional element whose horizontal center the banner
* follows (e.g. the composer card, so the banner centers over the chat column
* rather than the whole window); omitted, it centers on the viewport.
* @param props.onDone - called once the fade completes; unmount the toast here.
* @returns the floating banner.
*/
function Toast({ text, icon, tone, anchor, holdMs = HOLD_MS, actions, onDone }) {
	const latestOnDone = useRef(onDone);
	useLayoutEffect(() => {
		latestOnDone.current = onDone;
	}, [onDone]);
	useEffect(() => {
		const timer = setTimeout(() => {
			latestOnDone.current();
		}, holdMs + FADE_MS);
		return () => {
			clearTimeout(timer);
		};
	}, [holdMs]);
	const [left, setLeft] = useState(null);
	useLayoutEffect(() => {
		if (anchor == null) return;
		const measure = () => {
			const rect = anchor.getBoundingClientRect();
			setLeft(rect.left + rect.width / 2);
		};
		measure();
		window.addEventListener("resize", measure);
		return () => {
			window.removeEventListener("resize", measure);
		};
	}, [anchor]);
	return createPortal(jsxs("div", {
		className: css$28.toast,
		role: "alert",
		style: {
			...left === null ? {} : { left },
			"--dsh-toast-hold": `${String(holdMs)}ms`
		},
		children: [tone === "success" ? jsx("span", {
			className: `${css$28.icon} ${css$28.success}`,
			"aria-hidden": true,
			children: jsx(IconCheckCircleOutlineRegular, {})
		}) : icon !== void 0 && jsx("span", {
			className: css$28.icon,
			"aria-hidden": true,
			children: icon
		}), jsxs("span", {
			className: css$28.text,
			children: [text, actions?.map((action) => jsxs(Fragment$1, { children: [action.prefix, jsx("button", {
				type: "button",
				className: css$28.action,
				onClick: action.onClick,
				children: action.label
			})] }, action.label))]
		})]
	}), document.body);
}
