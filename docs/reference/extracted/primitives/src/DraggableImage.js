// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/DraggableImage.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Original-image drag gestures owned by a presentation primitive. */
/**
* Render an image with original-file dragging; using explicit application-owned callbacks.
* @param props - image attributes, original filename and file preparation callbacks.
* @param ref - image element for measurement and pointer-mode bindings.
* @returns a draggable image that suppresses only the mouse click following its drag.
*/
const DraggableImage = forwardRef(function DraggableImage({ fileDrag, src, name, original, resourceAddress, ...props }, ref) {
	const drag = useImageDrag(fileDrag, src, name, original, resourceAddress);
	return jsx("img", {
		...props,
		...drag,
		src,
		ref,
		draggable: true
	});
});
