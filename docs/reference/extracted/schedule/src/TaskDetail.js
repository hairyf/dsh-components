// Extracted from @deepseek-ai/dsh-client-ui-schedule (lib/client.js); region lib/types/client/TaskDetail.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** One task's rule, saved deliveries, edits, runs, and linked Session. */
		/**
		* Own selected-task state shared by the Tasks page and task tabs.
		*
		* The shown task comes from the catalog, an unsaved form's CAS baseline, or a
		* confirmed deletion. The view and confirmation reset when selection changes;
		* the entry's store retains unsaved fields by task identity.
		* @param injected - detail actions, localized copy, and framework readers.
		* @param catalog - the owner's authoritative task catalog snapshot.
		* @param taskId - task the owner selected, or undefined when it selected none.
		* @returns the shown task and catalog row, its element id, its confirmation, and the detail props.
		*/
		function useTaskDetail(injected, catalog, taskId) {
			const [retained, setRetained] = (0, react.useState)(null);
			const [tab, setTab] = (0, react.useState)("rule");
			const [confirmId, setConfirmId] = (0, react.useState)(null);
			const id = (0, react.useId)();
			const savedDraft = injected.useStore((state) => taskId === void 0 ? void 0 : state.drafts[`task:${taskId}`]);
			(0, react.useEffect)(() => {
				setRetained(null);
				setTab("rule");
				setConfirmId(null);
			}, [taskId]);
			const record = taskId === void 0 ? void 0 : catalog.records.find((item) => item.id === taskId);
			const edited = record === void 0 && savedDraft?.base !== void 0 && Object.keys(taskDraftPatch(savedDraft.draft, savedDraft.base)).length > 0 ? savedDraft.base : void 0;
			return {
				record,
				task: record ?? edited ?? (retained !== null && retained.id === taskId ? retained : void 0),
				props: {
					...injected,
					status: catalog.status,
					deleting: catalog.deleting,
					id,
					onRetainTask: setRetained,
					tab,
					onTabChange: setTab,
					confirmId,
					onConfirm: setConfirmId
				}
			};
		}
		/**
		* Render one new or existing task's editable rule or saved deliveries.
		* @param props - Task, catalog state, detail view, confirmation, locale, and actions.
		* @returns The detail region and its deletion confirmation dialog.
		*/
		function TaskDetail(props) {
			return (0, react_jsx_runtime.jsx)(TaskDetailView, { ...props }, props.task === void 0 ? "new" : `task:${props.task.id}`);
		}
		function TaskDetailView(props) {
			const { task, id, tab, onTabChange, onClose, onDelete, onConfirm, confirmId, onDeleted, onRetry, onOpenSession, loadHistory, status, deleting, useSessions, useWorkspaces, t, hostActions } = props;
			const sessions = useSessions((snapshot) => snapshot);
			const workspaces = useWorkspaces((snapshot) => snapshot);
			const key = task === void 0 ? "new" : `task:${task.id}`;
			const stored = props.useStore((state) => state.drafts[key]);
			const [seed] = (0, react.useState)(newTaskDraft);
			const initial = stored?.initial ?? seed;
			const changes = (0, react.useMemo)(() => stored?.base === void 0 ? void 0 : taskDraftPatch(stored.draft, stored.base), [stored?.draft, stored?.base]);
			const storedDirty = changes !== void 0 && Object.keys(changes).length > 0;
			const cached = stored?.base !== void 0 && !storedDirty && !stored.pending && stored.failure === void 0 && stored.base.updatedAt !== task?.updatedAt ? void 0 : stored;
			const base = cached?.base ?? task;
			const input = cached?.draft ?? (task === void 0 ? initial : taskDraft(task));
			const projects = projectChoices(workspaces.items, t("host.defaultProject"));
			const draft = task === void 0 && input.cwd === "" ? {
				...input,
				cwd: projects.defaultCwd
			} : input;
			const dirty = base === void 0 ? JSON.stringify(draft) !== JSON.stringify({
				...initial,
				cwd: initial.cwd || projects.defaultCwd
			}) : storedDirty;
			const issue = dirty ? taskDraftIssue(draft, changes) : void 0;
			const valid = issue === void 0;
			const [actionPending, setPending] = (0, react.useState)(false);
			const [actionFailure, setFailure] = (0, react.useState)(null);
			const saving = cached?.pending === true;
			const pending = actionPending || saving;
			const failure = !pending && dirty && base !== void 0 && task !== void 0 && base.updatedAt !== task.updatedAt ? "host.conflict" : actionFailure ?? cached?.failure ?? null;
			const [menuOpen, setMenuOpen] = (0, react.useState)(false);
			const moreRef = (0, react.useRef)(null);
			const panelRef = (0, react.useRef)(null);
			const scrollRef = (0, react.useRef)(null);
			const mounted = (0, react.useRef)(true);
			(0, react.useLayoutEffect)(() => {
				const scroll = scrollRef.current;
				const measure = () => {
					scroll.style.setProperty("--detail-scrollbar-space", `${scroll.offsetWidth - scroll.clientWidth}px`);
				};
				measure();
				const observer = new ResizeObserver(measure);
				observer.observe(scroll);
				return () => {
					observer.disconnect();
				};
			}, [tab]);
			(0, react.useEffect)(() => {
				mounted.current = true;
				panelRef.current?.focus({ preventScroll: true });
				return () => {
					mounted.current = false;
				};
			}, []);
			const floorEndsAt = task?.deliveryFloorEndsAt === void 0 ? void 0 : Date.parse(task.deliveryFloorEndsAt);
			const now = useRelativeClock(RELATIVE_CLOCK_PERIOD_MS, floorEndsAt);
			const deletingTask = task !== void 0 && deleting.includes(task.id);
			const busy = pending || deletingTask || task !== void 0 && status === "loading";
			const executionActive = task?.executionActive === true;
			const deliveryFloor = floorEndsAt !== void 0 && floorEndsAt > now;
			const linkedId = task === void 0 ? void 0 : taskSessionId(task);
			const linkedText = linkedId === void 0 ? "" : sessions.byId[linkedId]?.displayTitle ?? linkedId;
			const linkedState = linkedId === void 0 ? "unavailable" : sessionLinkState(linkedId, sessions, workspaces);
			const targetArchived = task?.target.kind !== "new" && linkedState === "archived";
			const runHeld = busy || dirty || executionActive || targetArchived || !props.authoritative;
			const nextRunAt = task === void 0 ? "" : taskNextRunAt(task);
			const next = task === void 0 ? void 0 : nextRunParts(nextRunAt, t("time.locale"), now, t);
			const choices = sessions.ids.map((value) => ({
				value,
				label: sessions.byId[value].displayTitle
			}));
			const setDraft = (value) => {
				props.actions.setDraft(key, {
					base,
					draft: value,
					...task === void 0 ? { initial } : {},
					...cached?.failure === "host.conflict" ? { failure: cached.failure } : {}
				});
				setFailure(null);
			};
			const reset = () => {
				props.actions.clearDraft(key);
				setFailure(null);
			};
			const save = async () => {
				props.actions.setDraft(key, {
					base,
					draft,
					pending: true,
					...task === void 0 ? { initial } : {}
				});
				setFailure(null);
				const existingBase = base;
				const outcome = task === void 0 ? await props.onCreateTask({
					title: draft.title.trim(),
					prompt: draft.prompt.trim(),
					timing: timingFromDraft(draft, true),
					target: draftTarget(draft)
				}) : await hostActions.edit({
					id: task.id,
					action: "update",
					patch: taskDraftPatch(draft, existingBase, true),
					expectedUpdatedAt: existingBase.updatedAt ?? null
				});
				if (outcome === "saved" || "created" in outcome) {
					props.actions.clearDraft(key);
					if (mounted.current && outcome !== "saved") props.onCreated?.(outcome.created);
					if (mounted.current && outcome === "saved") panelRef.current?.focus({ preventScroll: true });
				} else props.actions.setDraft(key, {
					base,
					draft,
					failure: outcome.failed,
					...task === void 0 ? { initial } : {}
				});
			};
			const setActive = async (task) => {
				setPending(true);
				const outcome = await hostActions.edit({
					id: task.id,
					action: "update",
					patch: { active: task.status !== "active" },
					expectedUpdatedAt: task.updatedAt ?? null
				});
				if (!mounted.current) return;
				setPending(false);
				setFailure(outcome === "saved" ? null : outcome.failed);
			};
			const run = async (id) => {
				setMenuOpen(false);
				setPending(true);
				const outcome = await hostActions.run(id);
				if (!mounted.current) return;
				setPending(false);
				setFailure(outcome === "queued" ? null : outcome.failed);
			};
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("aside", {
				ref: panelRef,
				tabIndex: -1,
				className: TaskManagerPage_module_css_default.detail,
				id,
				"aria-busy": pending || deletingTask,
				"aria-label": t(task === void 0 ? "host.manualCreate" : "detail.label"),
				onKeyDown: (event) => {
					if (pending && event.key === "Escape" && !event.defaultPrevented) {
						event.preventDefault();
						event.stopPropagation();
					}
				},
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: TaskManagerPage_module_css_default.detailTabsBar,
						children: [task === void 0 ? (0, react_jsx_runtime.jsx)("h2", {
							className: TaskManagerPage_module_css_default.createTitle,
							children: t("host.manualCreate")
						}) : (0, react_jsx_runtime.jsx)("div", {
							className: TaskManagerPage_module_css_default.detailTabs,
							role: "tablist",
							"aria-label": t("detail.tabs"),
							children: ["rule", "records"].map((value) => (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								role: "tab",
								id: `${id}-${value}-tab`,
								"aria-controls": `${id}-${value}-panel`,
								tabIndex: tab === value ? 0 : -1,
								"aria-selected": tab === value,
								className: TaskManagerPage_module_css_default.detailTab,
								onKeyDown: (event) => {
									if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
									if (![
										"ArrowLeft",
										"ArrowRight",
										"Home",
										"End"
									].includes(event.key)) return;
									event.preventDefault();
									const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : value === "rule" ? 1 : 0;
									onTabChange(next === 0 ? "rule" : "records");
									const button = event.currentTarget.parentElement?.children[next];
									if (button instanceof HTMLButtonElement) button.focus();
								},
								onClick: () => {
									onTabChange(value);
								},
								children: t(value === "rule" ? "detail.rule" : "detail.records")
							}, value))
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: TaskManagerPage_module_css_default.detailActions,
							children: [task !== void 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
								label: t(task.status === "active" ? "host.pause" : "host.resume"),
								side: "bottom",
								delayMs: 500,
								portal: true,
								children: (0, react_jsx_runtime.jsx)("span", { children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									size: "sm",
									className: TaskManagerPage_module_css_default.detailIconButton,
									disabled: busy || dirty || executionActive || task.status === "ended" || !props.authoritative,
									"aria-label": t(task.status === "active" ? "host.pause" : "host.resume"),
									onClick: () => {
										setActive(task);
									},
									children: task.status === "active" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPauseOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlayOutlineRegular, {})
								}) })
							}), (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
								open: menuOpen,
								onClose: () => {
									setMenuOpen(false);
								},
								align: "end",
								portal: true,
								autoFocus: true,
								anchor: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									ref: moreRef,
									size: "sm",
									className: TaskManagerPage_module_css_default.detailIconButton,
									"aria-label": t("detail.more"),
									"aria-haspopup": "menu",
									"aria-expanded": menuOpen,
									onClick: () => {
										setMenuOpen((value) => !value);
									},
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEllipsisOutlineRegular, {})
								}),
								children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
									disabled: runHeld || deliveryFloor,
									disabledReason: deliveryFloor && !runHeld ? t("host.runAfterInterval", { time: formatAvailableAt(floorEndsAt, t("time.locale"), now) }) : void 0,
									onSelect: () => {
										run(task.id);
									},
									children: t("host.run")
								}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
									disabled: busy || dirty || executionActive || !props.authoritative,
									onSelect: () => {
										moreRef.current?.focus();
										setMenuOpen(false);
										onConfirm(task.id);
									},
									children: t("delete.action")
								})]
							})] }), onClose !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								size: "sm",
								className: TaskManagerPage_module_css_default.detailIconButton,
								"aria-label": t(task === void 0 ? "host.closeCreate" : "detail.close"),
								disabled: pending,
								onClick: onClose,
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, {})
							})]
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						ref: scrollRef,
						className: clsx(TaskManagerPage_module_css_default.detailScroll, tab === "records" && TaskManagerPage_module_css_default.detailRecords),
						role: task === void 0 ? void 0 : "tabpanel",
						id: `${id}-${tab}-panel`,
						"aria-labelledby": task === void 0 ? void 0 : `${id}-${tab}-tab`,
						tabIndex: 0,
						children: [
							(0, react_jsx_runtime.jsx)(CatalogFeedback, {
								status,
								populated: true,
								onRetry,
								t
							}),
							tab === "rule" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								task !== void 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									(0, react_jsx_runtime.jsx)("header", {
										className: TaskManagerPage_module_css_default.detailHeader,
										children: (0, react_jsx_runtime.jsx)("h2", {
											className: TaskManagerPage_module_css_default.readonlyName,
											children: task.title
										})
									}),
									(0, react_jsx_runtime.jsx)("div", {
										className: TaskManagerPage_module_css_default.nextRun,
										children: (0, react_jsx_runtime.jsx)("p", { children: task.status === "active" ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
											t("detail.nextRun"),
											" ",
											(0, react_jsx_runtime.jsx)("time", {
												dateTime: nextRunAt,
												children: next?.absolute
											}),
											" ",
											(0, react_jsx_runtime.jsx)("span", {
												className: TaskManagerPage_module_css_default.nextRunRelative,
												children: next?.relative
											})
										] }) : t(`status.${task.status}`) })
									}),
									linkedId !== void 0 && linkedState !== "available" && task.target.kind === "session" && (0, react_jsx_runtime.jsx)("p", {
										className: TaskManagerPage_module_css_default.detailNotice,
										role: "status",
										children: t(linkedState === "archived" ? "detail.sessionArchived" : linkedState === "loading" ? "detail.sessionLoading" : "detail.sessionUnavailable")
									}),
									executionActive && failure !== "host.executionPending" && (0, react_jsx_runtime.jsx)("p", {
										className: TaskManagerPage_module_css_default.detailNotice,
										role: "status",
										children: t("host.executionActive")
									}),
									dirty && !props.authoritative && status === "ready" && !deletingTask && failure !== "detail.missing" && (0, react_jsx_runtime.jsx)("p", {
										className: TaskManagerPage_module_css_default.detailNotice,
										role: "status",
										children: t("detail.missing")
									})
								] }),
								failure === "host.conflict" ? (0, react_jsx_runtime.jsxs)("div", {
									className: clsx(TaskManagerPage_module_css_default.notice, TaskManagerPage_module_css_default.conflictNotice),
									children: [(0, react_jsx_runtime.jsx)("p", {
										role: "alert",
										children: t(failure)
									}), changes !== void 0 && dirty && task !== void 0 && props.authoritative && status === "ready" && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "outline",
										size: "sm",
										disabled: busy,
										onClick: () => {
											props.actions.setDraft(key, {
												base: task,
												draft: reapplyTaskDraft(draft, task, changes)
											});
											setFailure(null);
											panelRef.current?.focus({ preventScroll: true });
										},
										children: t("host.reapply")
									})]
								}) : failure === "host.executionPending" ? (0, react_jsx_runtime.jsx)("p", {
									className: TaskManagerPage_module_css_default.detailNotice,
									role: "status",
									children: t(failure)
								}) : failure !== null && (0, react_jsx_runtime.jsx)("p", {
									className: TaskManagerPage_module_css_default.saveFailure,
									role: "alert",
									children: t(failure)
								}),
								(0, react_jsx_runtime.jsx)(TaskEditorFields, {
									draft,
									onChange: setDraft,
									disabled: pending || executionActive || deletingTask,
									projects,
									original: base,
									t
								}),
								draft.target === "new" && (0, react_jsx_runtime.jsx)(NewSessionLimit, {
									load: hostActions.loadNewSessionInterval,
									t
								}),
								failure === null && issue !== void 0 && issue !== "incomplete" && (0, react_jsx_runtime.jsx)("p", {
									className: TaskManagerPage_module_css_default.saveFailure,
									role: "status",
									children: t(issue)
								})
							] }),
							tab === "records" && task !== void 0 && (0, react_jsx_runtime.jsx)(DeliveryHistory, {
								id: task.id,
								latestMessageId: task.lastDelivery?.messageId,
								timeZone: recordTimeZone(task),
								loadHistory,
								onOpenSession,
								sessionTitles: Object.fromEntries(choices.map((choice) => [choice.value, choice.label])),
								availableSessionIds: sessions.ids.filter((value) => sessionLinkState(value, sessions, workspaces) === "available"),
								t
							})
						]
					}),
					task !== void 0 && (task.target.kind !== "new" || linkedId !== void 0) && (0, react_jsx_runtime.jsxs)("footer", {
						className: TaskManagerPage_module_css_default.hostSessionFooter,
						children: [(0, react_jsx_runtime.jsx)("span", { children: t(task.target.kind === "new" ? "host.latestConversation" : "detail.session") }), linkedId === void 0 || task.target.kind === "new_once" && linkedState === "unavailable" ? (0, react_jsx_runtime.jsx)("span", {
							className: TaskManagerPage_module_css_default.hostSessionEmpty,
							children: t("host.sessionAfterFirstRun")
						}) : (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							disabled: linkedState !== "available",
							"aria-label": linkedText === linkedId ? t("detail.openSession") : t("detail.openSessionTitle", { title: linkedText }),
							onClick: () => {
								onOpenSession(linkedId);
							},
							children: [linkedText, (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {})]
						})]
					}),
					(tab === "rule" || dirty) && (0, react_jsx_runtime.jsxs)("footer", {
						className: TaskManagerPage_module_css_default.saveFooter,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: TaskManagerPage_module_css_default.saveNotice,
								children: dirty ? t("rule.unsaved") : ""
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								disabled: pending || task !== void 0 && !dirty && failure === null,
								onClick: () => {
									reset();
									if (task === void 0) onClose?.();
								},
								children: t("rule.cancel")
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "primary",
								disabled: busy || !dirty || !valid || failure === "host.conflict" || task !== void 0 && (!props.authoritative || executionActive),
								onClick: () => {
									save();
								},
								children: t(saving ? task === void 0 ? "host.creating" : "rule.saving" : task === void 0 ? "host.create" : "rule.save")
							})
						]
					})
				]
			}), task !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: confirmId === task.id,
				className: TaskManagerPage_module_css_default.confirmDialog,
				contentClassName: TaskManagerPage_module_css_default.confirmContent,
				title: t("delete.title"),
				description: t("delete.description"),
				closeLabel: t("delete.close"),
				onClose: () => {
					onConfirm(null);
				},
				footer: (0, react_jsx_runtime.jsxs)("div", {
					className: TaskManagerPage_module_css_default.confirmActions,
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						"data-modal-autofocus": true,
						onClick: () => {
							onConfirm(null);
						},
						children: t("delete.cancel")
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						disabled: busy,
						onClick: () => {
							onConfirm(null);
							setPending(true);
							props.onRetainTask(task);
							onDelete(task.id).then((outcome) => {
								if (!mounted.current) return;
								setPending(false);
								if (outcome === "deleted") {
									props.actions.clearDraft(key);
									onDeleted();
								} else props.onRetainTask(null);
							});
						},
						children: t("delete.confirm")
					})]
				}),
				children: (0, react_jsx_runtime.jsx)("p", {
					className: TaskManagerPage_module_css_default.confirmPrompt,
					children: task.prompt
				})
			})] });
		}
