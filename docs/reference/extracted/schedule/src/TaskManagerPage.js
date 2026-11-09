// Extracted from @deepseek-ai/dsh-client-ui-schedule (lib/client.js); region lib/types/client/TaskManagerPage.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Cross-session retained reminders with local search and selection. */
		/**
		* Render retained tasks with manual creation, inline editing, and authoritative deletion.
		* @param props - framework catalog snapshot, localized copy, and action callbacks.
		* @returns the searchable task list beside the selected task's detail.
		*/
		function TaskManagerPage(props) {
			const { useCatalog, onNewTask, onClearEnded, onRetry, onCreateTask, t } = props;
			const [createMenuOpen, setCreateMenuOpen] = (0, react.useState)(false);
			const [manualOpen, setManualOpen] = (0, react.useState)(false);
			const catalog = useCatalog((snapshot) => snapshot);
			const { records, status } = catalog;
			const [search, setSearch] = (0, react.useState)("");
			const [statusFilter, setStatusFilter] = (0, react.useState)("active");
			const [selectedId, setSelectedId] = (0, react.useState)(null);
			const [clearConfirm, setClearConfirm] = (0, react.useState)(false);
			const [clearMenu, setClearMenu] = (0, react.useState)(false);
			const [clearing, setClearing] = (0, react.useState)(false);
			const now = useRelativeClock();
			const detail = useTaskDetail(props, catalog, selectedId ?? void 0);
			const { record: catalogRecord, task: selected, props: { id: detailId, confirmId, onConfirm: setConfirmId, onTabChange: setTab } } = detail;
			const rowRef = (0, react.useRef)(null);
			const createTriggerRef = (0, react.useRef)(null);
			const headingRef = (0, react.useRef)(null);
			const clearTriggerRef = (0, react.useRef)(null);
			const clearFocusPending = (0, react.useRef)(false);
			const clearSettled = (0, react.useRef)(false);
			const confirming = records.find((record) => record.id === confirmId);
			const endedCount = (0, react.useMemo)(() => records.filter((record) => record.status === "ended").length, [records]);
			const rows = (0, react.useMemo)(() => {
				const query = search.trim().toLowerCase();
				return records.filter((record) => (statusFilter === "all" || record.status === statusFilter) && (record.prompt.toLowerCase().includes(query) || (taskSessionId(record) ?? "").toLowerCase().includes(query) || taskName(record).toLowerCase().includes(query))).toSorted((left, right) => Date.parse(taskNextRunAt(left)) - Date.parse(taskNextRunAt(right)));
			}, [
				records,
				search,
				statusFilter
			]);
			const emptyTitle = search.trim() !== "" ? "list.noMatches" : statusFilter === "paused" ? "list.emptyPaused" : statusFilter === "ended" ? "list.emptyInactive" : statusFilter === "active" ? "list.emptyActive" : "list.empty";
			const frequencyZone = {
				system: Intl.DateTimeFormat().resolvedOptions().timeZone,
				label: (zone) => zoneLabel(zone, t)
			};
			(0, react.useEffect)(() => {
				if (selectedId !== null || manualOpen || clearConfirm) return;
				if (rowRef.current !== null) {
					(rowRef.current.isConnected ? rowRef.current : headingRef.current)?.focus();
					rowRef.current = null;
				}
			}, [
				selectedId,
				manualOpen,
				clearConfirm
			]);
			(0, react.useEffect)(() => {
				if (status !== "ready") return;
				if (selectedId !== null && selected === void 0) setSelectedId(null);
				if (confirmId !== null && confirming === void 0) setConfirmId(null);
			}, [
				status,
				selectedId,
				selected,
				confirmId,
				confirming
			]);
			const closeDetails = () => {
				setSelectedId(null);
				setManualOpen(false);
			};
			const createManually = (trigger) => {
				rowRef.current = trigger;
				setSelectedId(null);
				setManualOpen(true);
				setTab("rule");
			};
			(0, react.useEffect)(() => {
				if (clearConfirm) return;
				if (clearFocusPending.current) {
					clearFocusPending.current = false;
					const trigger = clearTriggerRef.current;
					if (trigger?.isConnected === true) {
						trigger.focus();
						return;
					}
					clearSettled.current = false;
					headingRef.current?.focus();
					return;
				}
				if (!clearSettled.current || endedCount > 0 || document.activeElement !== document.body) return;
				clearSettled.current = false;
				headingRef.current?.focus();
			}, [clearConfirm, endedCount]);
			const confirmClearEnded = () => {
				if (clearing) return;
				setClearing(true);
				onClearEnded().finally(() => {
					clearSettled.current = true;
					setClearing(false);
					setClearConfirm(false);
				});
			};
			return (0, react_jsx_runtime.jsxs)("section", {
				className: clsx(TaskManagerPage_module_css_default.page, (selected !== void 0 || manualOpen) && TaskManagerPage_module_css_default.hasDetails),
				"aria-label": t("title"),
				"data-testid": "task-manager-page",
				onKeyDown: (event) => {
					if (event.key !== "Escape" || event.defaultPrevented || confirmId !== null || clearConfirm || selectedId === null && !manualOpen) return;
					event.preventDefault();
					event.stopPropagation();
					closeDetails();
				},
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						className: TaskManagerPage_module_css_default.listPane,
						children: (0, react_jsx_runtime.jsx)("div", {
							className: TaskManagerPage_module_css_default.pageScroll,
							children: (0, react_jsx_runtime.jsxs)("div", {
								className: TaskManagerPage_module_css_default.pageContent,
								children: [
									(0, react_jsx_runtime.jsxs)("div", {
										className: TaskManagerPage_module_css_default.pageHeading,
										children: [(0, react_jsx_runtime.jsx)("h1", {
											ref: headingRef,
											tabIndex: -1,
											children: t("title")
										}), (0, react_jsx_runtime.jsx)("div", {
											className: TaskManagerPage_module_css_default.creationActions,
											children: (0, react_jsx_runtime.jsxs)("span", {
												className: TaskManagerPage_module_css_default.createGroup,
												role: "group",
												"aria-label": t("host.create"),
												children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
													variant: "primary",
													size: "sm",
													className: clsx(TaskManagerPage_module_css_default.headerAction, TaskManagerPage_module_css_default.createPrimary),
													icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 13 }),
													onClick: onNewTask,
													children: t("new.action")
												}), (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
													open: createMenuOpen,
													onClose: () => {
														setCreateMenuOpen(false);
													},
													align: "end",
													portal: true,
													autoFocus: true,
													listClassName: TaskManagerPage_module_css_default.createMenu,
													anchor: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
														ref: createTriggerRef,
														variant: "primary",
														size: "sm",
														className: TaskManagerPage_module_css_default.createMore,
														"aria-label": t("host.createMethod"),
														"aria-haspopup": "menu",
														"aria-expanded": createMenuOpen,
														onClick: () => {
															setCreateMenuOpen((value) => !value);
														},
														children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: 12 })
													}),
													children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
														icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ReferenceIconRegular, {
															kind: "session",
															size: 14
														}),
														onSelect: () => {
															setCreateMenuOpen(false);
															onNewTask();
														},
														children: t("host.chatCreate")
													}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
														icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular, { size: 14 }),
														onSelect: () => {
															setCreateMenuOpen(false);
															createManually(createTriggerRef.current);
														},
														children: t("host.manualCreate")
													})]
												})]
											})
										})]
									}),
									(0, react_jsx_runtime.jsx)("div", {
										className: TaskManagerPage_module_css_default.filters,
										children: (0, react_jsx_runtime.jsx)("div", {
											className: TaskManagerPage_module_css_default.filterTabs,
											role: "group",
											"aria-label": t("statusFilter.label"),
											children: [
												"active",
												"paused",
												"ended",
												"all"
											].map((value) => (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: clsx(TaskManagerPage_module_css_default.filterTab, statusFilter === value && TaskManagerPage_module_css_default.filterTabActive),
												"aria-pressed": statusFilter === value,
												onClick: () => {
													setStatusFilter(value);
												},
												children: t(value === "all" ? "statusFilter.all" : `status.${value}`)
											}, value))
										})
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: TaskManagerPage_module_css_default.searchTools,
										children: [(0, react_jsx_runtime.jsxs)("div", {
											className: TaskManagerPage_module_css_default.searchField,
											children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
												type: "search",
												icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutlineRegular, {}),
												"aria-label": t("search.label"),
												placeholder: t("search.placeholder"),
												value: search,
												onChange: (event) => {
													setSearch(event.target.value);
												}
											}), search !== "" && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
												size: "sm",
												className: TaskManagerPage_module_css_default.searchClear,
												"aria-label": t("search.clear"),
												onClick: () => {
													setSearch("");
												},
												children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, {})
											})]
										}), statusFilter !== "active" && endedCount > 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
											open: clearMenu,
											onClose: () => {
												setClearMenu(false);
											},
											align: "end",
											portal: true,
											items: [{
												id: "clear-inactive",
												label: t(clearing ? "clear.pending" : "clear.action"),
												icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, {}),
												danger: true,
												disabled: clearing || status !== "ready"
											}],
											onSelect: () => {
												setClearMenu(false);
												clearFocusPending.current = true;
												setClearConfirm(true);
											},
											anchor: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
												label: t("list.more"),
												side: "bottom",
												portal: true,
												disabled: clearMenu,
												children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
													ref: clearTriggerRef,
													variant: "outline",
													className: TaskManagerPage_module_css_default.catalogMore,
													"aria-label": t("list.more"),
													"aria-haspopup": "menu",
													"aria-expanded": clearMenu,
													"aria-busy": clearing,
													onClick: () => {
														setClearMenu((value) => !value);
													},
													children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEllipsisOutlineRegular, {})
												})
											})
										})]
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: TaskManagerPage_module_css_default.list,
										children: [
											selected === void 0 && (0, react_jsx_runtime.jsx)(CatalogFeedback, {
												status,
												populated: rows.length > 0,
												onRetry,
												t
											}),
											status === "ready" && rows.length === 0 && (0, react_jsx_runtime.jsxs)("div", {
												className: TaskManagerPage_module_css_default.empty,
												role: "status",
												children: [
													(0, react_jsx_runtime.jsx)(ScheduleEmptyIllustration, { className: TaskManagerPage_module_css_default.emptyIllustration }),
													(0, react_jsx_runtime.jsx)("h2", { children: t(emptyTitle) }),
													(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
														variant: "outline",
														className: TaskManagerPage_module_css_default.emptyAction,
														onClick: (event) => {
															createManually(event.currentTarget);
														},
														children: t("empty.action")
													})
												]
											}),
											(0, react_jsx_runtime.jsx)("ul", {
												className: TaskManagerPage_module_css_default.listRows,
												"aria-label": t("list.label"),
												"aria-busy": status === "loading",
												children: rows.map((record) => {
													const nextRunAt = taskNextRunAt(record);
													const nextRun = nextRunParts(nextRunAt, t("time.locale"), now, t);
													return (0, react_jsx_runtime.jsx)("li", { children: (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
														className: clsx(TaskManagerPage_module_css_default.row, selectedId === record.id && TaskManagerPage_module_css_default.selectedRow, record.status !== "active" && TaskManagerPage_module_css_default.endedRow),
														"aria-label": taskName(record),
														"aria-describedby": `${detailId}-metadata-${record.id}`,
														"aria-expanded": selectedId === record.id,
														"aria-controls": selectedId === record.id ? detailId : void 0,
														onClick: (event) => {
															rowRef.current = event.currentTarget;
															setManualOpen(false);
															setSelectedId(record.id);
															setTab("rule");
														},
														children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, { className: TaskManagerPage_module_css_default.rowGlyph }), (0, react_jsx_runtime.jsxs)("span", {
															className: TaskManagerPage_module_css_default.rowContent,
															children: [(0, react_jsx_runtime.jsx)("span", {
																className: TaskManagerPage_module_css_default.rowTitle,
																children: taskName(record)
															}), (0, react_jsx_runtime.jsxs)("span", {
																className: TaskManagerPage_module_css_default.rowSummary,
																id: `${detailId}-metadata-${record.id}`,
																children: [
																	record.status !== "active" && (0, react_jsx_runtime.jsx)("span", {
																		className: TaskManagerPage_module_css_default.metadata,
																		children: t(`status.${record.status}`)
																	}),
																	(0, react_jsx_runtime.jsx)("span", {
																		className: TaskManagerPage_module_css_default.metadata,
																		children: formatScheduleFrequency(record, t, frequencyZone)
																	}),
																	record.status === "active" && (0, react_jsx_runtime.jsxs)("span", {
																		className: TaskManagerPage_module_css_default.metadata,
																		children: [
																			t("list.nextPrefix"),
																			(0, react_jsx_runtime.jsx)("time", {
																				dateTime: nextRunAt,
																				children: nextRun.absolute
																			}),
																			" ",
																			(0, react_jsx_runtime.jsx)("span", {
																				className: TaskManagerPage_module_css_default.nextRunRelative,
																				children: nextRun.relative
																			})
																		]
																	})
																]
															})]
														})]
													}) }, record.id);
												})
											})
										]
									})
								]
							})
						})
					}),
					manualOpen ? (0, react_jsx_runtime.jsx)(TaskDetail, {
						...detail.props,
						onCreateTask,
						onClose: closeDetails,
						onDeleted: closeDetails,
						onCreated: (task) => {
							setManualOpen(false);
							setSearch("");
							setStatusFilter("all");
							setSelectedId(task.id);
							setTab("rule");
						}
					}) : selected !== void 0 && (0, react_jsx_runtime.jsx)(TaskDetail, {
						...detail.props,
						task: selected,
						authoritative: catalogRecord !== void 0,
						onDeleted: closeDetails,
						onClose: closeDetails
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						className: TaskManagerPage_module_css_default.confirmDialog,
						contentClassName: TaskManagerPage_module_css_default.confirmContent,
						open: clearConfirm,
						title: t("clear.title", { count: endedCount }),
						description: t("clear.description"),
						closeLabel: t("clear.close"),
						onClose: () => {
							if (!clearing) setClearConfirm(false);
						},
						footer: (0, react_jsx_runtime.jsxs)("div", {
							className: TaskManagerPage_module_css_default.confirmActions,
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								disabled: clearing,
								onClick: () => {
									setClearConfirm(false);
								},
								children: t("delete.cancel")
							}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								className: TaskManagerPage_module_css_default.deleteButton,
								"aria-disabled": clearing,
								onClick: confirmClearEnded,
								children: t(clearing ? "clear.pending" : "clear.confirm")
							})]
						})
					})
				]
			});
		}
