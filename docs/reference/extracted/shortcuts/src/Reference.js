// Extracted from @deepseek-ai/dsh-client-ui-shortcuts (lib/client.js); region lib/types/client/Reference.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Searchable editable shortcut reference and its General Settings row. */
		/** Core reference positions are independent of labels and plugin registration order. */
		const coreActionOrder = new Map([
			"shortcuts.open",
			"session.new",
			"sidebar.left.toggle",
			"session.search",
			"workspace.add",
			"session.rename",
			"session.fork",
			"session.archive",
			"settings.open",
			"fontSize.increase",
			"fontSize.decrease",
			"workspace.openLocal",
			"sidebar.right.toggle",
			"workspace.files",
			"browser.new",
			"terminal.new",
			"pane.split",
			"pane.fullscreen.toggle",
			"page.refresh",
			"page.close"
		].map((id, index) => [id, index]));
		/**
		* Render the General Settings action that opens the shortcut reference.
		* @param props - shared dialog action and localized labels.
		* @returns the settings row.
		*/
		function ShortcutsRow({ actions, t, useCatalog }) {
			const shortcut = useCatalog((rows) => rows.find((row) => row.id === "shortcuts.open"));
			return (0, react_jsx_runtime.jsxs)("div", {
				className: Reference_module_css_default.setting,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: Reference_module_css_default.settingText,
					children: [(0, react_jsx_runtime.jsx)("div", {
						className: Reference_module_css_default.settingTitle,
						children: t("settings")
					}), (0, react_jsx_runtime.jsx)("p", {
						className: Reference_module_css_default.settingDescription,
						children: t("description")
					})]
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					disabled: !shortcut?.keys.length,
					label: t("global-hint"),
					shortcutKeys: shortcut?.keys,
					children: (0, react_jsx_runtime.jsx)("button", {
						className: Reference_module_css_default.button,
						type: "button",
						"aria-label": t("view"),
						"aria-keyshortcuts": shortcut?.aria,
						onClick: () => {
							actions.open();
						},
						children: t("view")
					})
				})]
			});
		}
		/**
		* Render core actions in product order, then other commands by ID within each group. Search relevance takes precedence.
		* @param props - root store, effective catalog, and localized copy.
		* @returns the single reference dialog when open.
		*/
		function ShortcutReference({ useStore, actions, useCatalog, useConfig, useFixedCatalog, platform, runtime, edit, recording, describeBinding, t }) {
			const { open, query, focusRequest } = useStore((state) => state);
			const catalog = useCatalog((value) => value);
			const config = useConfig((value) => value);
			const fixedCatalog = useFixedCatalog((value) => value);
			const [target, setTarget] = (0, react.useState)(null);
			const [resetRevision, setResetRevision] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(false);
			const [toast, setToast] = (0, react.useState)(null);
			const mounted = (0, react.useRef)(true);
			const search = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				mounted.current = true;
				return () => {
					mounted.current = false;
				};
			}, []);
			const dismissToast = (0, react.useCallback)(() => {
				setToast(null);
			}, []);
			const notify = (0, react.useCallback)((text, error = false) => {
				setToast((previous) => {
					if (error && previous?.error && previous.text === text) return previous;
					return {
						text,
						error,
						seq: (previous?.seq ?? 0) + 1
					};
				});
			}, []);
			(0, react.useEffect)(() => {
				if (open && config.status === "unreadable") notify(shortcutReadFailure(config, runtime, t), true);
			}, [
				open,
				config,
				runtime,
				notify,
				t
			]);
			const closeEditor = () => {
				setTarget(null);
				const dialog = search.current?.closest("[role=\"dialog\"]");
				/* v8 ignore next -- Editor callbacks run while its reference dialog and search input are mounted. */
				if (dialog != null) (0, _deepseek_ai_dsh_client_ui_primitives.focusWithoutRing)(dialog, { preventScroll: true });
			};
			const closeReference = () => {
				if (busy) return;
				/* v8 ignore next -- The confirmation modal blocks the reference's close control. */
				if (resetRevision !== null) setResetRevision(null);
				else if (target !== null) closeEditor();
				else actions.close();
			};
			(0, react.useEffect)(() => {
				if (!open) setResetRevision(null);
			}, [open]);
			const persist = async (...args) => {
				setBusy(true);
				const result = await edit(...args);
				if (mounted.current) setBusy(false);
				return result;
			};
			const resetAll = async () => {
				/* v8 ignore next -- The reset control is accessible only while its confirmation is open. */
				if (resetRevision === null) return;
				const result = await persist({ type: "reset-all" }, resetRevision);
				if (!mounted.current) return;
				if (result.status === "saved" || result.status === "stale") setResetRevision(null);
				notify(result.status === "saved" ? t("reset-saved") : result.status === "write-failed" ? t("reset-failed") : shortcutFailure(result, catalog, t, runtime), result.status !== "saved");
			};
			const editorProps = {
				useCatalog,
				useConfig,
				useFixedCatalog,
				platform,
				runtime,
				edit: persist,
				recording,
				describeBinding,
				t,
				onClose: closeEditor,
				onSaved: () => {
					notify(t("saved"));
					closeEditor();
				},
				onError: (message) => {
					notify(message, true);
				}
			};
			(0, react.useLayoutEffect)(() => {
				const input = search.current;
				if (open && input !== null && !(0, _deepseek_ai_dsh_client_ui_primitives.isBehindModal)(input)) (0, _deepseek_ai_dsh_client_ui_primitives.focusWithoutRing)(input);
			}, [open, focusRequest]);
			const ranked = (0, _deepseek_ai_dsh_client_ui_primitives.rankByName)([...catalog.map((row) => ({
				...row,
				names: [
					...row.aliases,
					row.keys.filter((key) => key !== "+").join("+"),
					row.keys.filter((key) => key !== "+").join(""),
					row.aria ?? "",
					row.aria?.replace("Meta", "Cmd") ?? ""
				],
				group: "application"
			})), ...fixedCatalog.map((row) => ({
				...row,
				names: [row.id, row.keys.join(" ")]
			}))].sort((left, right) => Number(left.id === "response.stop") - Number(right.id === "response.stop") || (coreActionOrder.get(left.id) ?? coreActionOrder.size) - (coreActionOrder.get(right.id) ?? coreActionOrder.size) || Number(left.id > right.id) - Number(left.id < right.id)).flatMap((row) => row.names.map((name) => ({
				name,
				label: row.label,
				row
			}))), query.trim());
			const matches = [...new Set(ranked.map((match) => match.row))];
			const modifiedCount = Object.keys(config.document.profiles[`${runtime}:${platform}`] ?? {}).length;
			(0, react.useLayoutEffect)(() => {
				const input = search.current;
				if (open && resetRevision === null && modifiedCount === 0 && document.activeElement === document.body && input !== null) (0, _deepseek_ai_dsh_client_ui_primitives.focusWithoutRing)(input);
			}, [
				open,
				resetRevision,
				modifiedCount
			]);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
					open,
					onClose: closeReference,
					title: t("title"),
					headless: true,
					shortcutModal: "shortcuts",
					className: Reference_module_css_default.dialog,
					children: (0, react_jsx_runtime.jsxs)("div", {
						className: Reference_module_css_default.contents,
						onPointerDownCapture: (event) => {
							if (target === null || busy || !(event.target instanceof Element) || event.target.closest("button, input, a, [contenteditable=\"true\"], [role=\"group\"]") !== null) return;
							event.preventDefault();
							closeEditor();
						},
						children: [
							(0, react_jsx_runtime.jsxs)("header", {
								className: Reference_module_css_default.header,
								children: [(0, react_jsx_runtime.jsx)("h2", {
									className: Reference_module_css_default.title,
									children: t("title")
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: Reference_module_css_default.close,
									"aria-label": t("close"),
									disabled: busy,
									onClick: closeReference,
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 14 })
								})]
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: Reference_module_css_default.searchRow,
								children: (0, react_jsx_runtime.jsxs)("div", {
									className: Reference_module_css_default.searchField,
									role: "search",
									"aria-label": t("search"),
									children: [
										(0, react_jsx_runtime.jsxs)("svg", {
											className: Reference_module_css_default.searchIcon,
											width: "14",
											height: "14",
											viewBox: "0 0 14 14",
											fill: "none",
											"aria-hidden": "true",
											children: [(0, react_jsx_runtime.jsx)("path", {
												d: "M10.28 5.86536C10.28 3.41381 8.29245 1.42644 5.84094 1.42627C3.38929 1.42627 1.40186 3.4137 1.40186 5.86536C1.40203 8.31686 3.38939 10.3044 5.84094 10.3044C8.29234 10.3043 10.2799 8.31676 10.28 5.86536ZM11.4174 5.86536C11.4172 8.94498 8.92057 11.4416 5.84094 11.4418C2.76117 11.4418 0.263843 8.94509 0.263672 5.86536C0.263672 2.78548 2.76106 0.288086 5.84094 0.288086C8.92067 0.288258 11.4174 2.78559 11.4174 5.86536Z",
												fill: "currentColor"
											}), (0, react_jsx_runtime.jsx)("path", {
												d: "M13.7372 12.9078L12.9323 13.7127L9.9732 10.7536L10.7781 9.94867L13.7372 12.9078Z",
												fill: "currentColor"
											})]
										}),
										(0, react_jsx_runtime.jsx)("input", {
											ref: search,
											"data-modal-autofocus": true,
											className: Reference_module_css_default.search,
											type: "search",
											"aria-label": t("search"),
											placeholder: t("search"),
											value: query,
											onChange: (event) => {
												actions.search(event.target.value);
											}
										}),
										query !== "" && (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: Reference_module_css_default.clearSearch,
											"aria-label": t("clear-search"),
											onClick: () => {
												actions.search("");
												search.current?.focus();
											},
											children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 10 })
										})
									]
								})
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: Reference_module_css_default.list,
								"aria-busy": config.status === "loading",
								children: [[
									"application",
									"input",
									"menus",
									"approval"
								].map((group) => {
									const rows = matches.filter((row) => row.group === group);
									if (rows.length === 0) return null;
									return (0, react_jsx_runtime.jsxs)("section", {
										"aria-label": t(group),
										children: [group !== "application" && (0, react_jsx_runtime.jsx)("h3", {
											className: Reference_module_css_default.group,
											children: t(group)
										}), (0, react_jsx_runtime.jsx)("ul", {
											className: Reference_module_css_default.rows,
											children: rows.map((row) => (0, react_jsx_runtime.jsxs)("li", {
												className: Reference_module_css_default.row,
												children: [
													"modified" in row && target?.id !== row.id && (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: Reference_module_css_default.rowButton,
														"aria-label": t("edit-label", { command: row.label }),
														disabled: busy || config.status !== "ready",
														onClick: () => {
															setTarget(row);
														}
													}),
													(0, react_jsx_runtime.jsx)("span", {
														className: Reference_module_css_default.commandLabel,
														children: row.label
													}),
													(0, react_jsx_runtime.jsx)("span", {
														className: Reference_module_css_default.binding,
														children: "modified" in row ? target?.id === row.id ? (0, react_jsx_runtime.jsx)(ShortcutEditor, {
															target: row,
															...editorProps
														}, row.id) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
															className: Reference_module_css_default.rowActions,
															children: (0, react_jsx_runtime.jsx)(ShortcutIcon, { kind: "edit" })
														}), row.keys.length === 0 ? (0, react_jsx_runtime.jsx)("span", {
															className: Reference_module_css_default.unbound,
															children: t("unbound")
														}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ShortcutKeys, {
															keys: row.keys,
															className: Reference_module_css_default.keyBadge
														})] }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ShortcutKeys, {
															keys: row.keys,
															className: Reference_module_css_default.fixedKeyBadge
														})
													})
												]
											}, row.id))
										})]
									}, group);
								}), matches.length === 0 && (0, react_jsx_runtime.jsx)("p", {
									className: Reference_module_css_default.hint,
									role: "status",
									children: t("empty")
								})]
							}),
							(0, react_jsx_runtime.jsxs)("footer", {
								className: Reference_module_css_default.footer,
								children: [(0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: Reference_module_css_default.resetAll,
									disabled: busy || config.status !== "ready" || modifiedCount === 0,
									onClick: (event) => {
										event.currentTarget.focus();
										setTarget(null);
										setResetRevision(config.revision);
									},
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, { size: 12 }), t("reset-all")]
								}), modifiedCount > 0 && (0, react_jsx_runtime.jsx)("span", {
									className: Reference_module_css_default.modifiedCount,
									children: t("modified-count", { count: modifiedCount })
								})]
							})
						]
					})
				}),
				(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
					open: open && resetRevision !== null,
					title: t("reset-title"),
					description: t("reset-description"),
					closeLabel: t("close-confirmation"),
					onClose: () => {
						if (!busy) setResetRevision(null);
					},
					footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						"data-modal-autofocus": true,
						disabled: busy,
						onClick: () => {
							setResetRevision(null);
						},
						children: t("cancel")
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						disabled: busy || config.status !== "ready",
						onClick: () => {
							resetAll();
						},
						children: t("reset")
					})] })
				}),
				toast !== null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
					text: toast.text,
					onDone: dismissToast,
					icon: (0, react_jsx_runtime.jsx)(ShortcutIcon, {
						kind: toast.error ? "error" : "success",
						className: toast.error ? Reference_module_css_default.toastError : Reference_module_css_default.toastSuccess
					})
				}, toast.seq)
			] });
		}
