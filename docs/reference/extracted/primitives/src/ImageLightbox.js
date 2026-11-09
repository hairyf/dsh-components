// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/ImageLightbox.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Document-level original-image preview opened by clicking a thumbnail.
* Closes on Escape, backdrop press, or the close control, and restores focus
* to the opener on unmount. Rendered through a body portal: an opener inside
* a transformed or filtered ancestor would otherwise trap the fixed backdrop
* in that ancestor's box instead of covering the viewport.
*
* @param props.src - the original image URL.
* @param props.alt - the image's alt text.
* @param props.labels - dialog and close-control strings.
* @param props.contextMenuProps - optional original-image gesture bindings.
* @param props.onClose - dismiss callback owned by the opener.
* @returns the modal preview dialog.
*/
function ImageLightbox({ src, alt, labels, onClose, contextMenuProps }) {
	const closeRef = useRef(null);
	const restoreRef = useRef(null);
	useEffect(() => {
		restoreRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		closeRef.current?.focus();
		const onKeyDown = (event) => {
			if (event.defaultPrevented || document.activeElement?.closest("[role=\"menu\"]")) return;
			if (event.key === "Escape") {
				event.stopPropagation();
				onClose();
			}
			if (event.key === "Tab") {
				event.preventDefault();
				closeRef.current?.focus();
			}
		};
		window.addEventListener("keydown", onKeyDown, true);
		return () => {
			window.removeEventListener("keydown", onKeyDown, true);
			restoreRef.current?.focus();
		};
	}, [onClose]);
	return createPortal(jsx("div", {
		className: css$38.backdrop,
		role: "dialog",
		"aria-modal": "true",
		"aria-label": labels.dialog,
		children: jsxs("div", {
			className: css$38.stage,
			children: [
				jsx("div", {
					className: css$38.mask,
					"aria-hidden": "true",
					onMouseDown: onClose
				}),
				jsx("img", {
					className: css$38.image,
					src,
					alt,
					...contextMenuProps
				}),
				jsx("button", {
					ref: closeRef,
					type: "button",
					className: css$38.close,
					"aria-label": labels.close,
					onClick: onClose,
					children: jsx(IconCloseOutlineRegular, { size: 16 })
				})
			]
		})
	}), document.body);
}
