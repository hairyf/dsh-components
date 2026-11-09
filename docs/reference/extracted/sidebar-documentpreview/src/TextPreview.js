// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/TextPreview.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The text preview's body: a file's content, or the reason it is not showing.
		*
		* Two sources meet here. The standard `useResource` hook gives the file's
		* metadata — its version — and this type's
		* own store holds the content it read through its face. Metadata changes reload
		* the current preview while automatic refresh is enabled. A failed metadata frame — the file gone, its
		* workspace unknown — takes the same bar's place over the pages already loaded,
		* with the same reload. The type's controls, viewer choice, wrap and reload, sit at the end of
		* the path row; the Sidebar's strip carries none of them.
		*
		* Every state renders inside `PreviewFrame`, which places the workspace
		* navigator and its header toggle from the files Factories, in docked and
		* floating panes. Both render empty when unregistered and stay mounted across
		* loading states. A document layer handling Escape calls `preventDefault()` to
		* keep the navigator from also closing.
		*/
		/**
		* The text type's body, registered under `sidebar.right.pane.tab` as `text`.
		* @param props - composed slot props.
		* @returns the content read so far with its controls, or a progress line.
		*/
		function TextPreview({ useTabInfo, useResource, useStore, actions, loadPage, reloadPages, loadAll, reloadAll, prepareRenderer, useDocumentPreviews, renderSlot, renderFactorySlot, t, addResource, setResources, useContextMenu, sessionId }) {
			const { tab, panel } = useTabInfo();
			const { getTriggerProps } = useContextMenu();
			const { navigation, signal } = tab;
			const meta = useResource(tab.contentId);
			const canRead = meta.status !== "none";
			const file = (0, react.useMemo)(() => hostFileOf(tab.contentId), [tab.contentId]);
			const state = useStore((s) => s.byTab[tab.id]);
			const definitions = useDocumentPreviews((value) => value);
			const unviewable = (0, react.useMemo)(() => unviewableBinaryPath(file.path), [file.path]);
			const candidates = (0, react.useMemo)(() => {
				const matched = matchingDocumentPreviews(definitions, file.path);
				if (matched.length > 0 && binaryDocumentPath(definitions, file.path)) return matched;
				if (matched.length === 0 && unviewable) return matched;
				const fallback = definitions.find((definition) => definition.id === PLAIN_BODY_ID);
				return fallback === void 0 ? matched : [...matched, fallback];
			}, [
				definitions,
				file.path,
				unviewable
			]);
			const selected = candidates.find((candidate) => candidate.id === state?.rendererId) ?? candidates[0];
			const mode = selected?.loading;
			const contentRendererId = mode === "renderer" ? selected?.id : void 0;
			const current = (state?.mode ?? "text-pages") === mode && state?.contentRendererId === contentRendererId ? state : void 0;
			const add = (0, react.useCallback)((address) => {
				addResource(tab.id, address, signal);
			}, [
				addResource,
				tab.id,
				signal
			]);
			const set = (0, react.useCallback)((addresses) => {
				setResources(tab.id, [tab.contentId, ...addresses], signal);
			}, [
				setResources,
				tab.id,
				tab.contentId,
				signal
			]);
			(0, react.useEffect)(() => {
				set([]);
			}, [set, selected?.id]);
			const bodyRef = (0, react.useRef)(null);
			const scrollportRef = (0, react.useRef)(null);
			const storedScrollTopRef = (0, react.useRef)(0);
			const [menuOpen, setMenuOpen] = (0, react.useState)(false);
			const absolutePath = meta.value?.absolutePath ?? current?.complete?.absolutePath;
			const displayPath = absolutePath ?? file.path;
			const fileOwner = absolutePath === void 0 ? void 0 : { absolutePath };
			const line = navigation.params !== void 0 && "line" in navigation.params ? navigation.params.line : void 0;
			const pages = current?.pages;
			const loaded = (0, react.useMemo)(() => loadedPages(pages ?? {}), [pages]);
			const loadedThrough = lastLineLoaded(loaded);
			const hasContent = mode === "renderer" ? current?.version !== void 0 : loaded.length > 0 || current?.complete !== void 0;
			storedScrollTopRef.current = state?.scrollTop ?? 0;
			const bindBody = (0, react.useCallback)((body) => {
				const previous = bodyRef.current;
				bodyRef.current = body;
				if (scrollportRef.current === null || scrollportRef.current === previous) scrollportRef.current = body;
			}, []);
			const bindScrollport = (0, react.useCallback)((scrollport) => {
				const next = scrollport ?? bodyRef.current;
				scrollportRef.current = next;
				if (next !== null) next.scrollTop = storedScrollTopRef.current;
			}, []);
			const started = current !== void 0;
			(0, react.useEffect)(() => {
				if (started || !canRead || mode === void 0 || selected === void 0) return;
				if (mode === "text-pages") loadPage(tab.id, file, 1, signal, meta.value?.version);
				else if (mode === "bytes-complete") loadAll(tab.id, file, signal, meta.value?.version);
				else prepareRenderer(tab.id, signal, selected.id, meta.value?.version);
			}, [
				started,
				tab.id,
				file,
				signal,
				loadPage,
				loadAll,
				prepareRenderer,
				canRead,
				mode,
				selected,
				meta.value?.version
			]);
			(0, react.useEffect)(() => {
				const body = scrollportRef.current;
				if (!hasContent || body === null || state === void 0) return;
				if (mode === "text-pages" && line !== void 0 && current?.revision !== navigation.revision) return;
				body.scrollTop = Math.max(body.scrollTop, state.scrollTop);
				if (mode === "text-pages" && body.scrollTop + 1 < state.scrollTop && current !== void 0 && !current.eof && !current.loading && current.failure === void 0 && canRead) loadPage(tab.id, file, loadedThrough + 1, signal, meta.value?.version);
			}, [
				hasContent,
				selected?.id,
				pages,
				current?.revision
			]);
			(0, react.useEffect)(() => {
				const body = scrollportRef.current;
				if (current === void 0 || body === null || current.revision === navigation.revision) return;
				if (line === void 0 || mode !== "text-pages" || selected?.sourceLines !== true) {
					actions.navigated(tab.id, navigation.revision);
					return;
				}
				if (line > loadedThrough && !current.eof) {
					if (!current.loading && current.failure === void 0 && canRead) loadPage(tab.id, file, loadedThrough + 1, signal, meta.value?.version);
					return;
				}
				const row = scrollToLine(body, line);
				if (row === void 0 && line <= loadedThrough) return;
				if (row !== void 0) markLine(body, row, line);
				actions.navigated(tab.id, navigation.revision);
				actions.scrolled(tab.id, body.scrollTop);
			}, [
				navigation.revision,
				line,
				loadedThrough,
				current?.eof,
				current?.loading,
				current?.failure,
				started,
				selected?.id,
				mode,
				file,
				canRead,
				meta.value?.version
			]);
			const rendererReload = (0, react.useCallback)(() => {
				if (canRead && selected !== void 0) prepareRenderer(tab.id, signal, selected.id, meta.value?.version, true);
			}, [
				canRead,
				prepareRenderer,
				tab.id,
				signal,
				selected?.id,
				meta.value?.version
			]);
			const observedVersion = meta.value?.version;
			const changed = current?.version !== void 0 && observedVersion !== void 0 && observedVersion !== current.version && observedVersion !== current.observedVersion || state?.resourcesDirty === true;
			const reload = (0, react.useCallback)(() => {
				if (!canRead) return;
				if (mode === "text-pages") reloadPages(tab.id, file, signal, observedVersion);
				else if (mode === "bytes-complete") reloadAll(tab.id, file, signal, observedVersion);
				else rendererReload();
			}, [
				canRead,
				mode,
				reloadPages,
				reloadAll,
				rendererReload,
				tab.id,
				file,
				signal,
				observedVersion
			]);
			(0, react.useEffect)(() => tab.actions.bindCommands({ refresh: reload }), [tab.actions, reload]);
			(0, react.useEffect)(() => {
				if (state?.autoRefresh && changed && current !== void 0 && !current.loading && meta.status === "live") reload();
			}, [
				state?.autoRefresh,
				changed,
				current?.loading,
				meta.status,
				reload
			]);
			const content = (0, react.useMemo)(() => {
				if (mode === "renderer") {
					if (current === void 0) return void 0;
					const revision = current.loadRevision;
					return {
						kind: "renderer",
						revision,
						reload: rendererReload,
						failed: () => {
							actions.rendererFailed(tab.id, revision);
						},
						loaded: (version) => {
							actions.rendered(tab.id, revision, version);
						}
					};
				}
				if (mode === "bytes-complete") return current?.complete === void 0 ? void 0 : {
					kind: "bytes",
					data: current.complete.data
				};
				if (current === void 0 || loaded.length === 0) return void 0;
				return {
					kind: "text",
					pages: loaded,
					text: loaded.filter((page) => page.lines > 0).map((page) => page.text).join("\n"),
					eof: current.eof
				};
			}, [
				mode,
				loaded,
				current?.complete,
				current?.eof,
				current?.loadRevision,
				rendererReload,
				actions,
				tab.id
			]);
			const frame = {
				path: displayPath,
				pathTrigger: getTriggerProps({
					kind: "file",
					value: {
						sessionId,
						path: displayPath,
						paneId: panel.id,
						...line === void 0 ? {} : { line }
					}
				}),
				useTabInfo,
				renderFactorySlot
			};
			const handoff = fileOwner !== void 0 && renderSlot("sidebar.right.tab.document.actions", fileOwner);
			if (selected === void 0 && unviewable) {
				const { name: unsupportedName } = pathPartsOf(displayPath);
				return (0, react_jsx_runtime.jsx)(PreviewFrame, {
					...frame,
					handoff,
					"data-textpreview-state": "unsupported",
					"data-textpreview-url": tab.contentId,
					children: (0, react_jsx_runtime.jsx)("div", {
						className: TextPreview_module_css_default.body,
						"data-textpreview-body": true,
						children: (0, react_jsx_runtime.jsxs)("div", {
							className: TextPreview_module_css_default.empty,
							"data-textpreview-unsupported": true,
							children: [
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
									kind: (0, _deepseek_ai_dsh_client_ui_primitives.classifyFileType)(unsupportedName),
									size: 36,
									className: TextPreview_module_css_default.emptyIcon
								}),
								(0, react_jsx_runtime.jsx)("p", {
									className: TextPreview_module_css_default.emptyLine,
									children: t("unsupportedFile")
								}),
								fileOwner !== void 0 && renderSlot("sidebar.right.tab.document.unpreviewable", fileOwner)
							]
						})
					})
				});
			}
			if (state === void 0 || selected === void 0) return (0, react_jsx_runtime.jsx)(PreviewFrame, {
				...frame,
				handoff,
				"data-textpreview-state": "loading",
				children: (0, react_jsx_runtime.jsx)("div", {
					className: TextPreview_module_css_default.status,
					children: meta.status === "none" ? (0, react_jsx_runtime.jsx)("p", {
						className: TextPreview_module_css_default.statusLine,
						children: t("resourceUnavailable")
					}) : (0, react_jsx_runtime.jsx)(LoadingIndicator, { label: t("loading") })
				})
			});
			const next = loadedThrough + 1;
			const { name } = pathPartsOf(displayPath);
			const loadNext = () => {
				if (!canRead || current?.loading || current?.eof) return;
				loadPage(tab.id, file, next, signal, meta.value?.version);
			};
			return (0, react_jsx_runtime.jsx)(PreviewFrame, {
				...frame,
				"data-textpreview-state": "text",
				"data-textpreview-url": tab.contentId,
				"data-document-preview": selected.id,
				banner: meta.failure !== void 0 && hasContent ? (0, react_jsx_runtime.jsxs)("p", {
					className: TextPreview_module_css_default.changed,
					"data-textpreview-meta-failed": meta.failure.code,
					children: [(0, react_jsx_runtime.jsx)("span", { children: failureLine(t, meta.failure) }), (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: TextPreview_module_css_default.action,
						"data-textpreview-reload-now": true,
						onClick: reload,
						children: t("reloadNow")
					})]
				}) : changed && (0, react_jsx_runtime.jsxs)("p", {
					className: TextPreview_module_css_default.changed,
					"data-textpreview-changed": true,
					children: [(0, react_jsx_runtime.jsx)("span", { children: t("changed") }), (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: TextPreview_module_css_default.action,
						"data-textpreview-reload-now": true,
						onClick: reload,
						children: t("reloadNow")
					})]
				}),
				tools: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					candidates.length > 1 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
						open: menuOpen,
						anchor: (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: clsx(TextPreview_module_css_default.tool, TextPreview_module_css_default.viewerTool),
							"aria-label": t("openWith"),
							title: selected.title(),
							"data-document-viewer-menu": true,
							onClick: () => {
								setMenuOpen((value) => !value);
							},
							children: selected.title()
						}),
						items: candidates.map((candidate) => ({
							id: candidate.id,
							label: candidate.title()
						})),
						selectedId: selected.id,
						onSelect: (id) => {
							actions.selected(tab.id, id);
							setMenuOpen(false);
						},
						onClose: () => {
							setMenuOpen(false);
						},
						align: "end",
						portal: true,
						dense: true
					}),
					selected.wrap === true && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
						label: t(state.wrap ? "wrap.disable" : "wrap.enable"),
						side: "bottom",
						delayMs: 500,
						children: (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: TextPreview_module_css_default.tool,
							"aria-pressed": state.wrap,
							"aria-label": t("wrap.aria"),
							"data-textpreview-tool": "wrap",
							onClick: () => {
								actions.toggledWrap(tab.id);
								const body = scrollportRef.current;
								/* v8 ignore next -- callback refs bind the scrollport during commit, before user input. */
								if (body !== null) clearLineMark(body);
							},
							children: state.wrap ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconNowrapFillRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWrapFillRegular, {})
						})
					}),
					content !== void 0 && renderSlot("sidebar.right.tab.document.action", { content }, {
						entryKey: selected.id,
						hookContext: useTabInfo
					}),
					(0, react_jsx_runtime.jsx)("span", {
						hidden: true,
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
							label: t(state.autoRefresh ? "autoRefresh.disable" : "autoRefresh.enable"),
							side: "bottom",
							delayMs: 500,
							children: (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: TextPreview_module_css_default.tool,
								"aria-label": t("autoRefresh"),
								"aria-pressed": state.autoRefresh,
								"data-textpreview-tool": "auto-refresh",
								onClick: () => {
									actions.toggledAutoRefresh(tab.id);
								},
								children: state.autoRefresh ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPauseOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlayOutlineRegular, {})
							})
						})
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
						label: t("reload"),
						shortcutKeys: tab.refreshShortcut?.keys,
						side: "bottom",
						delayMs: 500,
						children: (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: TextPreview_module_css_default.tool,
							"aria-label": t("reload"),
							"data-textpreview-tool": "reload",
							"aria-keyshortcuts": tab.refreshShortcut?.aria,
							onClick: reload,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, {})
						})
					})
				] }),
				handoff,
				children: (0, react_jsx_runtime.jsxs)("div", {
					ref: bindBody,
					className: clsx(TextPreview_module_css_default.body, state.wrap && TextPreview_module_css_default.wrap),
					"data-textpreview-body": true,
					"data-textpreview-wrap": state.wrap ? "" : void 0,
					onScrollCapture: (event) => {
						const body = scrollportRef.current;
						/* v8 ignore next -- callback refs bind the scrollport during commit, before user input. */
						if (body === null) return;
						if (event.target !== body) return;
						if (!(body.scrollTop >= body.scrollHeight - body.clientHeight - 1 && body.scrollTop < state.scrollTop)) actions.scrolled(tab.id, body.scrollTop);
						if (mode === "text-pages" && current?.failure === void 0 && body.clientHeight > 0 && body.scrollTop + body.clientHeight >= body.scrollHeight - 1) loadNext();
					},
					children: [
						mode !== "renderer" && !hasContent && current?.failure === void 0 && (0, react_jsx_runtime.jsx)(LoadingIndicator, { label: t("loading") }),
						content !== void 0 && renderSlot("sidebar.right.tab.document", {
							resourceAddress: tab.contentId,
							content,
							wrap: state.wrap,
							scrollportRef: bindScrollport,
							addResource: add,
							setResources: set
						}, {
							entryKey: selected.id,
							hookContext: useTabInfo,
							fallback: (0, react_jsx_runtime.jsx)("p", {
								className: TextPreview_module_css_default.statusLine,
								children: t("rendererUnavailable", { name: selected.title() })
							})
						}),
						current?.failure !== void 0 && (hasContent ? (0, react_jsx_runtime.jsxs)("p", {
							className: TextPreview_module_css_default.statusLine,
							"data-textpreview-failed": current.failure.code,
							children: [(0, react_jsx_runtime.jsx)("span", { children: failureLine(t, current.failure) }), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: TextPreview_module_css_default.action,
								"data-textpreview-retry": true,
								onClick: loadNext,
								children: t("retry")
							})]
						}) : (0, react_jsx_runtime.jsxs)("div", {
							className: TextPreview_module_css_default.empty,
							"data-textpreview-failed": current.failure.code,
							children: [
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
									kind: (0, _deepseek_ai_dsh_client_ui_primitives.classifyFileType)(name),
									size: 36,
									className: TextPreview_module_css_default.emptyIcon
								}),
								(0, react_jsx_runtime.jsx)("p", {
									className: TextPreview_module_css_default.emptyLine,
									children: failureLine(t, current.failure)
								}),
								emptyFailureRecourse(current.failure) === "open" && fileOwner !== void 0 && renderSlot("sidebar.right.tab.document.unpreviewable", fileOwner),
								emptyFailureRecourse(current.failure) === "retry" && (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: TextPreview_module_css_default.retry,
									"data-textpreview-retry": true,
									onClick: reload,
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, { size: 14 }), t("retry")]
								})
							]
						})),
						mode === "text-pages" && current !== void 0 && loaded.length > 0 && !current.eof && current.failure === void 0 && (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: TextPreview_module_css_default.more,
							disabled: current.loading,
							"data-textpreview-more": true,
							onClick: loadNext,
							children: current.loading ? (0, react_jsx_runtime.jsx)(LoadingIndicator, {
								inline: true,
								label: t("loading")
							}) : t("loadMore")
						})
					]
				})
			});
		}
