// Extracted from @deepseek-ai/dsh-client-ui-attachment (lib/client.js); region lib/types/client/MessageImages.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Official image gallery Factory and default image Slot adapter. */
/**
* Render a gallery with an authorized loader and caller-owned or default labels.
* @param props - image sources, authorized loader, layout hints, optional labels, and Factory locale seat.
* @returns the official gallery; no Session binding is needed by this component.
*/
function MessageImagesContent({ images, loadImage, align, compact = false, thumbnail = false, labels, t, fileDrag, useContextMenu }) {
	const { getTriggerProps } = useContextMenu();
	return (0, react_jsx_runtime.jsx)(ImageGallery, {
		images,
		load: loadImage,
		align,
		compact,
		thumbnail,
		labels: (0, react.useMemo)(() => labels ?? messageImageLabels(t), [labels, t]),
		fileDrag,
		getTriggerProps
	});
}
/**
* Fill a message, trajectory, or tool image position through the shared Content Factory.
* @param props - Slot owner image data, authorized loader, and framework Factory renderer.
* @returns the official gallery occurrence.
*/
function MessageImages({ images, loadImage, align, compact, thumbnail, renderFactorySlot }) {
	return renderFactorySlot("conversation.images.content", {
		images,
		loadImage,
		align,
		...compact === void 0 ? {} : { compact },
		...thumbnail === void 0 ? {} : { thumbnail }
	});
}
