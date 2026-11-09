// Extracted from @deepseek-ai/dsh-client-ui-deliverables (lib/client.js); region lib/types/client/ReviewTab.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The review tab: one turn's changed files behind a file selector, with the
		* selected file's turn-start and turn-end comparison drawn unified or side by
		* side, wrapped or scrolling, and controls to open the file itself.
		*/
		const GROUPED = new Intl.NumberFormat("en-US");
		/** The file index a navigation names, when it names one. */
		function navigatedIndex(params) {
			const index = params?.index;
			return typeof index === "number" && Number.isSafeInteger(index) && index >= 0 ? index : void 0;
		}
		/** Added and deleted line counts in the card's colors. */
		function Counts({ file, t }) {
			if (file.binary === true) return (0, react_jsx_runtime.jsx)("span", {
				className: ReviewTab_module_css_default.label,
				children: t("changes.binary")
			});
			if (file.oversized === true) return (0, react_jsx_runtime.jsx)("span", {
				className: ReviewTab_module_css_default.label,
				children: t("changes.oversized")
			});
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
				className: ReviewTab_module_css_default.added,
				children: t("changes.added", { count: GROUPED.format(file.added) })
			}), (0, react_jsx_runtime.jsx)("span", {
				className: ReviewTab_module_css_default.deleted,
				children: t("changes.deleted", { count: GROUPED.format(file.deleted) })
			})] });
		}
		/**
		* The review type's body, registered under `sidebar.right.pane.tab` as `changes-review`.
		* @param props - composed slot props.
		* @returns the selected file's comparison behind the file selector, or the state that stands in for it.
		*/
		function ReviewTab({ useTabInfo, sessionId, useSessions, useStore, actions, useChangesSummary, useChangesDiff, usePresentedOpen, usePresentedHost, loadChangesSummary, loadChangesDiff, reloadPresentedHost, openChanged, t, renderSlot }) {
			const { tab } = useTabInfo();
			const { navigation, signal } = tab;
			const coordinates = (0, react.useMemo)(() => parseChangesReviewAddress(tab.contentId), [tab.contentId]);
			if (coordinates === void 0) throw new Error(`ui-deliverables: not a review address "${tab.contentId}"`);
			const { seq } = coordinates;
			const cwd = useSessions((sessions) => sessions.byId[sessionId]?.cwd);
			const summary = useChangesSummary((value) => value[changesSummaryUrl(sessionId, seq)]);
			const state = useStore((store) => store.byTab[tab.id]);
			const host = usePresentedHost((value) => value);
			(0, react.useEffect)(() => {
				if (state?.navigated === navigation.revision) return;
				actions.navigated(tab.id, navigation.revision, navigatedIndex(navigation.params) ?? state?.index ?? 0);
			}, [
				state,
				navigation.revision,
				navigation.params,
				actions,
				tab.id
			]);
			(0, react.useEffect)(() => {
				const forget = () => {
					actions.forget(tab.id);
				};
				signal.addEventListener("abort", forget, { once: true });
				return () => {
					signal.removeEventListener("abort", forget);
				};
			}, [
				signal,
				actions,
				tab.id
			]);
			(0, react.useEffect)(() => {
				if (summary === void 0) loadChangesSummary(sessionId, seq);
			}, [
				summary,
				sessionId,
				seq,
				loadChangesSummary
			]);
			(0, react.useEffect)(() => {
				if (host === null) reloadPresentedHost();
			}, [host, reloadPresentedHost]);
			const files = typeof summary === "object" ? summary.files : [];
			const index = state !== void 0 && files[state.index] !== void 0 ? state.index : 0;
			const file = files[index];
			const diffState = useChangesDiff((value) => file === void 0 ? void 0 : value[changesDiffUrl(sessionId, seq, index)]);
			(0, react.useEffect)(() => {
				if (file !== void 0 && diffState === void 0) loadChangesDiff(sessionId, seq, index);
			}, [
				file,
				diffState,
				sessionId,
				seq,
				index,
				loadChangesDiff
			]);
			const phase = usePresentedOpen((value) => file === void 0 ? void 0 : value[changedFileUrl(sessionId, seq, index)]);
			const [menuOpen, setMenuOpen] = (0, react.useState)(false);
			const split = state?.split === true;
			const wrap = state?.wrap === true;
			const native = host !== null && host !== "error" && host.available && phase !== "nativeUnavailable";
			const summaryState = summary === void 0 || summary === "loading" ? "loading" : summary === "missing" ? "missing" : "ready";
			return (0, react_jsx_runtime.jsxs)("div", {
				className: `${FileDiff_module_css_default.root} ${ReviewTab_module_css_default.root}`,
				"data-changes-review": true,
				"data-review-state": summaryState,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: FileDiff_module_css_default.header,
						children: [
							file === void 0 ? (0, react_jsx_runtime.jsx)("span", {
								className: ReviewTab_module_css_default.selectorLabel,
								children: t("review.title", { turn: String(coordinates.turn) })
							}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
								className: ReviewTab_module_css_default.selector,
								open: menuOpen,
								autoFocus: true,
								portal: true,
								align: "start",
								dense: true,
								onClose: () => {
									setMenuOpen(false);
								},
								anchor: (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: ReviewTab_module_css_default.selectorButton,
									"aria-haspopup": "menu",
									"aria-expanded": menuOpen,
									"aria-label": t("review.selectFile"),
									title: file.display,
									"data-review-file": file.path,
									onClick: () => {
										setMenuOpen((value) => !value);
									},
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.PathLabel, { path: file.display }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: 12 })]
								}),
								items: files.map((entry, at) => ({
									id: String(at),
									label: (0, react_jsx_runtime.jsxs)("span", {
										className: ReviewTab_module_css_default.item,
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: ReviewTab_module_css_default.itemPath,
											children: entry.display
										}), (0, react_jsx_runtime.jsx)("span", {
											className: ReviewTab_module_css_default.itemCounts,
											children: (0, react_jsx_runtime.jsx)(Counts, {
												file: entry,
												t
											})
										})]
									})
								})),
								selectedId: String(index),
								onSelect: (id) => {
									actions.selected(tab.id, Number(id));
									setMenuOpen(false);
								}
							}),
							file !== void 0 && (0, react_jsx_runtime.jsx)("span", {
								className: ReviewTab_module_css_default.counts,
								children: (0, react_jsx_runtime.jsx)(Counts, {
									file,
									t
								})
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: ReviewTab_module_css_default.tools,
								children: [
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
										label: t(split ? "review.unified" : "review.split"),
										side: "bottom",
										delayMs: 500,
										children: (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: ReviewTab_module_css_default.tool,
											"aria-pressed": split,
											"aria-label": t("review.splitAria"),
											"data-review-tool": "split",
											onClick: () => {
												actions.toggledSplit(tab.id);
											},
											children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCompareSplitOutlineRegular, { className: ReviewTab_module_css_default.compareIcon })
										})
									}),
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
										label: t(wrap ? "review.nowrap" : "review.wrap"),
										side: "bottom",
										delayMs: 500,
										children: (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: ReviewTab_module_css_default.tool,
											"aria-pressed": wrap,
											"aria-label": t("review.wrapAria"),
											"data-review-tool": "wrap",
											onClick: () => {
												actions.toggledWrap(tab.id);
											},
											children: wrap ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconNowrapFillRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWrapFillRegular, {})
										})
									}),
									file !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
										label: t("review.openFile"),
										side: "bottom",
										delayMs: 500,
										children: (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: ReviewTab_module_css_default.tool,
											"aria-label": t("review.openFileAria", { name: file.display }),
											"data-review-tool": "open-file",
											onClick: () => {
												tab.actions.openResource(fileAddressFor(sessionId, cwd, file.path));
											},
											children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconInspectOutlineRegular, {})
										})
									}),
									file !== void 0 && renderSlot("deliverables.review.file.actions", {
										actionUrl: changedFileUrl(sessionId, seq, index),
										available: native,
										pending: phase === "opening" || phase === "revealing",
										onAction: (action, application) => openChanged(sessionId, seq, index, action, application)
									})
								]
							})
						]
					}),
					summaryState === "loading" && (0, react_jsx_runtime.jsx)("p", {
						className: FileDiff_module_css_default.status,
						role: "status",
						children: t("diff.loading")
					}),
					summaryState === "missing" && (0, react_jsx_runtime.jsx)("p", {
						className: FileDiff_module_css_default.status,
						children: t("diff.missing")
					}),
					file !== void 0 && (0, react_jsx_runtime.jsx)(FileDiff, {
						state: diffState,
						split,
						wrap,
						t,
						retry: () => {
							loadChangesDiff(sessionId, seq, index);
						}
					})
				]
			});
		}
