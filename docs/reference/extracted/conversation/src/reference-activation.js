// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/input/editor/reference-activation.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Route composer clicks through the live reference owner without editing the draft. */
/**
* Install preview activation for atomic chips and editable reference tokens.
* @param editor - composer editor.
* @param open - live source routing; false preserves ordinary editor handling.
* @returns command disposer.
*/
function registerReferenceActivation(editor, open) {
	return editor.registerCommand(Ke$2, (event) => {
		if (event.target === null || event.button !== 0 || event.detail > 1) return false;
		const selection = Kr();
		if (ur(selection) && !selection.isCollapsed()) return false;
		const node = Zs(event.target);
		if ($isReferenceChipNode(node)) {
			if (node.isInvalid()) return false;
			const appearance = node.getAppearance();
			return open(node.getSource(), {
				ref: node.getReference(),
				...appearance === void 0 ? {} : { appearance }
			});
		}
		return node instanceof TextRefNode && open(void 0, { ref: node.getTextContent() });
	}, 1);
}
