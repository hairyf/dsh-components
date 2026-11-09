// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/input/editor/DecoratorPortals.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Decorator render loop: portals every decorator node's React face into its
* host element (what @lexical/react's composer does internally, scoped to
* this composer's needs). Chip DOM identity rides the NodeKey — text edits
* around a chip never remount its portal.
*/
/**
* Render every decorator's React face into its editor host element.
* @param props - the editor to observe.
* @returns the live portal set.
*/
function DecoratorPortals({ editor }) {
	const [decorators, setDecorators] = react.useState(() => editor === null ? {} : editor.getDecorators());
	react.useLayoutEffect(() => {
		if (editor === null) return;
		setDecorators(editor.getDecorators());
		return editor.registerDecoratorListener((next) => {
			setDecorators(next);
		});
	}, [editor]);
	if (editor === null) return null;
	return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: Object.entries(decorators).map(([key, jsx]) => {
		const el = editor.getElementByKey(key);
		return el === null ? null : (0, react_dom.createPortal)(jsx, el, key);
	}) });
}
