// Extracted from @deepseek-ai/dsh-client-ui-attachment (lib/client.js); region lib/types/MessageImage.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Display box for a lone image (DeepSeek Chat rule): long edge 240px with
		* the rendered aspect ratio clamped to [0.25, 4] — the overflow is cropped by
		* `object-fit: cover` — and never upscaled past the image's natural size. The
		* crop anchor keeps the top of very tall images and the left of very wide
		* ones, where the informative content usually starts. */
		function singleFit(dimensions) {
			const natural = dimensions.width / dimensions.height;
			const ratio = Math.min(4, Math.max(.25, natural));
			const box = ratio >= 1 ? {
				width: 240,
				height: 240 / ratio
			} : {
				width: 240 * ratio,
				height: 240
			};
			const scale = Math.min(1, dimensions.width / box.width, dimensions.height / box.height);
			return {
				width: Math.max(1, Math.round(box.width * scale)),
				height: Math.max(1, Math.round(box.height * scale)),
				objectPosition: natural < .25 ? "center top" : natural > 4 ? "left center" : "center"
			};
		}
		/** Intrinsic dimensions of one gallery entry; a preview's stay unknown until its intake probe resolved. */
		function dimensionsOf(image) {
			if ("attachment" in image) return image.attachment;
			return image.preview.width !== void 0 && image.preview.height !== void 0 ? {
				width: image.preview.width,
				height: image.preview.height
			} : void 0;
		}
		/**
		* Compact history renderer with retryable loading and click-to-open original
		* preview. A lone image renders at its `singleFit` size; an image among
		* several renders as a fixed 64px square tile. The preview arm displays its
		* local URL directly — no loader round-trip, no failure/retry surface.
		* List thumbnails use status icons with localized tooltips and accessible names.
		*
		* @param props.image - the durable reference to load, or the local preview to display.
		* @param props.load - Gateway-authorized URL loader for the durable arm.
		* @param props.variant - lone image, cropped gallery tile, or uncropped list thumbnail.
		* @param props.labels - resolved strings (tooltip, loading, retry, lightbox).
		* @returns the bounded thumbnail button, or the retry control on failure.
		*/
		function MessageImage({ image, load, variant, labels, fileDrag, getTriggerProps }) {
			const preview = "preview" in image ? image.preview : void 0;
			const attachment = "attachment" in image ? image.attachment : void 0;
			const [loaded, setLoaded] = (0, react.useState)(() => attachment === void 0 ? null : load.peek?.(attachment) ?? null);
			const [error, setError] = (0, react.useState)(false);
			const [open, setOpen] = (0, react.useState)(false);
			const [attempt, setAttempt] = (0, react.useState)(0);
			const request = (0, react.useCallback)(() => {
				setAttempt((a) => a + 1);
			}, []);
			const close = (0, react.useCallback)(() => {
				setOpen(false);
			}, []);
			const dimensions = (0, react.useMemo)(() => dimensionsOf(image), [image]);
			const fit = (0, react.useMemo)(() => {
				if (variant !== "single") return void 0;
				return dimensions === void 0 ? {
					width: 240,
					height: 240,
					objectPosition: "center"
				} : singleFit(dimensions);
			}, [dimensions, variant]);
			(0, react.useEffect)(() => {
				if (attachment === void 0) return;
				let live = true;
				setError(false);
				setLoaded(load.peek?.(attachment) ?? null);
				load(attachment).then((url) => {
					if (live) setLoaded(url);
				}).catch(() => {
					if (live) setError(true);
				});
				return () => {
					live = false;
				};
			}, [
				attachment,
				load,
				attempt
			]);
			const src = preview?.url ?? loaded;
			const label = ("attachment" in image ? image.label : void 0) ?? preview?.name ?? attachment?.name ?? labels.image;
			const contextMenuProps = getTriggerProps(src === null ? void 0 : {
				kind: "image",
				value: {
					url: src,
					name: label,
					...attachment === void 0 ? {} : { mediaType: attachment.mediaType }
				}
			});
			const loadingThumbnail = variant === "thumbnail" && src === null;
			if (error) return (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: MessageImage_module_css_default.error,
				"data-variant": variant,
				title: variant === "thumbnail" ? labels.loadFailed : void 0,
				"aria-label": variant === "thumbnail" ? labels.loadFailed : void 0,
				onClick: request,
				children: variant === "thumbnail" ? (0, react_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, {})
				}) : labels.loadFailed
			});
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: MessageImage_module_css_default.frame,
				"data-variant": variant,
				style: fit === void 0 ? void 0 : {
					width: fit.width,
					height: fit.height
				},
				title: loadingThumbnail ? labels.loading : labels.open,
				"aria-label": loadingThumbnail ? labels.loading : labels.openNamed(label),
				"aria-busy": loadingThumbnail || void 0,
				...contextMenuProps,
				onClick: () => {
					if (src !== null) setOpen(true);
				},
				children: src === null ? (0, react_jsx_runtime.jsx)("span", {
					className: MessageImage_module_css_default.loading,
					"aria-hidden": loadingThumbnail || void 0,
					children: loadingThumbnail ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLoadingOutlineRegular, { className: MessageImage_module_css_default.spinner }) : labels.loading
				}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DraggableImage, {
					fileDrag,
					src,
					alt: label,
					name: preview?.name ?? attachment?.name ?? "image",
					style: fit === void 0 ? void 0 : { objectPosition: fit.objectPosition }
				})
			}), open && src !== null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ImageLightbox, {
				src,
				alt: label,
				labels: labels.lightbox,
				onClose: close,
				contextMenuProps
			})] });
		}
		/** Wrapping image group shared by user and assistant history: a lone image
		* renders large unless its owner requests compact tiles or contained list thumbnails. */
		function ImageGallery({ images, load, align, compact = false, thumbnail = false, labels, fileDrag, getTriggerProps }) {
			if (images.length === 0) return null;
			const variant = thumbnail ? "thumbnail" : compact || images.length > 1 ? "tile" : "single";
			return (0, react_jsx_runtime.jsx)("div", {
				className: MessageImage_module_css_default.gallery,
				"data-align": align,
				children: images.map((image, index) => (0, react_jsx_runtime.jsx)(MessageImage, {
					image,
					load,
					variant,
					fileDrag,
					labels,
					getTriggerProps
				}, `${"attachment" in image ? image.attachment.attachmentId : image.preview.url}:${index}`))
			});
		}
