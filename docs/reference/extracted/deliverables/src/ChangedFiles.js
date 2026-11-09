// Extracted from @deepseek-ai/dsh-client-ui-deliverables (lib/client.js); region lib/types/client/ChangedFiles.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Turn changes use a compact single-file card or a header with a folded file list. */
		/** Rows shown before the fold; the design's summary height for a closing message. */
		const COLLAPSED_ROWS = 4;
		const GROUPED$1 = new Intl.NumberFormat("en-US");
		/** Added and deleted line counts in the card's colors. */
		function Counts$1({ added, deleted, t }) {
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
				className: ChangedFiles_module_css_default.added,
				children: t("changes.added", { count: GROUPED$1.format(added) })
			}), (0, react_jsx_runtime.jsx)("span", {
				className: ChangedFiles_module_css_default.deleted,
				children: t("changes.deleted", { count: GROUPED$1.format(deleted) })
			})] });
		}
		/**
		* Render one turn's changed files. The header opens the turn's review in the
		* right Sidebar on its first file. A single file uses only the header; it and
		* multi-file rows preview their comparison after a 500ms hover.
		* @param props - the recorded summary, the review opener, and localized copy.
		* @returns the card.
		*/
		function ChangedFiles({ changes, cwd, openReview, t, sessionId, useChangesDiff, loadChangesDiff }) {
			const cardRef = (0, react.useRef)(null);
			const pathDescriptionId = (0, react.useId)();
			const [expanded, setExpanded] = (0, react.useState)(false);
			const singleFile = changes.total === 1 ? changes.files[0] : void 0;
			const foldable = changes.files.length > COLLAPSED_ROWS;
			const rows = foldable && !expanded ? changes.files.slice(0, COLLAPSED_ROWS) : changes.files;
			const header = (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: ChangedFiles_module_css_default.header,
				"aria-label": singleFile === void 0 ? t("changes.openReview") : t("changes.viewDiff", { name: singleFile.display }),
				"aria-describedby": singleFile === void 0 ? void 0 : pathDescriptionId,
				onClick: () => {
					openReview(0);
				},
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: ChangedFiles_module_css_default.tile,
					children: singleFile === void 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
						kind: "code",
						size: 20
					}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
						path: singleFile.path,
						size: 20
					})
				}), (0, react_jsx_runtime.jsxs)("span", {
					className: ChangedFiles_module_css_default.titles,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: ChangedFiles_module_css_default.title,
						children: singleFile === void 0 ? t("changes.title", { count: String(changes.total) }) : t("changes.singleTitle", { name: basename(singleFile.path) })
					}), (0, react_jsx_runtime.jsxs)("span", {
						className: ChangedFiles_module_css_default.stat,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ChangedFiles_module_css_default.statCounts,
							children: singleFile?.binary === true ? t("changes.binary") : singleFile?.oversized === true ? t("changes.oversized") : (0, react_jsx_runtime.jsx)(Counts$1, {
								t,
								added: changes.added,
								deleted: changes.deleted
							})
						}), (0, react_jsx_runtime.jsx)("span", {
							className: ChangedFiles_module_css_default.previewHint,
							children: t("presented.preview")
						})]
					})]
				})]
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: cardRef,
				className: ChangedFiles_module_css_default.card,
				"data-changed-files": true,
				"data-single": singleFile !== void 0 || void 0,
				children: [
					singleFile === void 0 ? header : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.HoverCard, {
						variant: "preview",
						widthAnchorRef: cardRef,
						openDelayMs: 500,
						anchor: header,
						content: (0, react_jsx_runtime.jsx)(ChangedFilePreview, {
							sessionId,
							seq: changes.seq,
							index: 0,
							display: resolveWorkspacePath(cwd, singleFile.path),
							useChangesDiff,
							loadChangesDiff,
							t
						})
					}), (0, react_jsx_runtime.jsx)("span", {
						id: pathDescriptionId,
						hidden: true,
						children: resolveWorkspacePath(cwd, singleFile.path)
					})] }),
					singleFile === void 0 && (0, react_jsx_runtime.jsx)("ul", {
						className: ChangedFiles_module_css_default.list,
						children: rows.map((file, index) => (0, react_jsx_runtime.jsxs)("li", { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.HoverCard, {
							variant: "preview",
							widthAnchorRef: cardRef,
							openDelayMs: 500,
							content: (0, react_jsx_runtime.jsx)(ChangedFilePreview, {
								sessionId,
								seq: changes.seq,
								index,
								display: resolveWorkspacePath(cwd, file.path),
								useChangesDiff,
								loadChangesDiff,
								t
							}),
							anchor: (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: ChangedFiles_module_css_default.row,
								"aria-label": t("changes.viewDiff", { name: file.display }),
								"aria-describedby": `${pathDescriptionId}-${index}`,
								onClick: () => {
									openReview(index);
								},
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: ChangedFiles_module_css_default.path,
									children: file.display
								}), (0, react_jsx_runtime.jsx)("span", {
									className: ChangedFiles_module_css_default.counts,
									children: file.binary === true ? t("changes.binary") : file.oversized === true ? t("changes.oversized") : (0, react_jsx_runtime.jsx)(Counts$1, {
										t,
										added: file.added,
										deleted: file.deleted
									})
								})]
							})
						}), (0, react_jsx_runtime.jsx)("span", {
							id: `${pathDescriptionId}-${index}`,
							hidden: true,
							children: resolveWorkspacePath(cwd, file.path)
						})] }, file.display))
					}),
					foldable && (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: ChangedFiles_module_css_default.toggle,
						"aria-expanded": expanded,
						"aria-label": t(expanded ? "changes.collapseAria" : "changes.expandAria", { count: String(changes.files.length) }),
						onClick: () => {
							setExpanded((value) => !value);
						},
						children: [(0, react_jsx_runtime.jsx)("span", { children: t(expanded ? "changes.collapse" : "changes.all", { count: String(changes.files.length) }) }), expanded ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})]
					})
				]
			});
		}
		/** Mounted only while its hover card is open, so passing over a row does not read a comparison. */
		function ChangedFilePreview({ sessionId, seq, index, display, useChangesDiff, loadChangesDiff, t }) {
			const state = useChangesDiff((value) => value[changesDiffUrl(sessionId, seq, index)]);
			(0, react.useEffect)(() => {
				if (state === void 0) loadChangesDiff(sessionId, seq, index);
			}, [
				state,
				sessionId,
				seq,
				index,
				loadChangesDiff
			]);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: `${FileDiff_module_css_default.root} ${ChangedFiles_module_css_default.preview}`,
				"data-changes-hover-preview": true,
				children: [(0, react_jsx_runtime.jsx)("div", {
					className: FileDiff_module_css_default.header,
					children: (0, react_jsx_runtime.jsx)("span", {
						className: ChangedFiles_module_css_default.previewPath,
						"data-changes-preview-path": true,
						children: display
					})
				}), (0, react_jsx_runtime.jsx)(FileDiff, {
					state,
					split: false,
					wrap: false,
					t,
					retry: () => {
						loadChangesDiff(sessionId, seq, index);
					}
				})]
			});
		}
