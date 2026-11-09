// Extracted from @deepseek-ai/dsh-client-ui-attachment (lib/client.js); region lib/types/FileCard.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** One pending file card: type glyph, name, size or upload status, remove, retry. */
		function FileCard({ name, bytes, state, progress, labels, onRemove, onRetry }) {
			const extension = (0, _deepseek_ai_dsh_client_ui_primitives.fileExtension)(name).toUpperCase().slice(0, 8);
			const meta = state === "uploading" ? labels.uploading : state === "error" ? labels.failed : [extension, (0, _deepseek_ai_dsh_client_ui_primitives.fileSizeText)(bytes)].filter((part) => part !== "").join(" ");
			const retryable = state === "error";
			return (0, react_jsx_runtime.jsxs)("div", {
				className: `${FileCard_module_css_default.card}${retryable ? ` ${FileCard_module_css_default.failed}` : ""}`,
				title: name,
				children: [
					(0, react_jsx_runtime.jsx)("span", {
						className: FileCard_module_css_default.icon,
						"aria-hidden": true,
						children: state === "uploading" ? (0, react_jsx_runtime.jsx)("span", { className: FileCard_module_css_default.spinner }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, { path: name })
					}),
					retryable ? (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `${FileCard_module_css_default.body} ${FileCard_module_css_default.retry}`,
						"aria-label": labels.retry,
						onClick: onRetry,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: FileCard_module_css_default.name,
							children: name
						}), (0, react_jsx_runtime.jsx)("span", {
							className: `${FileCard_module_css_default.meta} ${FileCard_module_css_default.metaFailed}`,
							children: meta
						})]
					}) : (0, react_jsx_runtime.jsxs)("span", {
						className: FileCard_module_css_default.body,
						"aria-label": labels.label,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: FileCard_module_css_default.name,
							children: name
						}), (0, react_jsx_runtime.jsx)("span", {
							className: FileCard_module_css_default.meta,
							children: meta
						})]
					}),
					(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: retryable ? `${FileCard_module_css_default.remove} ${FileCard_module_css_default.removeFailed}` : FileCard_module_css_default.remove,
						"aria-label": labels.remove,
						onClick: onRemove,
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseFillRegular, { size: 12 })
					}),
					state === "uploading" && (0, react_jsx_runtime.jsx)("span", {
						className: FileCard_module_css_default.progressTrack,
						"aria-hidden": true,
						children: (0, react_jsx_runtime.jsx)("span", {
							className: FileCard_module_css_default.progressBar,
							style: progress === void 0 ? void 0 : { width: `${String(Math.min(1, Math.max(0, progress)) * 100)}%` }
						})
					})
				]
			});
		}
