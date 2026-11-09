// Extracted from @deepseek-ai/dsh-client-ui-schedule (lib/client.js); region lib/types/client/DeliveryHistory.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Lazy saved delivery pages owned by the selected task's mounted records view. */
/**
* Render one saved prompt clamped to two lines; the toggle appears only while the clamp hides text.
* Width changes re-measure a collapsed prompt; an expanded prompt keeps its toggle until collapsed.
* @param props - Saved prompt text and locale.
* @returns The prompt paragraph and, when its text exceeds two lines, the expand or collapse toggle.
*/
function SavedPrompt({ prompt, t }) {
	const ref = (0, react.useRef)(null);
	const id = (0, react.useId)();
	const [expanded, setExpanded] = (0, react.useState)(false);
	const [clamped, setClamped] = (0, react.useState)(false);
	(0, react.useLayoutEffect)(() => {
		if (expanded) return;
		const paragraph = ref.current;
		const measure = () => {
			setClamped(paragraph.scrollHeight > paragraph.clientHeight);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(paragraph);
		return () => {
			observer.disconnect();
		};
	}, [expanded, prompt]);
	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("p", {
		ref,
		id,
		className: TaskManagerPage_module_css_default.savedPrompt,
		"data-expanded": expanded || void 0,
		children: prompt
	}), clamped && (0, react_jsx_runtime.jsxs)("button", {
		type: "button",
		className: TaskManagerPage_module_css_default.savedPromptToggle,
		"aria-expanded": expanded,
		"aria-controls": id,
		onClick: () => {
			setExpanded((open) => !open);
		},
		children: [t(expanded ? "delivery.collapse" : "delivery.expand"), expanded ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, { size: 14 }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: 14 })]
	})] });
}
/**
* Render immutable saved deliveries; the parent keys this view by task.
* Refreshes supersede pending older pages, and unmount ignores both late outcomes.
* @param props - Task, latest receipt identity, Remote callback, Session links, task zone, and locale.
* @returns Saved records and explicit loading, failure, and pagination actions.
*/
function DeliveryHistory({ id, latestMessageId, timeZone, loadHistory, onOpenSession, sessionTitles, availableSessionIds, t }) {
	const [page, setPage] = (0, react.useState)();
	const [loading, setLoading] = (0, react.useState)(true);
	const [failure, setFailure] = (0, react.useState)();
	const [retentionOpen, setRetentionOpen] = (0, react.useState)(false);
	const retentionId = (0, react.useId)();
	const request = (0, react.useRef)({
		epoch: 0,
		pending: false
	});
	const load = (0, react.useCallback)(async (before) => {
		if (request.current.pending) return;
		request.current.pending = true;
		const epoch = ++request.current.epoch;
		setLoading(true);
		setFailure(void 0);
		let result;
		try {
			result = await loadHistory({
				id,
				limit: 20,
				...before === void 0 ? {} : { before }
			});
		} catch (_error) {
			if (epoch !== request.current.epoch) return;
			request.current.pending = false;
			setLoading(false);
			setFailure({
				key: "delivery.error",
				before
			});
			return;
		}
		if (epoch !== request.current.epoch) return;
		request.current.pending = false;
		setLoading(false);
		if (!result.ok) setFailure({
			key: "delivery.error",
			before
		});
		else if ("code" in result.value) setFailure({
			key: result.value.code === "schedule_not_found" ? "delivery.notFound" : "delivery.cursorError",
			before: void 0
		});
		else {
			const next = result.value;
			setPage((previous) => {
				if (before === void 0 || previous === void 0) return next;
				const seen = new Set(previous.records.map((record) => record.messageId));
				const records = [...previous.records];
				for (const record of next.records) if (!seen.has(record.messageId)) {
					seen.add(record.messageId);
					records.push(record);
				}
				return {
					...next,
					records
				};
			});
		}
	}, [id, loadHistory]);
	(0, react.useEffect)(() => {
		load();
		return () => {
			request.current.epoch++;
			request.current.pending = false;
		};
	}, [load, latestMessageId]);
	const formatOccurrence = (value) => formatScheduleNextRun(value, t("time.locale"), timeZone);
	const hasRecords = page !== void 0 && page.records.length > 0;
	return (0, react_jsx_runtime.jsxs)("div", {
		className: TaskManagerPage_module_css_default.deliveryHistory,
		"aria-busy": loading,
		children: [(0, react_jsx_runtime.jsxs)("div", {
			className: TaskManagerPage_module_css_default.detailScroll,
			children: [
				loading && !hasRecords && (0, react_jsx_runtime.jsx)("div", {
					className: TaskManagerPage_module_css_default.empty,
					role: "status",
					"aria-label": t("delivery.loading"),
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" })
				}),
				failure !== void 0 && (hasRecords ? (0, react_jsx_runtime.jsxs)("div", {
					className: TaskManagerPage_module_css_default.notice,
					children: [(0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						children: t(failure.key)
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "outline",
						size: "sm",
						onClick: () => {
							load(failure.before);
						},
						children: t(failure.key === "delivery.cursorError" ? "delivery.refresh" : "delivery.retry")
					})]
				}) : (0, react_jsx_runtime.jsxs)("div", {
					className: TaskManagerPage_module_css_default.empty,
					children: [
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {
							size: 24,
							className: TaskManagerPage_module_css_default.emptyGlyph
						}),
						(0, react_jsx_runtime.jsx)("p", {
							role: "alert",
							className: TaskManagerPage_module_css_default.emptyTitle,
							children: t(failure.key)
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							className: TaskManagerPage_module_css_default.emptyAction,
							onClick: () => {
								load(failure.before);
							},
							children: t(failure.key === "delivery.cursorError" ? "delivery.refresh" : "delivery.retry")
						})
					]
				})),
				!loading && failure === void 0 && page?.records.length === 0 && (0, react_jsx_runtime.jsxs)("div", {
					className: TaskManagerPage_module_css_default.empty,
					role: "status",
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, {
						size: 24,
						className: TaskManagerPage_module_css_default.emptyGlyph
					}), (0, react_jsx_runtime.jsx)("h3", { children: t("delivery.empty") })]
				}),
				page?.records.map((record) => (0, react_jsx_runtime.jsxs)("section", {
					className: TaskManagerPage_module_css_default.delivery,
					"aria-label": t("delivery.label"),
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, { className: TaskManagerPage_module_css_default.deliveryGlyph }), (0, react_jsx_runtime.jsxs)("div", {
						className: TaskManagerPage_module_css_default.deliveryBody,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: TaskManagerPage_module_css_default.deliveryHead,
							children: [(0, react_jsx_runtime.jsx)("time", {
								className: TaskManagerPage_module_css_default.deliveryTime,
								dateTime: record.scheduledAt,
								children: formatOccurrence(record.scheduledAt)
							}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								size: "sm",
								disabled: !availableSessionIds.includes(record.targetSessionId),
								onClick: () => {
									onOpenSession(record.targetSessionId);
								},
								children: sessionTitles[record.targetSessionId] ?? t("host.openDeliverySession")
							})]
						}), record.prompt !== void 0 && (0, react_jsx_runtime.jsx)(SavedPrompt, {
							prompt: record.prompt,
							t
						})]
					})]
				}, record.messageId)),
				page?.nextBefore !== void 0 && failure === void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					disabled: loading,
					onClick: () => {
						load(page.nextBefore);
					},
					children: t("delivery.loadMore")
				})
			]
		}), hasRecords && page.earlierRecordsPruned && page.nextBefore === void 0 && !loading && failure === void 0 && (0, react_jsx_runtime.jsxs)("footer", {
			className: TaskManagerPage_module_css_default.retentionEnd,
			children: [(0, react_jsx_runtime.jsxs)("div", {
				className: TaskManagerPage_module_css_default.retentionLine,
				children: [(0, react_jsx_runtime.jsx)("span", { children: t("delivery.pruned") }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label: t("delivery.retention"),
					side: "top",
					portal: true,
					children: (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: TaskManagerPage_module_css_default.retentionInfo,
						"aria-label": t("delivery.retention"),
						"aria-expanded": retentionOpen,
						"aria-controls": retentionId,
						onClick: () => {
							setRetentionOpen((open) => !open);
						},
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconInfoOutlineRegular, { size: 14 })
					})
				})]
			}), retentionOpen && (0, react_jsx_runtime.jsxs)("div", {
				id: retentionId,
				className: TaskManagerPage_module_css_default.retentionRule,
				children: [(0, react_jsx_runtime.jsx)("p", { children: t("delivery.retentionBounds", {
					days: page.retention.days,
					records: page.retention.records
				}) }), (0, react_jsx_runtime.jsx)("p", { children: t("delivery.retentionExplanation") })]
			})]
		})]
	});
}
/**
* The text one Workspace is labeled with. A Workspace still carrying the
* automatic first-use title reads as the caller's localized default name; every
* other title reads verbatim in every language. A title the user typed as
* exactly {@link DEFAULT_WORKSPACE_DIRECTORY} is labeled as the default too;
* nothing else depends on the distinction.
* @param title - stored Workspace title.
* @param localizedDefault - the default Workspace name in the active language.
* @returns the title to display.
*/
function workspaceDisplayTitle(title, localizedDefault) {
	return title === "default-workspace" ? localizedDefault : title;
}
