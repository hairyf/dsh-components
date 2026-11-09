// Extracted from @deepseek-ai/dsh-client-ui-schedule (lib/client.js); region lib/types/client/TaskEditorFields.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Label Workspaces as the Workspace list does and select the directory a new destination starts with. */
		function projectChoices(workspaces, defaultName) {
			return {
				items: workspaces.map((workspace) => ({
					value: workspace.path,
					label: workspaceDisplayTitle(workspace.title, defaultName)
				})),
				defaultCwd: (workspaces.find((workspace) => workspace.title === "default-workspace") ?? workspaces[0])?.path ?? ""
			};
		}
		/** Initialize a new task without creating or activating a Session. */
		function newTaskDraft() {
			return {
				...defaultTiming(),
				title: "",
				prompt: "",
				target: "new_once",
				sessionId: "",
				cwd: ""
			};
		}
		/** Seed an edit without normalizing unsupported stored rules. */
		function taskDraft(task) {
			return {
				...timingFromRecord(task),
				title: task.title,
				prompt: task.prompt,
				target: task.target.kind,
				sessionId: task.target.kind === "session" ? task.target.sessionId : "",
				cwd: task.target.kind === "session" ? "" : task.target.create.cwd ?? ""
			};
		}
		/**
		* Validate the form while retaining untouched stored timing.
		* @param draft - Current form values.
		* @param changes - Existing task patch; omitted validates a new timing as well.
		* @returns First correction key, `incomplete` for missing required fields, or undefined when valid.
		*/
		function taskDraftIssue(draft, changes) {
			if (draft.title.trim() === "" || draft.prompt.trim() === "" || draft.target === "session" && draft.sessionId === "") return "incomplete";
			if (draft.title.trim().length > 120) return "rule.invalidTitle";
			if (draft.frequency !== "once" && draft.frequency !== "advanced" && (!/^[1-9]\d*$/.test(draft.interval) || !Number.isSafeInteger(Number(draft.interval)))) return "rule.invalidInterval";
			if (draft.frequency === "weekly" && draft.weekdays.length === 0) return "rule.requiredWeekday";
			if (draft.frequency === "monthly" && (!Number.isInteger(draft.monthDay) || draft.monthDay < 1 || draft.monthDay > 31)) return "rule.invalidMonthDay";
			if (draft.frequency === "daily" && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(draft.dailyTime)) return "rule.invalidTime";
			if (changes !== void 0 && changes.timing === void 0) return void 0;
			const timing = timingFromDraft(draft, true);
			const parsed = timing.kind === "cron" ? Cron.parse(timing.cron.expression, timing.cron.time_zone) : timing.kind === "rrule" ? RRule.parse(timing.rrule, { rejectIneffectiveSetPositions: true }) : void 0;
			if (parsed?.kind !== "rejected") return void 0;
			if (parsed.reason === "time_zone") return "rule.invalidZone";
			if (parsed.reason === "density") return "rule.tooComplex";
			return draft.frequency === "advanced" ? "rule.invalid" : "rule.invalidTime";
		}
		/** Only meaningful field changes enter the CAS edit; untouched timing is never rewritten. */
		function taskDraftPatch(draft, original, intervalFromNow = false) {
			const seeded = taskDraft(original);
			const timingChanged = JSON.stringify(timingFromDraft(draft)) !== JSON.stringify(timingFromDraft(seeded));
			const targetChanged = draft.target !== seeded.target || draft.sessionId !== seeded.sessionId || draft.cwd !== seeded.cwd;
			return {
				...draft.title.trim() === seeded.title.trim() ? {} : { title: draft.title.trim() },
				...draft.prompt.trim() === seeded.prompt.trim() ? {} : { prompt: draft.prompt.trim() },
				...timingChanged ? { timing: timingFromDraft(draft, intervalFromNow) } : {},
				...targetChanged ? { target: draftTarget(draft, original) } : {}
			};
		}
		/** Reapply changed field groups only after the user chooses to review a newer revision. */
		function reapplyTaskDraft(draft, latest, changes) {
			const { title, prompt, target, sessionId, cwd, ...timing } = draft;
			const { title: latestTitle, prompt: latestPrompt, target: latestTarget, sessionId: latestSessionId, cwd: latestCwd, ...latestTiming } = taskDraft(latest);
			return {
				...changes.timing === void 0 ? latestTiming : timing,
				title: changes.title === void 0 ? latestTitle : title,
				prompt: changes.prompt === void 0 ? latestPrompt : prompt,
				...changes.target === void 0 ? {
					target: latestTarget,
					sessionId: latestSessionId,
					cwd: latestCwd
				} : {
					target,
					sessionId,
					cwd
				}
			};
		}
		/** Resolve the explicit destination, preserving an existing preset when the project is unchanged. */
		function draftTarget(draft, original) {
			if (draft.target === "session") return {
				kind: "session",
				sessionId: draft.sessionId
			};
			const previous = original?.target.kind === "session" ? void 0 : original?.target.create;
			const create = {
				...draft.cwd === "" ? {} : { cwd: draft.cwd },
				...(previous?.cwd ?? "") === draft.cwd && previous?.agentPreset !== void 0 ? { agentPreset: previous.agentPreset } : {}
			};
			return {
				kind: draft.target,
				create
			};
		}
		/** Render manual creation and inline edits with the existing task rule controls. */
		function TaskEditorFields({ draft, onChange, projects, disabled, original, t }) {
			const [dateOpen, setDateOpen] = (0, react.useState)(false);
			const [clockOpen, setClockOpen] = (0, react.useState)(false);
			const dateAnchor = (0, react.useRef)(null);
			const clockAnchor = (0, react.useRef)(null);
			const id = (0, react.useId)();
			const rowId = (name) => `${id}-${name}`;
			const change = (patch) => {
				onChange({
					...draft,
					...patch
				});
			};
			const clock = draft.frequency === "daily" ? `${draft.dailyTime}:00` : draft.start.slice(11);
			const frequencyZone = {
				system: Intl.DateTimeFormat().resolvedOptions().timeZone,
				label: (zone) => zoneLabel(zone, t)
			};
			const targetLabel = (target) => t(target === "session" ? "host.currentConversation" : target === "new_once" ? "host.targetNewOnce" : "host.targetNew");
			const currentSessionId = original?.target.kind === "session" ? original.target.sessionId : "";
			const weekdays = draft.frequency === "weekly" && draft.weekdays.length === 5 && [
				1,
				2,
				3,
				4,
				5
			].every((day) => draft.weekdays.includes(day));
			const frequencyItems = [
				{
					id: "weekly",
					label: t("rule.weekly")
				},
				{
					id: "weekdays",
					label: t("rule.weekdays")
				},
				{
					id: "daily",
					label: t("rule.daily")
				},
				{
					id: "hourly",
					label: t("rule.everyHours")
				},
				{
					id: "minutely",
					label: t("rule.everyMinutes")
				},
				{
					id: "monthly",
					label: t("host.frequency.monthly")
				},
				{
					id: "once",
					label: t("rule.once")
				},
				{
					id: "advanced",
					label: t("host.frequency.advanced")
				}
			];
			const frequencyValue = weekdays ? "weekdays" : draft.frequency;
			const workspaceItems = projects.items.map((choice) => ({
				id: choice.value,
				label: (0, react_jsx_runtime.jsxs)("span", {
					className: TaskManagerPage_module_css_default.workspaceMenuItem,
					children: [(0, react_jsx_runtime.jsx)("span", { children: choice.label }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.PathLabel, {
						path: choice.value,
						className: TaskManagerPage_module_css_default.workspaceMenuPath
					})]
				})
			}));
			return (0, react_jsx_runtime.jsxs)("fieldset", {
				disabled,
				className: TaskManagerPage_module_css_default.taskEditor,
				onKeyDownCapture: (event) => {
					if (event.key !== "Escape" || event.defaultPrevented || !dateOpen && !clockOpen) return;
					event.preventDefault();
					event.stopPropagation();
					if (dateOpen) {
						setDateOpen(false);
						dateAnchor.current?.focus();
					} else {
						setClockOpen(false);
						clockAnchor.current?.focus();
					}
				},
				children: [
					(0, react_jsx_runtime.jsxs)("label", {
						className: TaskManagerPage_module_css_default.editorField,
						children: [t("detail.name"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
							value: draft.title,
							maxLength: 120,
							"aria-required": true,
							placeholder: t("detail.namePlaceholder"),
							onChange: (event) => {
								change({ title: event.target.value });
							}
						})]
					}),
					(0, react_jsx_runtime.jsxs)("label", {
						className: TaskManagerPage_module_css_default.editorField,
						children: [t("detail.instruction"), (0, react_jsx_runtime.jsx)("textarea", {
							className: TaskManagerPage_module_css_default.instruction,
							"aria-required": true,
							placeholder: t("detail.instructionPlaceholder"),
							value: draft.prompt,
							onChange: (event) => {
								change({ prompt: event.target.value });
							}
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: TaskManagerPage_module_css_default.ruleRows,
						children: [(0, react_jsx_runtime.jsx)(RuleSelectRow, {
							label: t("host.target"),
							value: draft.target,
							current: targetLabel(draft.target),
							disabled,
							listClassName: TaskManagerPage_module_css_default.targetMenu,
							items: [...currentSessionId === "" ? [] : [{
								id: "session",
								label: targetLabel("session")
							}], ...["new_once", "new"].map((value) => ({
								id: value,
								label: (0, react_jsx_runtime.jsxs)("span", {
									className: TaskManagerPage_module_css_default.targetMenuItem,
									children: [(0, react_jsx_runtime.jsx)("span", { children: targetLabel(value) }), (0, react_jsx_runtime.jsx)("span", {
										className: TaskManagerPage_module_css_default.targetMenuDescription,
										children: t(value === "new_once" ? "host.targetNewOnceHelp" : "host.targetNewHelp")
									})]
								})
							}))],
							onChange: (value) => {
								change({
									target: value,
									sessionId: value === "session" ? currentSessionId : draft.sessionId,
									cwd: value === "session" ? "" : draft.target === "session" ? projects.defaultCwd : draft.cwd
								});
							}
						}), draft.target !== "session" && (0, react_jsx_runtime.jsx)(RuleSelectRow, {
							label: t("host.project"),
							value: draft.cwd,
							disabled,
							current: projects.items.find((choice) => choice.value === draft.cwd)?.label ?? (draft.cwd || t("host.ungrouped")),
							listClassName: TaskManagerPage_module_css_default.workspaceMenu,
							items: workspaceItems.length === 0 ? [{
								id: "",
								label: t("host.ungrouped"),
								disabled: true
							}] : workspaceItems,
							onChange: (cwd) => {
								change({ cwd });
							}
						})]
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: TaskManagerPage_module_css_default.editorField,
						"aria-label": t("rule.title"),
						children: [(0, react_jsx_runtime.jsx)("h3", { children: t("rule.title") }), (0, react_jsx_runtime.jsxs)("div", {
							className: TaskManagerPage_module_css_default.ruleRows,
							children: [
								(0, react_jsx_runtime.jsx)(RuleSelectRow, {
									label: t("rule.repeat"),
									value: frequencyValue,
									disabled,
									items: frequencyItems,
									current: frequencyItems.find((item) => item.id === frequencyValue).label,
									onChange: (value) => {
										const frequency = value === "weekdays" ? "weekly" : value;
										change({
											frequency,
											...value === "weekdays" ? { weekdays: [
												1,
												2,
												3,
												4,
												5
											] } : {},
											...frequency === "advanced" ? { rrule: rruleFromDraft(draft, original === void 0) } : {}
										});
									}
								}),
								draft.frequency !== "once" && draft.frequency !== "advanced" && (0, react_jsx_runtime.jsxs)("div", {
									className: TaskManagerPage_module_css_default.ruleRow,
									children: [(0, react_jsx_runtime.jsx)("label", {
										className: TaskManagerPage_module_css_default.ruleLabel,
										htmlFor: rowId("interval"),
										children: t("host.interval")
									}), (0, react_jsx_runtime.jsx)(RuleStepper, {
										id: rowId("interval"),
										min: 1,
										max: Number.MAX_SAFE_INTEGER,
										value: Number(draft.interval),
										disabled,
										increaseLabel: t("timing.intervalIncrease"),
										decreaseLabel: t("timing.intervalDecrease"),
										onChange: (value) => {
											change({ interval: String(value) });
										}
									})]
								}),
								draft.frequency === "weekly" && (0, react_jsx_runtime.jsx)(RuleWeekdayRow, {
									weekdays: draft.weekdays,
									disabled,
									t,
									rowId,
									onToggle: (day) => {
										change({ weekdays: draft.weekdays.includes(day) ? draft.weekdays.filter((value) => value !== day) : [...draft.weekdays, day].sort() });
									}
								}),
								draft.frequency === "monthly" && (0, react_jsx_runtime.jsxs)("div", {
									className: TaskManagerPage_module_css_default.ruleRow,
									children: [(0, react_jsx_runtime.jsx)("label", {
										className: TaskManagerPage_module_css_default.ruleLabel,
										htmlFor: rowId("monthDay"),
										children: t("host.monthDay")
									}), (0, react_jsx_runtime.jsx)(RuleStepper, {
										id: rowId("monthDay"),
										min: 1,
										max: 31,
										value: draft.monthDay,
										disabled,
										increaseLabel: t("timing.intervalIncrease"),
										decreaseLabel: t("timing.intervalDecrease"),
										onChange: (value) => {
											change({ monthDay: value });
										}
									})]
								}),
								draft.frequency === "once" && (0, react_jsx_runtime.jsxs)("div", {
									className: TaskManagerPage_module_css_default.ruleRow,
									children: [
										(0, react_jsx_runtime.jsx)("label", {
											className: TaskManagerPage_module_css_default.ruleLabel,
											htmlFor: rowId("date"),
											children: t("timing.date")
										}),
										(0, react_jsx_runtime.jsxs)("button", {
											ref: dateAnchor,
											id: rowId("date"),
											type: "button",
											disabled,
											className: clsx(TaskManagerPage_module_css_default.ruleInput, TaskManagerPage_module_css_default.ruleControl, TaskManagerPage_module_css_default.pickerTrigger),
											"aria-label": t("timing.date"),
											"aria-haspopup": "dialog",
											"aria-expanded": dateOpen,
											onClick: () => {
												setDateOpen(true);
											},
											children: [(0, react_jsx_runtime.jsx)("span", { children: draft.start.slice(0, 10).replaceAll("-", "/") }), (0, react_jsx_runtime.jsx)(IconCalendarOutlineRegular, { className: TaskManagerPage_module_css_default.pickerIcon })]
										}),
										(0, react_jsx_runtime.jsx)(DatePicker, {
											open: dateOpen && !disabled,
											anchorRef: dateAnchor,
											value: draft.start.slice(0, 10),
											onPick: (date) => {
												change({ start: `${date}T${clock}` });
												setDateOpen(false);
											},
											onClose: () => {
												setDateOpen(false);
											},
											t
										})
									]
								}),
								draft.frequency !== "advanced" && draft.frequency !== "minutely" && draft.frequency !== "hourly" && (0, react_jsx_runtime.jsxs)("div", {
									className: TaskManagerPage_module_css_default.ruleRow,
									children: [
										(0, react_jsx_runtime.jsx)("label", {
											className: TaskManagerPage_module_css_default.ruleLabel,
											htmlFor: rowId("time"),
											children: t("timing.time")
										}),
										(0, react_jsx_runtime.jsxs)("button", {
											ref: clockAnchor,
											id: rowId("time"),
											type: "button",
											disabled,
											className: clsx(TaskManagerPage_module_css_default.ruleInput, TaskManagerPage_module_css_default.ruleControl, TaskManagerPage_module_css_default.pickerTrigger),
											"aria-label": t("timing.time"),
											"aria-haspopup": "dialog",
											"aria-expanded": clockOpen,
											onClick: () => {
												setClockOpen(true);
											},
											children: [(0, react_jsx_runtime.jsx)("span", { children: clock }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, { className: TaskManagerPage_module_css_default.pickerIcon })]
										}),
										(0, react_jsx_runtime.jsx)(ClockPicker, {
											open: clockOpen && !disabled,
											anchorRef: clockAnchor,
											value: clock,
											seconds: draft.frequency !== "daily",
											onPick: (time) => {
												change(draft.frequency === "daily" ? { dailyTime: time.slice(0, 5) } : { start: `${draft.start.slice(0, 10)}T${time}` });
											},
											onClose: () => {
												setClockOpen(false);
											},
											t
										})
									]
								}),
								(draft.frequency !== "advanced" || draft.rrule.trim() !== "" && !draft.rrule.trimStart().startsWith("DTSTART")) && (0, react_jsx_runtime.jsx)(RuleZoneRow, {
									value: draft.timeZone,
									disabled,
									t,
									onChange: (timeZone) => {
										change({ timeZone });
									}
								})
							]
						})]
					}),
					draft.frequency === "advanced" && (0, react_jsx_runtime.jsxs)("div", {
						className: TaskManagerPage_module_css_default.editorField,
						children: [original !== void 0 && original.kind !== "rrule" && original.kind !== "cron" && draft.rrule === "" && (0, react_jsx_runtime.jsx)("p", { children: formatScheduleFrequency(original, t, frequencyZone) }), (0, react_jsx_runtime.jsxs)("label", {
							className: TaskManagerPage_module_css_default.editorField,
							children: [t("host.customRule"), (0, react_jsx_runtime.jsx)("textarea", {
								className: TaskManagerPage_module_css_default.instruction,
								value: draft.rrule,
								onChange: (event) => {
									change({ rrule: event.target.value });
								}
							})]
						})]
					})
				]
			});
		}
