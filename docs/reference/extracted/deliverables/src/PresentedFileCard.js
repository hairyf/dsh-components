// Extracted from @deepseek-ai/dsh-client-ui-deliverables (lib/client.js); region lib/types/client/PresentedFileCard.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		function cardDescription(description, fallback) {
			const trimmed = description?.replace(/\s*(?:\([^()]*\)|（[^（）]*）)\s*$/u, "").trim();
			return trimmed === void 0 || trimmed === "" ? fallback : trimmed;
		}
		/**
		* Render independent file actions without nesting buttons inside a clickable card.
		* @param props - durable file metadata, Sidebar preview, Host capabilities, gesture status, and localized copy.
		* @returns the file card and its anchored action menu.
		*/
		function PresentedFileCard({ file, cwd, phase, host, onPreview, contextMenuProps, actions, t }) {
			const reveal = host?.fileManager ?? "directory";
			const name = basename(file.path);
			const metadata = (0, _deepseek_ai_dsh_client_ui_primitives.fileExtension)(name).toUpperCase() || t("presented.file");
			const status = phase === void 0 ? cardDescription(file.description, metadata) : t(reveal === "directory" && phase === "revealing" ? "presented.directoryOpening" : reveal === "directory" && phase === "revealError" ? "presented.directoryError" : `presented.${phase}`);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: Deliverables_module_css_default.file,
				"data-presented-file": true,
				children: [
					(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: Deliverables_module_css_default.cardPreview,
						title: resolveWorkspacePath(cwd, file.path),
						"aria-label": t("presented.previewCard", { name: file.path }),
						onClick: onPreview,
						...contextMenuProps
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: Deliverables_module_css_default.fileIcon,
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
							path: file.path,
							size: 20
						})
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: Deliverables_module_css_default.fileBody,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: Deliverables_module_css_default.details,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: Deliverables_module_css_default.fileName,
								children: name
							}), (0, react_jsx_runtime.jsxs)("span", {
								className: Deliverables_module_css_default.description,
								"data-presented-description": true,
								role: phase === void 0 ? void 0 : "status",
								"data-error": phase === "error" || phase === "revealError" || phase === "nativeUnavailable" ? true : void 0,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: Deliverables_module_css_default.secondaryText,
									children: status
								}), (0, react_jsx_runtime.jsx)("span", {
									className: Deliverables_module_css_default.previewHint,
									children: t("presented.preview")
								})]
							})]
						}), (0, react_jsx_runtime.jsx)("div", {
							className: Deliverables_module_css_default.actions,
							children: actions
						})]
					})
				]
			});
		}
