// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/image/ImageBody.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		const IMAGE_MEDIA_TYPES = {
			png: "image/png",
			jpg: "image/jpeg",
			jpeg: "image/jpeg",
			gif: "image/gif",
			webp: "image/webp",
			bmp: "image/bmp",
			ico: "image/x-icon",
			svg: "image/svg+xml"
		};
		/**
		* Resolve a supported filename to the media type assigned to its Blob.
		* @param path - decoded workspace file path.
		* @returns the image media type, or undefined for an unregistered suffix.
		*/
		function imageMediaType(path) {
			const normalized = path.replaceAll("\\", "/");
			const name = normalized.slice(normalized.lastIndexOf("/") + 1).toLowerCase();
			return IMAGE_MEDIA_TYPES[name.slice(name.lastIndexOf(".") + 1)];
		}
		/**
		* Present complete image bytes with fit-width and fixed-scale viewing.
		* @param props - document bytes, resource identity, and locale.
		* @returns a rounded image fitted or scaled at its intrinsic aspect ratio.
		*/
		function ImageBody(props) {
			const { getTriggerProps } = props.useContextMenu();
			const { content, resourceAddress, t } = props;
			const { tab } = props.useTabInfo();
			const preference = props.useStore((state) => state.byTab[tab.id] ?? DEFAULT_ZOOM);
			const path = (0, react.useMemo)(() => hostFileOf(resourceAddress).path, [resourceAddress]);
			const mediaType = imageMediaType(path);
			const data = content.kind === "bytes" ? content.data : void 0;
			const [source, setSource] = (0, react.useState)();
			const setPreference = (0, react.useCallback)((value) => {
				props.actions.zoom(tab.id, value);
			}, [props.actions, tab.id]);
			(0, react.useEffect)(() => {
				props.retainTab(tab.id, tab.signal);
			}, [
				props.retainTab,
				tab.id,
				tab.signal
			]);
			(0, react.useEffect)(() => {
				if (data === void 0 || mediaType === void 0) return;
				let url;
				try {
					const file = new File([data], pathPartsOf(path).name, { type: mediaType });
					url = URL.createObjectURL(file);
					setSource({
						kind: "ready",
						data,
						mediaType,
						url,
						file
					});
				} catch {
					setSource({
						kind: "failed",
						data,
						mediaType
					});
				}
				return () => {
					if (url !== void 0) URL.revokeObjectURL(url);
				};
			}, [
				data,
				mediaType,
				path
			]);
			if (data === void 0 || mediaType === void 0) return (0, react_jsx_runtime.jsx)("p", {
				className: ImageBody_module_css_default.status,
				role: "alert",
				children: t("unsupported")
			});
			if (source?.data !== data || source.mediaType !== mediaType) return (0, react_jsx_runtime.jsx)(LoadingIndicator, { label: t("loading") });
			if (source.kind === "failed") return (0, react_jsx_runtime.jsx)("p", {
				className: ImageBody_module_css_default.status,
				role: "alert",
				children: t("failed")
			});
			const { name } = pathPartsOf(path);
			const labels = {
				controls: t("zoomControls"),
				menu: t("zoomMenu"),
				out: t("zoomOut"),
				into: t("zoomIn"),
				fitWidth: t("zoomFitWidth"),
				value: (percent) => t("zoomValue", { percent })
			};
			return (0, react_jsx_runtime.jsx)(LoadedImage, {
				fileDrag: props.fileDrag,
				contextMenuProps: getTriggerProps({
					kind: "image",
					value: {
						sessionId: props.sessionId,
						path,
						url: source.url,
						mediaType
					}
				}),
				resourceAddress,
				url: source.url,
				name,
				file: source.file,
				preference,
				onPreference: setPreference,
				labels,
				signal: tab.signal,
				scrollportRef: props.scrollportRef,
				t
			}, source.url);
		}
		/** SVG stays in the browser's static image mode because its bytes only reach an img Blob URL. */
		function LoadedImage({ url, name, file, resourceAddress, preference, onPreference, labels, signal, scrollportRef, t, fileDrag, contextMenuProps }) {
			const releasePan = (0, react.useRef)();
			const attachImage = (0, react.useCallback)((image) => {
				releasePan.current?.();
				releasePan.current = image === null ? void 0 : bindImagePan(image);
			}, []);
			const [state, setState] = (0, react.useState)("loading");
			const [width, setWidth] = (0, react.useState)();
			return (0, react_jsx_runtime.jsx)(ZoomViewport, {
				preference,
				intrinsicWidth: width,
				horizontalInset: 24,
				labels,
				signal,
				scrollportRef,
				onPreference,
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: ImageBody_module_css_default.frame,
					"data-image-preview": true,
					children: [
						state === "loading" && (0, react_jsx_runtime.jsx)(LoadingIndicator, { label: t("loading") }),
						state === "failed" && (0, react_jsx_runtime.jsx)("p", {
							className: ImageBody_module_css_default.status,
							role: "alert",
							children: t("failed")
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: `${ImageBody_module_css_default.surface} ${zoomSurfaceClass}`,
							"data-document-zoom-surface": true,
							style: { "--document-zoom-width": `${width ?? 0}px` },
							hidden: state !== "ready",
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DraggableImage, {
								fileDrag,
								...contextMenuProps,
								resourceAddress,
								ref: attachImage,
								className: ImageBody_module_css_default.image,
								src: url,
								alt: t("preview", { name }),
								decoding: "async",
								name,
								original: file,
								referrerPolicy: "no-referrer",
								onLoad: (event) => {
									setWidth(event.currentTarget.naturalWidth);
									setState("ready");
								},
								onError: () => {
									setState("failed");
								}
							})
						})
					]
				})
			});
		}
