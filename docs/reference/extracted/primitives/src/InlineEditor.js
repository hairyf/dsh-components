// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/InlineEditor.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Multi-line inline editor for short saved-on-Enter drafts such as queued messages and goals. */
/**
* Render an autofocused textarea that grows with its text up to six lines, then scrolls.
* A textarea rather than an input: HTML strips newlines from single-line input values.
* Enter saves, Shift+Enter breaks the line, Enter during IME composition does nothing,
* and Escape cancels.
* @param props.value - current draft text.
* @param props.label - localized accessible name.
* @param props.onChange - receives the edited text.
* @param props.onSave - called for a plain Enter.
* @param props.onCancel - called for Escape.
* @param props.className - extra class for the editor's placement.
* @returns the textarea.
*/
function InlineEditor({ value, label, onChange, onSave, onCancel, className }) {
	const ref = useRef(null);
	useLayoutEffect(() => {
		const node = ref.current;
		const fit = () => {
			node.style.height = "auto";
			node.style.height = `${node.scrollHeight + node.offsetHeight - node.clientHeight}px`;
		};
		fit();
		const observer = new ResizeObserver(fit);
		observer.observe(node);
		return () => {
			observer.disconnect();
		};
	}, [value]);
	const onKeyDown = (event) => {
		if (event.key === "Escape") {
			onCancel();
			return;
		}
		const composing = event.nativeEvent.isComposing || Reflect.get(event.nativeEvent, "keyCode") === 229;
		if (event.key !== "Enter" || event.shiftKey || composing) return;
		event.preventDefault();
		onSave();
	};
	return jsx("textarea", {
		ref,
		autoFocus: true,
		rows: 1,
		className: clsx(css$20.editor, className),
		"aria-label": label,
		value,
		onChange: (event) => {
			onChange(event.currentTarget.value);
		},
		onKeyDown
	});
}
