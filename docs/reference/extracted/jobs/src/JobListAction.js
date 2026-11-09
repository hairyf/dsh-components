// Extracted from @deepseek-ai/dsh-client-ui-jobs (lib/client.js); region lib/types/client/JobListAction.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Stable empty list so a session with no jobs keeps one array identity. */
		const NO_JOBS = [];
		/** Minimum gap kept between the popover and the viewport edges (the Menu primitive's portal margin). */
		const VIEWPORT_MARGIN = 12;
		/** Distance between the trigger's bottom edge and the popover. */
		const MENU_GAP = 5;
		/** Unplaced list: hidden but laid out so the first placement measures real dimensions. */
		const MEASURE_STYLE = {
			visibility: "hidden",
			left: 0,
			top: 0
		};
		/** Keyboard-reachable controls inside the list, in document order. */
		const FOCUSABLE = "button:not(:disabled), a[href], [tabindex]:not([tabindex=\"-1\"])";
		/** How long an armed kill waits for its confirming press before disarming. */
		const KILL_ARM_MS = 3e3;
		/** How long a failed kill keeps its hint before the button resets. */
		const KILL_FAILED_MS = 4e3;
		function isLive(job) {
			return job.status === "running" || job.status === "stopping";
		}
		/**
		* Whether the row offers an output panel: every live job (its output may
		* still arrive) and a settled one that left retained output behind.
		*/
		function isObservable(job) {
			return isLive(job) || job.output.total > 0;
		}
		/** The one-line qualifier beside the status: live progress while running, the terminal reason once settled. */
		function jobDetail(job) {
			return job.progress ?? job.detail;
		}
		/** Closed-union exhaustiveness fence for the wire status set. */
		/* v8 ignore next 3 -- closed-union backstop; only reached if a status is forged */
		function assertNever(value) {
			throw new Error(`unhandled job status: ${JSON.stringify(value)}`);
		}
		/**
		* Status marker semantics. `stopping` and `killed` share the attention color:
		* both mean the work ended (or is ending) on request rather than on its own.
		*/
		function dotState(status) {
			switch (status) {
				case "running": return "ongoing";
				case "stopping": return "warning";
				case "completed": return "done";
				case "killed": return "warning";
				case "failed": return "error";
				/* v8 ignore next -- closed wire status union */
				default: return assertNever(status);
			}
		}
		function statusLabel(status, t) {
			switch (status) {
				case "running": return t("status.running");
				case "stopping": return t("status.stopping");
				case "completed": return t("status.completed");
				case "killed": return t("status.killed");
				case "failed": return t("status.failed");
				/* v8 ignore next -- closed wire status union */
				default: return assertNever(status);
			}
		}
		/**
		* Elapsed time in at most two adjacent units. A job that outlives an hour is
		* already exceptional, so hours is the widest unit — beyond that the figure
		* stays in hours rather than growing a day/month vocabulary no producer
		* currently reaches.
		*/
		function formatDuration(elapsedMs, t) {
			const total = Math.max(0, Math.floor(elapsedMs / 1e3));
			const seconds = total % 60;
			const minutes = Math.floor(total / 60) % 60;
			const hours = Math.floor(total / 3600);
			if (hours > 0) return t("duration.hours", {
				hours,
				minutes
			});
			if (minutes > 0) return t("duration.minutes", {
				minutes,
				seconds
			});
			return t("duration.seconds", { seconds });
		}
		/** Localized display copy for the embedded terminal panel. */
		function terminalLabels(t) {
			return {
				commandLine: (line) => t("terminal.commandLine", { n: line }),
				/* v8 ignore next */
				signal: (signal) => t("terminal.signal", { signal }),
				/* v8 ignore next */
				exitCode: (code) => t("terminal.exitCode", { code }),
				noExitCode: t("terminal.noExitCode"),
				running: t("terminal.running"),
				failed: t("terminal.failed"),
				done: t("terminal.done"),
				copy: t("terminal.copy"),
				copied: t("terminal.copied"),
				noOutput: t("terminal.noOutput"),
				collapseAria: t("terminal.collapseAria"),
				collapse: t("terminal.collapse"),
				/* v8 ignore next */
				expandAria: (hidden) => t("terminal.expandAria", { n: hidden }),
				/* v8 ignore next */
				expand: (hidden) => t("terminal.expand", { n: hidden })
			};
		}
		/**
		* Live rows first in start order, then settled rows newest-first. Two rows
		* that settled in the same millisecond fall back to start order, so the sort
		* never depends on the host's map iteration.
		*/
		function ordered(jobs) {
			return [...jobs].sort((left, right) => {
				const liveLeft = isLive(left);
				if (liveLeft !== isLive(right)) return liveLeft ? -1 : 1;
				if (liveLeft) return left.startedAt - right.startedAt;
				const finished = (right.finishedAt ?? right.startedAt) - (left.finishedAt ?? left.startedAt);
				return finished !== 0 ? finished : left.startedAt - right.startedAt;
			});
		}
		/** One job row plus, when observable and expanded, its live output panel. */
		function JobItem({ job, view, expanded, now, onToggle, kill, t }) {
			const live = isLive(job);
			const status = statusLabel(job.status, t);
			const detail = jobDetail(job);
			const observable = isObservable(job);
			const labels = (0, react.useMemo)(() => terminalLabels(t), [t]);
			const duration = formatDuration(live ? now - job.startedAt : (job.finishedAt ?? job.startedAt) - job.startedAt, t);
			const durationCell = (0, react_jsx_runtime.jsx)("span", {
				className: JobListAction_module_css_default.duration,
				title: t(live ? "duration.title.live" : "duration.title.done", { duration }),
				children: duration
			});
			const body = live ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
					state: dotState(job.status),
					className: JobListAction_module_css_default.rowDot
				}),
				(0, react_jsx_runtime.jsxs)("span", {
					className: JobListAction_module_css_default.main,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: JobListAction_module_css_default.primary,
						children: (0, react_jsx_runtime.jsx)("span", {
							className: JobListAction_module_css_default.label,
							title: job.label,
							children: job.label
						})
					}), (0, react_jsx_runtime.jsxs)("span", {
						className: JobListAction_module_css_default.secondary,
						title: detail ?? status,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: JobListAction_module_css_default.kind,
								children: job.kind
							}),
							detail !== void 0 ? (0, react_jsx_runtime.jsx)("span", {
								className: JobListAction_module_css_default.status,
								children: detail
							}) : null,
							durationCell
						]
					})]
				}),
				(0, react_jsx_runtime.jsx)("span", {
					className: JobListAction_module_css_default.chevronBox,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
						size: 12,
						className: expanded ? `${JobListAction_module_css_default.chevron} ${JobListAction_module_css_default.chevronOpen}` : JobListAction_module_css_default.chevron
					})
				})
			] }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
					state: dotState(job.status),
					className: JobListAction_module_css_default.rowDot
				}),
				(0, react_jsx_runtime.jsx)("span", {
					className: JobListAction_module_css_default.kind,
					children: job.kind
				}),
				(0, react_jsx_runtime.jsx)("span", {
					className: JobListAction_module_css_default.label,
					title: job.label,
					children: job.label
				}),
				(0, react_jsx_runtime.jsx)("span", {
					className: JobListAction_module_css_default.status,
					title: detail ?? status,
					children: detail ?? status
				}),
				durationCell,
				observable ? (0, react_jsx_runtime.jsx)("span", {
					className: JobListAction_module_css_default.chevronBox,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
						size: 12,
						className: expanded ? `${JobListAction_module_css_default.chevron} ${JobListAction_module_css_default.chevronOpen}` : JobListAction_module_css_default.chevron
					})
				}) : null
			] });
			const killTitle = kill === void 0 ? void 0 : kill.state === "armed" ? t("kill.confirm") : kill.state === "failed" ? t("kill.failed") : t("kill.stop", { label: job.label });
			return (0, react_jsx_runtime.jsxs)("li", {
				className: JobListAction_module_css_default.item,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: live ? `${JobListAction_module_css_default.rowLine} ${JobListAction_module_css_default.rowLineLive}` : JobListAction_module_css_default.rowLine,
					children: [observable ? (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: live ? JobListAction_module_css_default.row : `${JobListAction_module_css_default.row} ${JobListAction_module_css_default.rowSettled}`,
						"aria-expanded": expanded,
						"aria-label": t(expanded ? "row.collapseAria" : "row.expandAria", { label: job.label }),
						onClick: onToggle,
						children: body
					}) : (0, react_jsx_runtime.jsx)("span", {
						className: `${JobListAction_module_css_default.row} ${JobListAction_module_css_default.rowSettled} ${JobListAction_module_css_default.rowStatic}`,
						children: body
					}), kill !== void 0 ? (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: kill.state === "armed" ? `${JobListAction_module_css_default.stop} ${JobListAction_module_css_default.stopArmed}` : kill.state === "failed" ? `${JobListAction_module_css_default.stop} ${JobListAction_module_css_default.stopFailed}` : JobListAction_module_css_default.stop,
						"data-kill-state": kill.state,
						disabled: kill.state === "pending",
						"aria-label": killTitle,
						title: killTitle,
						onClick: kill.onPress,
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconStopFillRegular, { size: 10 }), kill.state === "armed" ? (0, react_jsx_runtime.jsx)("span", {
							className: JobListAction_module_css_default.stopLabel,
							children: t("kill.confirmAction")
						}) : null]
					}) : null]
				}), expanded && view !== void 0 ? (0, react_jsx_runtime.jsxs)("div", {
					className: JobListAction_module_css_default.panel,
					children: [
						view.gapBefore ? (0, react_jsx_runtime.jsx)("div", {
							className: JobListAction_module_css_default.notice,
							children: t("output.gap")
						}) : null,
						view.error !== void 0 ? (0, react_jsx_runtime.jsx)("div", {
							className: `${JobListAction_module_css_default.notice} ${JobListAction_module_css_default.noticeError}`,
							children: t("output.error", { error: view.error })
						}) : null,
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TerminalBlock, {
							command: job.label,
							output: view.text,
							running: live,
							copyText: job.label,
							runStateDot: false,
							maxLines: Number.POSITIVE_INFINITY,
							labels
						})
					]
				}) : null]
			});
		}
		/**
		* Session-header entry point for this session's background jobs. Mounting it
		* keeps the session's roster stream open; it renders nothing at all until the
		* session can see at least one job. Expanding an observable row (a live job,
		* or a settled one with retained output) starts its observation stream, and
		* collapsing (or closing the popover) stops it — output only flows while
		* someone is watching. A running row carries a two-press stop button that
		* requests a human kill through the job controller.
		* @param props - runtime slot currency, the jobs snapshot hook, the roster,
		*   observation, and kill controls, and the namespace translator.
		* @returns the trigger and its popover list, or null when there is nothing to show.
		*/
		function JobListAction({ sessionId, useJobs, watchRows, observe, killJob, t }) {
			const jobs = useJobs((state) => state.rows[sessionId]) ?? NO_JOBS;
			const observedViews = useJobs((state) => state.observed);
			const [open, setOpen] = (0, react.useState)(false);
			const [expandedKey, setExpandedKey] = (0, react.useState)(void 0);
			const [now, setNow] = (0, react.useState)(() => Date.now());
			const [settledOpen, setSettledOpen] = (0, react.useState)(void 0);
			const [clearedKeys, setClearedKeys] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const [killPhase, setKillPhase] = (0, react.useState)(void 0);
			const rootRef = (0, react.useRef)(null);
			const triggerRef = (0, react.useRef)(null);
			const menuRef = (0, react.useRef)(null);
			const rows = (0, react.useMemo)(() => ordered(jobs), [jobs]);
			const liveRows = (0, react.useMemo)(() => rows.filter(isLive), [rows]);
			const settledRows = (0, react.useMemo)(() => rows.filter((job) => !isLive(job) && !clearedKeys.has(String(job.id))), [rows, clearedKeys]);
			const settledExpanded = settledOpen ?? liveRows.length === 0;
			const visibleCount = liveRows.length + settledRows.length;
			const menuPosition = (0, _deepseek_ai_dsh_client_ui_primitives.useAnchoredPosition)({
				open,
				anchorRef: rootRef,
				panelRef: menuRef,
				gap: MENU_GAP,
				margin: VIEWPORT_MARGIN
			});
			(0, _deepseek_ai_dsh_client_ui_primitives.useDismissOnOutsidePointer)(rootRef, open, setOpen, menuRef);
			(0, react.useEffect)(() => watchRows(sessionId), [sessionId, watchRows]);
			(0, react.useEffect)(() => {
				if (!open || liveRows.length === 0) return;
				setNow(Date.now());
				const timer = setInterval(() => {
					setNow(Date.now());
				}, 1e3);
				return () => {
					clearInterval(timer);
				};
			}, [open, liveRows.length]);
			const expandedRow = open && expandedKey !== void 0 ? rows.find((job) => String(job.id) === expandedKey) : void 0;
			const activeJob = expandedRow !== void 0 && isObservable(expandedRow) ? expandedRow.id : void 0;
			(0, react.useEffect)(() => {
				if (activeJob === void 0) return;
				return observe(sessionId, activeJob);
			}, [
				sessionId,
				activeJob,
				observe
			]);
			(0, react.useEffect)(() => {
				if (visibleCount === 0 && open) setOpen(false);
			}, [visibleCount, open]);
			(0, react.useEffect)(() => {
				if (expandedKey !== void 0 && !rows.some((job) => String(job.id) === expandedKey)) setExpandedKey(void 0);
			}, [rows, expandedKey]);
			(0, react.useEffect)(() => {
				if (killPhase === void 0 || killPhase.state === "pending") return;
				const timer = setTimeout(() => {
					setKillPhase(void 0);
				}, killPhase.state === "armed" ? KILL_ARM_MS : KILL_FAILED_MS);
				return () => {
					clearTimeout(timer);
				};
			}, [killPhase]);
			(0, react.useEffect)(() => {
				if (killPhase !== void 0 && !rows.some((job) => String(job.id) === killPhase.key && job.status === "running")) setKillPhase(void 0);
			}, [rows, killPhase]);
			const pressKill = (job) => {
				const key = String(job.id);
				if (killPhase?.key !== key || killPhase.state !== "armed") {
					setKillPhase({
						key,
						state: "armed"
					});
					return;
				}
				setKillPhase({
					key,
					state: "pending"
				});
				killJob(sessionId, key).then((ok) => {
					setKillPhase((current) => current?.key === key && !ok ? {
						key,
						state: "failed"
					} : current);
				});
			};
			if (visibleCount === 0) return null;
			const countLabel = t(liveRows.length > 0 ? liveRows.length === 1 ? "count.live.one" : "count.live.other" : visibleCount === 1 ? "count.idle.one" : "count.idle.other", { count: liveRows.length > 0 ? liveRows.length : visibleCount });
			const clearSettled = () => {
				setClearedKeys((current) => {
					const next = new Set(current);
					for (const job of settledRows) next.add(String(job.id));
					return next;
				});
				if (expandedKey !== void 0 && settledRows.some((job) => String(job.id) === expandedKey)) setExpandedKey(void 0);
			};
			const onKeyDown = (event) => {
				if (!open) return;
				const trigger = triggerRef.current;
				if (event.key === "Escape") {
					event.preventDefault();
					setOpen(false);
					trigger?.focus();
					return;
				}
				const menu = menuRef.current;
				/* v8 ignore next -- both refs are attached while the open list renders. */
				if (event.key !== "Tab" || trigger === null || menu === null) return;
				const focusable = [...menu.querySelectorAll(FOCUSABLE)];
				if (event.target === trigger) {
					if (event.shiftKey) return;
					event.preventDefault();
					focusable[0]?.focus();
				} else if (event.shiftKey ? event.target === focusable[0] : event.target === focusable.at(-1)) {
					if (event.shiftKey) event.preventDefault();
					trigger.focus();
				}
			};
			const item = (job) => (0, react_jsx_runtime.jsx)(JobItem, {
				job,
				view: isObservable(job) ? observedViews[String(job.id)] : void 0,
				expanded: expandedKey === String(job.id),
				now,
				onToggle: () => {
					setExpandedKey((current) => current === String(job.id) ? void 0 : String(job.id));
				},
				...job.status === "running" ? { kill: {
					state: killPhase?.key === String(job.id) ? killPhase.state : "idle",
					onPress: () => {
						pressKill(job);
					}
				} } : {},
				t
			}, String(job.id));
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				onKeyDown,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					ref: triggerRef,
					type: "button",
					className: JobListAction_module_css_default.trigger,
					"aria-expanded": open,
					"aria-label": countLabel,
					onClick: () => {
						setNow(Date.now());
						setOpen((current) => !current);
					},
					children: [
						liveRows.length > 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
							state: "ongoing",
							className: JobListAction_module_css_default.triggerDot
						}) : null,
						(0, react_jsx_runtime.jsx)("span", {
							className: JobListAction_module_css_default.count,
							children: countLabel
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
							size: 12,
							className: open ? JobListAction_module_css_default.triggerOpen : void 0
						})
					]
				}), open ? (0, react_dom.createPortal)((0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuSurface, {
					ref: menuRef,
					className: JobListAction_module_css_default.menu,
					style: menuPosition ?? MEASURE_STYLE,
					children: (0, react_jsx_runtime.jsxs)("ul", {
						className: JobListAction_module_css_default.menuBody,
						"aria-label": t("list.aria"),
						children: [
							liveRows.length > 0 ? (0, react_jsx_runtime.jsx)("li", {
								className: JobListAction_module_css_default.sectionHeader,
								"aria-hidden": "true",
								children: t("section.live")
							}) : null,
							liveRows.map(item),
							settledRows.length > 0 ? (0, react_jsx_runtime.jsxs)("li", {
								className: JobListAction_module_css_default.sectionHeader,
								children: [(0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: JobListAction_module_css_default.sectionToggle,
									"aria-expanded": settledExpanded,
									onClick: () => {
										setSettledOpen(!settledExpanded);
									},
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
										size: 12,
										className: settledExpanded ? `${JobListAction_module_css_default.sectionChevron} ${JobListAction_module_css_default.sectionChevronOpen}` : JobListAction_module_css_default.sectionChevron
									}), t("section.settledCount", { count: settledRows.length })]
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: JobListAction_module_css_default.sectionClear,
									onClick: clearSettled,
									children: t("section.clear")
								})]
							}) : null,
							settledExpanded ? settledRows.map(item) : null
						]
					})
				}), document.body) : null]
			});
		}
