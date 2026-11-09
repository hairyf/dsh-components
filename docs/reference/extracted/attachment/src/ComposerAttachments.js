// Extracted from @deepseek-ai/dsh-client-ui-attachment (lib/client.js); region lib/types/client/ComposerAttachments.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Draft image previews, pending-file cards, drop target, and original-image preview. */
		function ComposerAttachments({ attachments, canAcceptDrop, onAddFiles, onRemoveAttachment, uploads, onRetryFile, uploadFailureText, dropLimits, t, readFileDrag }) {
			const [preview, setPreview] = (0, react.useState)(null);
			const [dragActive, setDragActive] = (0, react.useState)(false);
			const dragDepth = (0, react.useRef)(0);
			const closePreview = (0, react.useCallback)(() => {
				setPreview(null);
			}, []);
			(0, react.useEffect)(() => {
				if (preview !== null && !attachments.some((attachment) => attachment.id === preview.id)) setPreview(null);
			}, [attachments, preview]);
			(0, react.useEffect)(() => {
				return installDocumentDropEvents(canAcceptDrop, onAddFiles, dragDepth, setDragActive, readFileDrag);
			}, [
				canAcceptDrop,
				onAddFiles,
				readFileDrag
			]);
			const railItems = (0, react.useMemo)(() => attachments.map((attachment) => ({
				id: attachment.id,
				attachment
			})), [attachments]);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				dragActive && (0, react_jsx_runtime.jsx)(DropOverlay, {
					disabled: !canAcceptDrop,
					labels: dropOverlayLabels(t, canAcceptDrop, dropLimits)
				}),
				railItems.length > 0 && (0, react_jsx_runtime.jsx)("div", {
					className: ComposerAttachments_module_css_default.rail,
					children: (0, react_jsx_runtime.jsx)(AttachmentRail, {
						items: railItems,
						labels: attachmentRailLabels(t),
						renderItem: (item) => {
							const attachment = item.attachment;
							if (attachment.kind === "file") {
								const upload = uploads[attachment.id];
								return (0, react_jsx_runtime.jsx)(FileCard, {
									name: attachment.file.name || t("file.label"),
									bytes: attachment.file.size,
									state: upload === void 0 || upload.status === "uploading" ? "uploading" : upload.status === "ready" ? "ready" : "error",
									...upload?.status === "uploading" && upload.total !== void 0 && upload.total > 0 ? { progress: upload.loaded / upload.total } : {},
									labels: fileCardLabels(t, attachment.file.name),
									onRemove: () => {
										onRemoveAttachment(attachment.id);
									},
									onRetry: () => {
										onRetryFile(attachment.id);
									}
								});
							}
							const upload = uploads[attachment.id];
							const name = attachment.file.name || t("image.pending");
							const refusal = upload?.status === "error" && upload.reason !== void 0 ? uploadFailureText(upload.reason) : void 0;
							return (0, react_jsx_runtime.jsxs)("div", {
								className: ComposerAttachments_module_css_default.imageItem,
								children: [
									refusal !== void 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
										label: refusal,
										side: "top",
										delayMs: 300,
										portal: true,
										openOnClick: true,
										children: (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: `${ComposerAttachments_module_css_default.thumbnail} ${ComposerAttachments_module_css_default.thumbnailFailed} ${ComposerAttachments_module_css_default.thumbnailRefused}`,
											"aria-label": refusal,
											children: [(0, react_jsx_runtime.jsx)("img", {
												src: attachment.previewUrl,
												alt: ""
											}), (0, react_jsx_runtime.jsx)("span", {
												className: ComposerAttachments_module_css_default.failureGlyph,
												"aria-hidden": true,
												children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, { size: 16 })
											})]
										})
									}) : upload?.status === "error" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
										label: t("file.uploadFailed"),
										side: "top",
										delayMs: 300,
										portal: true,
										children: (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: `${ComposerAttachments_module_css_default.thumbnail} ${ComposerAttachments_module_css_default.thumbnailFailed}`,
											"aria-label": t("file.retry", { name }),
											onClick: () => {
												onRetryFile(attachment.id);
											},
											children: [(0, react_jsx_runtime.jsx)("img", {
												src: attachment.previewUrl,
												alt: ""
											}), (0, react_jsx_runtime.jsx)("span", {
												className: ComposerAttachments_module_css_default.failureGlyph,
												"aria-hidden": true,
												children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, { size: 16 })
											})]
										})
									}) : (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ComposerAttachments_module_css_default.thumbnail,
										title: t("image.openOriginal"),
										"aria-busy": upload?.status === "uploading",
										onClick: () => {
											setPreview(attachment);
										},
										children: (0, react_jsx_runtime.jsx)("img", {
											src: attachment.previewUrl,
											alt: name
										})
									}),
									upload?.status === "uploading" && (0, react_jsx_runtime.jsx)("span", {
										className: ComposerAttachments_module_css_default.progressTrack,
										"aria-hidden": true,
										children: (0, react_jsx_runtime.jsx)("span", {
											className: ComposerAttachments_module_css_default.progressBar,
											style: upload.total === void 0 || upload.total <= 0 ? void 0 : { width: `${String(Math.min(1, upload.loaded / upload.total) * 100)}%` }
										})
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ComposerAttachments_module_css_default.remove,
										"aria-label": t("image.remove", { name }),
										onClick: () => {
											onRemoveAttachment(attachment.id);
										},
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseFillRegular, { size: 12 })
									})
								]
							});
						}
					})
				}),
				preview !== null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ImageLightbox, {
					src: preview.previewUrl,
					alt: preview.file.name || t("image.original"),
					labels: lightboxLabels(t),
					onClose: closePreview
				})
			] });
		}
