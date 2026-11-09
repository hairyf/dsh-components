// Extracted from @deepseek-ai/dsh-client-ui-trajectory (lib/client.js); region lib/types/client/TrajectoryTable.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Turn-aware trajectory event ledger with a local record inspector. */
		const BOTTOM_FOLLOW_THRESHOLD_PX = 2;
		const OLDER_LOAD_THRESHOLD_PX = 48;
		const HISTORY_LOAD_ROW_HEIGHT_PX = 30;
		const VIRTUALIZATION_THRESHOLD = 100;
		const VIRTUAL_OVERSCAN_ROWS = 12;
		const VIRTUAL_INITIAL_VIEWPORT_HEIGHT_PX = 600;
		const KIND_LABEL_KEY = {
			system: "kind.system",
			user: "kind.user",
			context: "kind.context",
			compacted: "kind.compacted",
			message: "kind.assistant",
			tool: "kind.tool",
			subtool: "kind.subtool"
		};
		function ToolWrenchIcon() {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: "13",
				height: "13",
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"data-role-icon": "wrench",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", { d: "M14 3.3a3.8 3.8 0 0 1-4.8 4.8l-5.1 5.1a1.6 1.6 0 1 1-2.3-2.3l5.1-5.1A3.8 3.8 0 0 1 11.7 1l-2.3 2.3 2.3 2.3L14 3.3Z" })
			});
		}
		function InformationIcon() {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: "14",
				height: "14",
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.4",
				strokeLinecap: "round",
				"data-role-icon": "information",
				"aria-hidden": "true",
				children: [
					(0, react_jsx_runtime.jsx)("circle", {
						cx: "8",
						cy: "8",
						r: "6.7"
					}),
					(0, react_jsx_runtime.jsx)("circle", {
						cx: "8",
						cy: "5.5",
						r: ".85",
						fill: "currentColor",
						stroke: "none"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M8 7.75v3.4",
						strokeWidth: "1.8"
					})
				]
			});
		}
		function CompactedIcon() {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: "13",
				height: "13",
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"data-role-icon": "compacted",
				"aria-hidden": "true",
				children: [
					(0, react_jsx_runtime.jsx)("path", { d: "m2.5 2.5 3.75 3.75M3 6.25h3.25V3" }),
					(0, react_jsx_runtime.jsx)("path", { d: "m13.5 2.5-3.75 3.75M13 6.25H9.75V3" }),
					(0, react_jsx_runtime.jsx)("path", { d: "m2.5 13.5 3.75-3.75M3 9.75h3.25V13" }),
					(0, react_jsx_runtime.jsx)("path", { d: "m13.5 13.5-3.75-3.75M13 9.75H9.75V13" })
				]
			});
		}
		const KIND_ICON = {
			system: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSettingsOutlineRegular, { size: 13 }),
			user: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconUserOutlineRegular, { size: 13 }),
			context: (0, react_jsx_runtime.jsx)(InformationIcon, {}),
			compacted: (0, react_jsx_runtime.jsx)(CompactedIcon, {}),
			message: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSparkleRegular, { size: 13 }),
			tool: (0, react_jsx_runtime.jsx)(ToolWrenchIcon, {}),
			subtool: (0, react_jsx_runtime.jsx)(ToolWrenchIcon, {})
		};
		const COLLAPSED_SUMMARY_LABEL_KEY = {
			turn: "request.collapsedTurn",
			assistant: "request.collapsedAssistant",
			tool: "request.collapsedTool"
		};
		function useStableVirtualRowStructure(rows) {
			const cache = (0, react.useRef)({
				rows: [],
				structure: []
			});
			if (cache.current.rows === rows) return cache.current.structure;
			const structure = cache.current.structure.length === rows.length && rows.every((row, index) => {
				const previous = cache.current.structure[index];
				return previous?.key === row.key && previous.height === row.height;
			}) ? cache.current.structure : rows.map((row) => ({
				key: row.key,
				height: row.height
			}));
			cache.current = {
				rows,
				structure
			};
			return structure;
		}
		const DETAILS_MIN_WIDTH = 320;
		const DETAILS_MAX_WIDTH = 720;
		const TABLE_MIN_WIDTH = 280;
		const DETAILS_RESIZE_STEP = 16;
		const TOOL_REQUEST_SHARE = .58;
		const TOOL_REQUEST_MIN_WIDTH = 180;
		const TOOL_REQUEST_MAX_WIDTH = 480;
		const DEFAULT_TOOL_REQUEST_SHARE = .36;
		const DEFAULT_TOOL_REQUEST_OFFSET = 56;
		const SYSTEM_PROMPT_TABS = [{
			id: "system-prompt",
			labelKey: "tab.systemPrompt"
		}, {
			id: "tools",
			labelKey: "tab.tools"
		}];
		const SYSTEM_UPDATE_TABS = [{
			id: "diff",
			labelKey: "tab.diff"
		}, ...SYSTEM_PROMPT_TABS];
		const REQUEST_TABS = [
			{
				id: "overview",
				labelKey: "tab.summary"
			},
			{
				id: "options",
				labelKey: "tab.options"
			},
			{
				id: "usage",
				labelKey: "tab.usage"
			},
			{
				id: "timing",
				labelKey: "tab.timing"
			}
		];
		function jsonTreeLabels(t) {
			return {
				copyValue: t("copy.value"),
				copyJson: t("copy.json"),
				copyPath: t("copy.path"),
				copyPrettyJson: t("copy.prettyJson"),
				copyCompactJson: t("copy.compactJson"),
				copied: t("copied"),
				copyFailed: t("copy.failed"),
				collapseNode: t("collapse"),
				expandNode: t("expand"),
				copyButtonTitle: (action) => t("copy.optionsHint", { action })
			};
		}
		function markdownLabels(t) {
			return {
				code: {
					copyLabel: t("copy"),
					copiedLabel: t("copied")
				},
				footnotes: t("markdown.footnotes")
			};
		}
		function clampDetailsWidth(width, splitWidth) {
			const maxWidth = Math.max(DETAILS_MIN_WIDTH, Math.min(DETAILS_MAX_WIDTH, splitWidth - TABLE_MIN_WIDTH));
			return Math.round(Math.min(Math.max(width, DETAILS_MIN_WIDTH), maxWidth));
		}
		function defaultToolRequestWidth(splitWidth) {
			return Math.min(Math.max(splitWidth * DEFAULT_TOOL_REQUEST_SHARE - DEFAULT_TOOL_REQUEST_OFFSET, TOOL_REQUEST_MIN_WIDTH), TOOL_REQUEST_MAX_WIDTH);
		}
		function formatDurationMs(milliseconds, t) {
			if (milliseconds < 1e3) return t("unit.milliseconds", { value: Math.round(milliseconds) });
			return t("unit.seconds", { value: (milliseconds / 1e3).toFixed(milliseconds < 1e4 ? 2 : 1) });
		}
		function formatStartedAt(timestamp, t) {
			if (timestamp === null || !Number.isFinite(timestamp)) return t("timing.notAvailable");
			const date = new Date(timestamp);
			const two = (value) => String(value).padStart(2, "0");
			const three = (value) => String(value).padStart(3, "0");
			const time = `${two(date.getHours())}:${two(date.getMinutes())}:${two(date.getSeconds())}.${three(date.getMilliseconds())}`;
			return `${`${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`} ${time}`;
		}
		/** Whether a click lands on an active text selection and should keep it. */
		function clickSelectsText(target) {
			const selection = window.getSelection();
			return selection !== null && !selection.isCollapsed && selection.rangeCount > 0 && selection.getRangeAt(0).intersectsNode(target);
		}
		function StartedAtValue({ timestamp, t }) {
			const [showUnix, setShowUnix] = (0, react.useState)(false);
			if (timestamp === null || !Number.isFinite(timestamp)) return (0, react_jsx_runtime.jsx)("dd", { children: t("timing.notAvailable") });
			return (0, react_jsx_runtime.jsx)("dd", { children: (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: TrajectoryTable_module_css_default.timestampToggle,
				title: showUnix ? t("timing.showLocalTime") : t("timing.showUnixTimestamp"),
				onClick: (event) => {
					if (clickSelectsText(event.currentTarget)) return;
					setShowUnix((current) => !current);
				},
				children: showUnix ? (timestamp / 1e3).toFixed(3) : formatStartedAt(timestamp, t)
			}) });
		}
		function totalTime(metrics, t) {
			if (!metrics.timingRecorded) return t("timing.notRecorded");
			if (metrics.stepStartTime === null) return t("timing.stepStartUnavailable");
			if (metrics.completedTime === null) return t("status.pending");
			return formatDurationMs(Math.max(0, metrics.completedTime - metrics.stepStartTime), t);
		}
		function ttft(metrics, t) {
			if (!metrics.timingRecorded) return t("timing.notRecorded");
			if (metrics.stepStartTime === null) return t("timing.stepStartUnavailable");
			if (metrics.firstTokenTime === null) return t("timing.firstTokenUnavailable");
			return formatDurationMs(Math.max(0, metrics.firstTokenTime - metrics.stepStartTime), t);
		}
		function generationTime(metrics, t) {
			if (!metrics.timingRecorded || metrics.firstTokenTime === null) return t("timing.firstTokenUnavailable");
			if (metrics.completedTime === null) return t("status.pending");
			return formatDurationMs(Math.max(0, metrics.completedTime - metrics.firstTokenTime), t);
		}
		function throughput(metrics, t) {
			if (!metrics.usageProvided) return t("timing.usageUnavailable");
			if (metrics.outputTokens === null) return t("timing.outputTokensUnavailable");
			if (!metrics.timingRecorded || metrics.firstTokenTime === null) return t("timing.firstTokenUnavailable");
			if (metrics.completedTime === null) return t("status.pending");
			const generationSeconds = (metrics.completedTime - metrics.firstTokenTime) / 1e3;
			if (generationSeconds <= 0) return t("timing.durationTooShort");
			return t("unit.tokensPerSecond", { value: (metrics.outputTokens / generationSeconds).toFixed(1) });
		}
		function AssistantTimingPanel({ metrics, t }) {
			return (0, react_jsx_runtime.jsxs)("dl", {
				className: TrajectoryTable_module_css_default.overview,
				children: [
					(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("timing.started") }), (0, react_jsx_runtime.jsx)(StartedAtValue, {
						timestamp: metrics.stepStartTime,
						t
					})] }),
					(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("timing.totalDuration") }), (0, react_jsx_runtime.jsx)("dd", { children: totalTime(metrics, t) })] }),
					(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("timing.ttft") }), (0, react_jsx_runtime.jsx)("dd", { children: ttft(metrics, t) })] }),
					(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("timing.generation") }), (0, react_jsx_runtime.jsx)("dd", { children: generationTime(metrics, t) })] }),
					(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("timing.throughput") }), (0, react_jsx_runtime.jsx)("dd", { children: throughput(metrics, t) })] })
				]
			});
		}
		function flattenRecords(turns) {
			return turns.flatMap((turn, section) => {
				let firstInSection = true;
				const records = turn.groups.flatMap((group) => {
					return group.cells.map((cell, index) => {
						const turnStart = firstInSection && cell.requestOnly !== true && cell.kind !== "system" && (cell.kind !== "compacted" || turn.turn === null);
						if (turnStart) firstInSection = false;
						return {
							turn: turn.turn,
							section,
							group: group.title,
							groupStart: index === 0,
							turnStart,
							cell,
							turnEnd: false
						};
					});
				});
				const last = records.at(-1);
				if (last !== void 0) last.turnEnd = true;
				return records;
			});
		}
		function filterRecords(records, matches) {
			const filtered = records.filter((record) => record.cell.requestOnly !== true && matches.has(record.cell.index)).map((record) => ({
				...record,
				groupStart: false,
				turnStart: false,
				turnEnd: false
			}));
			const startedSections = /* @__PURE__ */ new Set();
			for (const [index, record] of filtered.entries()) {
				const previous = filtered[index - 1];
				const next = filtered[index + 1];
				record.groupStart = previous === void 0 || previous.section !== record.section || previous.group !== record.group;
				record.turnStart = !startedSections.has(record.section) && record.cell.kind !== "system" && (record.cell.kind !== "compacted" || record.turn === null);
				if (record.turnStart) startedSections.add(record.section);
				record.turnEnd = next === void 0 || next.section !== record.section;
			}
			return filtered;
		}
		function requestKey(turn, group) {
			return `${turn}\u0000${group}`;
		}
		function requestIdentity(request) {
			return request.purpose === "compaction" ? `compaction\u0000${request.seq}` : `assistant\u0000${request.turn}\u0000${request.step}`;
		}
		function indexRequestBoundaries(records, requestGroups) {
			const boundaries = /* @__PURE__ */ new Map();
			for (const record of records) {
				const key = requestKey(record.turn, record.group);
				if (!requestGroups.has(key)) continue;
				if (boundaries.has(key)) continue;
				if (record.cell.kind === "user" || record.cell.kind === "context" || record.cell.kind === "system") continue;
				boundaries.set(key, record.cell.index);
			}
			return boundaries;
		}
		function sectionLabel(turn, t) {
			return turn === null ? t("section.betweenTurns") : t("turn.label", { turn });
		}
		function indexRequestNumbers(sessionNumbers) {
			const numbers = /* @__PURE__ */ new Map();
			for (const request of sessionNumbers ?? []) numbers.set(requestKey(request.turn, request.group), request.number);
			return numbers;
		}
		function indexRequestBoundaryRuns(records, requestGroups) {
			const indexes = /* @__PURE__ */ new Map();
			let runLength = 0;
			for (const record of records) {
				if (record.cell.requestOnly === true) {
					indexes.set(record.cell.index, runLength++);
					continue;
				}
				if (runLength > 0 && record.groupStart && requestGroups.has(requestKey(record.turn, record.group))) indexes.set(record.cell.index, runLength);
				runLength = 0;
			}
			return indexes;
		}
		function summarizeTurn(records, requestGroups, t) {
			const steps = new Set(records.map((record) => requestKey(record.turn, record.group)).filter((key) => requestGroups.has(key))).size;
			const toolCalls = records.filter((record) => record.cell.kind === "tool" || record.cell.kind === "subtool").length;
			return [t(steps === 1 ? "summary.steps.one" : "summary.steps.other", { count: steps }), t(toolCalls === 1 ? "summary.toolCalls.one" : "summary.toolCalls.other", { count: toolCalls })].join(" · ");
		}
		function collapseTurnRecords(records, collapsedTurns, requestGroups, t) {
			const recordsByTurn = /* @__PURE__ */ new Map();
			for (const record of records) {
				if (record.turn === null) continue;
				const turnRecords = recordsByTurn.get(record.turn) ?? [];
				turnRecords.push(record);
				recordsByTurn.set(record.turn, turnRecords);
			}
			return records.flatMap((record) => {
				if (record.turn === null || !collapsedTurns.has(record.turn)) return [record];
				const turnRecords = recordsByTurn.get(record.turn) ?? [record];
				if (record.cell.requestOnly === true || record.cell.kind === "system") return [record];
				const contentRecords = turnRecords.filter((candidate) => candidate.cell.requestOnly !== true && candidate.cell.kind !== "system");
				if (contentRecords.length <= 1) return [record];
				if (record.cell.index !== contentRecords[0]?.cell.index) return [];
				return [{
					...record,
					turnEnd: false
				}, {
					...record,
					groupStart: false,
					turnStart: false,
					turnEnd: true,
					collapsedSummary: summarizeTurn(contentRecords.slice(1), requestGroups, t),
					collapsedSummaryKind: "turn"
				}];
			});
		}
		function assistantToolCalls(records, assistantIndex) {
			const at = records.findIndex((record) => record.cell.index === assistantIndex);
			if (at === -1 || records[at]?.cell.kind !== "message") return [];
			const calls = [];
			for (let i = at + 1; i < records.length; i++) {
				const record = records[i];
				if (record === void 0) break;
				if (record.cell.kind !== "tool" && record.cell.kind !== "subtool") break;
				calls.push(record);
			}
			return calls;
		}
		function summarizeCalls(records, t) {
			const names = [...new Set(records.map((record) => {
				const separator = record.cell.text.indexOf(" · ");
				return separator === -1 ? record.cell.text : record.cell.text.slice(0, separator);
			}).filter((name) => name !== ""))];
			const count = records.length;
			const summary = t(count === 1 ? "summary.toolCalls.one" : "summary.toolCalls.other", { count });
			return names.length > 0 ? `${summary} · ${names.join(", ")}` : summary;
		}
		function collapseCallRecords(records, collapsedIds, kind, t) {
			const out = [];
			for (let i = 0; i < records.length; i++) {
				const record = records[i];
				if (record === void 0) continue;
				out.push(record);
				if (record.collapsedSummary !== void 0 || record.cell.kind !== (kind === "assistant" ? "message" : "tool") || !collapsedIds.has(trajectoryRecordId(record.cell))) continue;
				const calls = [];
				for (let j = i + 1; j < records.length; j++) {
					const candidate = records[j];
					if (candidate === void 0 || candidate.collapsedSummary !== void 0 || candidate.cell.kind !== "tool" && candidate.cell.kind !== "subtool" || kind === "tool" && candidate.cell.kind !== "subtool") break;
					calls.push(candidate);
				}
				if (calls.length === 0) continue;
				const last = calls.at(-1);
				out[out.length - 1] = {
					...record,
					turnEnd: false
				};
				out.push({
					...record,
					groupStart: false,
					turnStart: false,
					turnEnd: last?.turnEnd ?? false,
					collapsedSummary: summarizeCalls(calls, t),
					collapsedSummaryKind: kind
				});
				i += calls.length;
			}
			return out;
		}
		function stateOf(record) {
			if (record.cell.isError) return "error";
			if (record.cell.kind === "compacted" && record.cell.timeSeconds === null) return "running";
			if (record.cell.assistantMetrics?.completedTime === null) return "running";
			if ((record.cell.kind === "tool" || record.cell.kind === "subtool") && record.cell.outputDetail === void 0) return "running";
			return "complete";
		}
		function statusLabel(state, t) {
			if (state === "error") return t("status.failed");
			if (state === "running") return t("status.pending");
			return t("status.completed");
		}
		function requestErrorMessage(request, t) {
			if (request.errorCode === "AUTH") return t("details.failure.auth");
			if (request.error === "trajectory.compaction-interrupted") return t("layout.compactionInterrupted");
			return request.error;
		}
		function TokenRows({ cell, t }) {
			const content = cell.output !== void 0 && cell.think !== void 0 ? Math.max(0, cell.output - cell.think) : void 0;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("usage.tokens") }), (0, react_jsx_runtime.jsx)("dd", { children: cell.output === void 0 ? "—" : t("unit.tokens", { value: cell.output }) })] }),
				cell.think !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
					className: TrajectoryTable_module_css_default.requestTokenDetail,
					children: [(0, react_jsx_runtime.jsx)("dt", { children: t("usage.reasoning") }), (0, react_jsx_runtime.jsx)("dd", { children: t("unit.tokens", { value: cell.think }) })]
				}),
				content !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
					className: TrajectoryTable_module_css_default.requestTokenDetail,
					children: [(0, react_jsx_runtime.jsx)("dt", { children: t("usage.content") }), (0, react_jsx_runtime.jsx)("dd", { children: t("unit.tokens", { value: content }) })]
				})
			] });
		}
		function inputTotal(usage) {
			if (usage.input === void 0 && usage.cacheRead === void 0 && usage.cacheWrite === void 0) return void 0;
			return (usage.input ?? 0) + (usage.cacheRead ?? 0) + (usage.cacheWrite ?? 0);
		}
		function UsageRows({ usage, t }) {
			if (usage === void 0) return (0, react_jsx_runtime.jsx)("p", {
				className: TrajectoryTable_module_css_default.noPayload,
				children: t("usage.notReported")
			});
			const totalInput = inputTotal(usage);
			const otherOutput = usage.output !== void 0 && usage.reasoning !== void 0 ? usage.output - usage.reasoning : void 0;
			return (0, react_jsx_runtime.jsxs)("dl", {
				className: TrajectoryTable_module_css_default.overview,
				children: [
					totalInput !== void 0 && (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("usage.input") }), (0, react_jsx_runtime.jsx)("dd", { children: t("unit.tokens", { value: totalInput }) })] }),
					usage.cacheRead !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
						className: TrajectoryTable_module_css_default.requestTokenDetail,
						children: [(0, react_jsx_runtime.jsx)("dt", { children: t("usage.cached") }), (0, react_jsx_runtime.jsx)("dd", { children: t("unit.tokens", { value: usage.cacheRead }) })]
					}),
					usage.cacheWrite !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
						className: TrajectoryTable_module_css_default.requestTokenDetail,
						children: [(0, react_jsx_runtime.jsx)("dt", { children: t("usage.cacheCreated") }), (0, react_jsx_runtime.jsx)("dd", { children: t("unit.tokens", { value: usage.cacheWrite }) })]
					}),
					usage.input !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
						className: TrajectoryTable_module_css_default.requestTokenDetail,
						children: [(0, react_jsx_runtime.jsx)("dt", { children: t("usage.other") }), (0, react_jsx_runtime.jsx)("dd", { children: t("unit.tokens", { value: usage.input }) })]
					}),
					usage.output !== void 0 && (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("usage.output") }), (0, react_jsx_runtime.jsx)("dd", { children: t("unit.tokens", { value: usage.output }) })] }),
					usage.reasoning !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
						className: TrajectoryTable_module_css_default.requestTokenDetail,
						children: [(0, react_jsx_runtime.jsx)("dt", { children: t("usage.reasoning") }), (0, react_jsx_runtime.jsx)("dd", { children: t("unit.tokens", { value: usage.reasoning }) })]
					}),
					otherOutput !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
						className: TrajectoryTable_module_css_default.requestTokenDetail,
						children: [(0, react_jsx_runtime.jsx)("dt", { children: t("usage.content") }), (0, react_jsx_runtime.jsx)("dd", { children: t("unit.tokens", { value: otherOutput }) })]
					})
				]
			});
		}
		function RequestUsagePanel({ usage, cumulative, t }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: TrajectoryTable_module_css_default.usagePanel,
				children: [(0, react_jsx_runtime.jsxs)("section", {
					className: TrajectoryTable_module_css_default.usageGroup,
					children: [(0, react_jsx_runtime.jsx)("h4", {
						className: TrajectoryTable_module_css_default.usageHeading,
						children: t("usage.thisRequest")
					}), (0, react_jsx_runtime.jsx)(UsageRows, {
						usage,
						t
					})]
				}), (0, react_jsx_runtime.jsxs)("section", {
					className: TrajectoryTable_module_css_default.usageGroup,
					children: [(0, react_jsx_runtime.jsx)("h4", {
						className: TrajectoryTable_module_css_default.usageHeading,
						children: t("usage.sessionCumulative")
					}), (0, react_jsx_runtime.jsx)(UsageRows, {
						usage: cumulative,
						t
					})]
				})]
			});
		}
		function RequestOptions({ options, preview = false, stringWrapping, t }) {
			if (options === void 0) return (0, react_jsx_runtime.jsx)("p", {
				className: TrajectoryTable_module_css_default.noPayload,
				children: t("options.notRecorded")
			});
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonTree, {
				data: options,
				stringWrapping,
				collapsedStringLines: preview ? 3 : 12,
				label: t("options.json"),
				labels: jsonTreeLabels(t),
				className: preview ? TrajectoryTable_module_css_default.jsonPreview : TrajectoryTable_module_css_default.jsonPayload
			});
		}
		function messageSourceLabel(source, t) {
			if (typeof source !== "object" || source === null || Array.isArray(source)) return t("source.unknown");
			const properties = source;
			const kind = properties.kind;
			if (kind === "user") return t("source.user");
			if (kind === "goal") {
				const round = properties.round;
				return typeof round === "number" && round > 0 ? t("source.goalRound", { round }) : t("source.goal");
			}
			if (typeof kind !== "string" || kind === "") return t("source.unknown");
			return `${kind[0]?.toUpperCase() ?? ""}${kind.slice(1)}`;
		}
		function MessageSource({ record, stringWrapping, t }) {
			const source = record.cell.messageSource;
			if (source === void 0) return (0, react_jsx_runtime.jsx)("p", {
				className: TrajectoryTable_module_css_default.noPayload,
				children: t("source.notRecorded")
			});
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonTree, {
				data: typeof source === "object" && source !== null ? source : { value: source },
				stringWrapping,
				collapsedStringLines: 12,
				label: t("source.messageJson"),
				labels: jsonTreeLabels(t),
				className: TrajectoryTable_module_css_default.jsonPayload
			});
		}
		function isMarkdownRecord(record) {
			return record.cell.kind === "user" || record.cell.kind === "context" || record.cell.kind === "message";
		}
		function parentRecords(records, record) {
			if (record.cell.kind !== "tool" && record.cell.kind !== "subtool") return {};
			const at = records.findIndex((candidate) => candidate.cell.index === record.cell.index);
			if (at === -1) return {};
			let tool;
			if (record.cell.kind === "subtool") for (let i = at - 1; i >= 0; i--) {
				const candidate = records[i];
				if (candidate === void 0 || candidate.turn !== record.turn || candidate.group !== record.group) break;
				if (candidate.cell.kind === "tool") {
					tool = candidate;
					break;
				}
			}
			const parentCallId = tool?.cell.callId ?? record.cell.callId;
			let message;
			if (parentCallId !== void 0) message = records.find((candidate) => candidate.turn === record.turn && candidate.cell.kind === "message" && candidate.cell.sourceBlocks?.some((block) => block.callId === parentCallId) === true);
			return {
				...message === void 0 ? {} : { message },
				...tool === void 0 ? {} : { tool }
			};
		}
		function markdownSource(record) {
			if (record.cell.kind === "user" || record.cell.kind === "context") return record.cell.inputDetail;
			if (record.cell.kind === "message" || record.cell.kind === "compacted") return record.cell.outputDetail;
		}
		function detailTabs(record) {
			if (record.cell.kind === "system") {
				if (record.cell.promptDetail === void 0 && record.cell.systemPromptDetail !== void 0) return SYSTEM_PROMPT_TABS.filter((tab) => tab.id === "system-prompt");
				return record.cell.previousPromptDetail === void 0 ? SYSTEM_PROMPT_TABS : SYSTEM_UPDATE_TABS;
			}
			if (record.cell.kind === "compacted") return [{
				id: "overview",
				labelKey: "tab.summary"
			}, {
				id: "raw",
				labelKey: "tab.rawOutput"
			}];
			if (isMarkdownRecord(record)) return [
				{
					id: "overview",
					labelKey: "tab.summary"
				},
				{
					id: "rendered",
					labelKey: "tab.preview"
				},
				{
					id: "raw",
					labelKey: "tab.raw"
				},
				...record.cell.messageSource === void 0 ? [] : [{
					id: "source",
					labelKey: "tab.source"
				}]
			];
			return [
				{
					id: "overview",
					labelKey: "tab.summary"
				},
				...record.cell.inputDetail ? [{
					id: "input",
					labelKey: codeProgram(record.cell) === void 0 ? "tab.payload" : "code.source"
				}] : [],
				...record.cell.outputDetail || codeProgram(record.cell) !== void 0 ? [{
					id: "output",
					labelKey: "tab.result"
				}] : [],
				{
					id: "schema",
					labelKey: "tab.schema"
				},
				{
					id: "timing",
					labelKey: "tab.timing"
				}
			];
		}
		function recordDisplayText(cell, t) {
			if (isToolCallOnly(cell, t)) return "";
			const program = codeProgram(cell);
			if (program !== void 0) return `${PTC_TOOL_NAME} · ${program.description.replace(/\s+/g, " ")}`;
			if (cell.previewMarkdown !== void 0) {
				const preview = trajectoryPreviewText(cell.previewMarkdown);
				if (cell.text === "") return preview;
				return preview === "" ? cell.text : `${cell.text} · ${preview}`;
			}
			if (cell.text !== "") return cell.text;
			const markdown = cell.kind === "user" || cell.kind === "context" ? cell.inputDetail : cell.kind === "message" ? cell.outputDetail ?? cell.thinkingDetail : void 0;
			return markdown === void 0 ? "" : trajectoryPreviewText(markdown);
		}
		function recordResultText(cell) {
			return cell.resultPreviewMarkdown === void 0 ? cell.result : trajectoryPreviewText(cell.resultPreviewMarkdown);
		}
		function toolCallTextParts(cell, text) {
			if (cell.kind !== "tool" && cell.kind !== "subtool") return void 0;
			const program = cell.toolName === PTC_TOOL_NAME;
			const separator = text.indexOf(" · ");
			if (separator === -1) return {
				name: text,
				program
			};
			return {
				program,
				name: text.slice(0, separator),
				args: text.slice(separator + 3)
			};
		}
		function isToolCallOnly(cell, t) {
			return cell.kind === "message" && !cell.outputDetail && !cell.thinkingDetail && cell.text === t("layout.toolCallOnly");
		}
		function RecordPresentation({ cell, children, t }) {
			const displayText = (0, react.useMemo)(() => recordDisplayText(cell, t), [
				cell.kind,
				cell.text,
				cell.toolName,
				cell.previewMarkdown,
				cell.inputDetail,
				cell.outputDetail,
				cell.thinkingDetail,
				t
			]);
			const resultText = (0, react.useMemo)(() => recordResultText(cell), [cell.result, cell.resultPreviewMarkdown]);
			const toolCallOnly = isToolCallOnly(cell, t);
			const toolCallText = toolCallTextParts(cell, displayText);
			return children({
				displayText,
				listDisplayText: toolCallOnly ? t("record.toolCallOnly") : toolCallText === void 0 ? displayText : [toolCallText.name, toolCallText.args].filter(Boolean).join(" "),
				resultText,
				toolCallOnly,
				toolCallText
			});
		}
		function RecordListText({ displayText, toolCallOnly, toolCallText, t }) {
			if (toolCallOnly) return (0, react_jsx_runtime.jsx)("span", {
				className: TrajectoryTable_module_css_default.toolCallOnly,
				children: t("record.toolCallOnly")
			});
			if (toolCallText === void 0) return displayText || "—";
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("span", {
				className: TrajectoryTable_module_css_default.toolCallNameTypeface,
				children: [toolCallText.program && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCodeOutlineRegular, {
					className: TrajectoryTable_module_css_default.programIcon,
					size: 12
				}), toolCallText.name || "—"]
			}), toolCallText.args !== void 0 && (0, react_jsx_runtime.jsx)("span", {
				className: toolCallText.program ? TrajectoryTable_module_css_default.programSummary : TrajectoryTable_module_css_default.toolCallPayload,
				children: toolCallText.args
			})] });
		}
		function MarkdownFragment({ text, rendered, preview, variant = "body", t }) {
			const labels = (0, react.useMemo)(() => markdownLabels(t), [t]);
			if (rendered) return (0, react_jsx_runtime.jsx)("div", {
				className: preview ? TrajectoryTable_module_css_default.markdownPreview : TrajectoryTable_module_css_default.markdownPayload,
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
					text,
					labels,
					variant
				})
			});
			return (0, react_jsx_runtime.jsx)("pre", {
				className: `${TrajectoryTable_module_css_default.payload} ${preview ? TrajectoryTable_module_css_default.payloadPreview : ""}`,
				children: text
			});
		}
		function SourceBlocks({ blocks, onOpenCall, t }) {
			const attachments = new Map(recordAttachments(blocks, t).map((entry) => [entry.index, entry]));
			return (0, react_jsx_runtime.jsx)("div", {
				className: TrajectoryTable_module_css_default.sourceBlocks,
				children: blocks.map((block, index) => {
					const attachment = attachments.get(index);
					return attachment !== void 0 ? (0, react_jsx_runtime.jsxs)("details", {
						className: TrajectoryTable_module_css_default.attachmentDisclosure,
						children: [(0, react_jsx_runtime.jsxs)("summary", { children: [(0, react_jsx_runtime.jsx)("span", {
							className: TrajectoryTable_module_css_default.sourceBlockLabel,
							children: t("block.label", {
								index: index + 1,
								type: block.type
							})
						}), (0, react_jsx_runtime.jsx)("span", {
							className: TrajectoryTable_module_css_default.attachmentName,
							title: attachment.name,
							children: attachment.name
						})] }), (0, react_jsx_runtime.jsx)("pre", {
							className: TrajectoryTable_module_css_default.sourceBlockContent,
							children: block.content
						})]
					}, index) : (0, react_jsx_runtime.jsxs)("section", {
						className: TrajectoryTable_module_css_default.sourceBlock,
						children: [block.callId !== void 0 ? (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: TrajectoryTable_module_css_default.sourceBlockJumpTarget,
							"aria-label": t("block.openSummary", { index: index + 1 }),
							title: t("block.openSummaryTitle"),
							onClick: () => {
								if (block.callId !== void 0) onOpenCall(block.callId);
							},
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: TrajectoryTable_module_css_default.sourceBlockLabel,
								children: t("block.label", {
									index: index + 1,
									type: block.type
								})
							}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {
								className: TrajectoryTable_module_css_default.sourceBlockJumpIcon,
								size: 12
							})]
						}) : (0, react_jsx_runtime.jsx)("div", {
							className: TrajectoryTable_module_css_default.sourceBlockHeader,
							children: (0, react_jsx_runtime.jsx)("span", {
								className: TrajectoryTable_module_css_default.sourceBlockLabel,
								children: t("block.label", {
									index: index + 1,
									type: block.type
								})
							})
						}), (0, react_jsx_runtime.jsx)("pre", {
							className: TrajectoryTable_module_css_default.sourceBlockContent,
							children: block.content
						})]
					}, index);
				})
			});
		}
		function recordAttachments(blocks, t) {
			let imageIndex = 0;
			return (blocks ?? []).flatMap((block, index) => {
				const ref = block.attachment ?? block.file;
				if (ref === void 0) return [];
				if (block.attachment !== void 0) imageIndex += 1;
				return [{
					block,
					index,
					name: ref.name ?? t("attachment.imageName", { index: imageIndex }),
					metadata: [
						block.attachment?.mediaType ?? (0, _deepseek_ai_dsh_client_ui_primitives.fileExtension)(ref.name ?? "").toUpperCase(),
						(0, _deepseek_ai_dsh_client_ui_primitives.fileSizeText)(ref.bytes),
						...block.attachment === void 0 ? [] : [`${block.attachment.width} × ${block.attachment.height}`]
					].filter(Boolean).join(" · ")
				}];
			});
		}
		function RecordAttachments({ blocks, preview, renderSlot, loadImage, t }) {
			const attachments = recordAttachments(blocks, t);
			if (attachments.length === 0) return null;
			return (0, react_jsx_runtime.jsx)("ul", {
				className: preview ? `${TrajectoryTable_module_css_default.attachments} ${TrajectoryTable_module_css_default.attachmentsPreview}` : TrajectoryTable_module_css_default.attachments,
				"aria-label": t("attachment.list"),
				children: attachments.map(({ block, index, name, metadata }) => (0, react_jsx_runtime.jsxs)("li", {
					className: TrajectoryTable_module_css_default.attachmentRow,
					children: [block.attachment !== void 0 ? renderSlot("conversation.trajectory.images", {
						images: [{
							attachment: block.attachment,
							label: name
						}],
						align: "start",
						thumbnail: true,
						loadImage
					}) : (0, react_jsx_runtime.jsx)("span", {
						className: TrajectoryTable_module_css_default.attachmentIcon,
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, { path: name })
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: TrajectoryTable_module_css_default.attachmentInfo,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: TrajectoryTable_module_css_default.attachmentName,
							title: name,
							children: name
						}), (0, react_jsx_runtime.jsx)("span", {
							className: TrajectoryTable_module_css_default.attachmentMetadata,
							children: metadata
						})]
					})]
				}, index))
			});
		}
		function AssistantToolCalls({ blocks, preview, onOpenCall, t }) {
			const calls = blocks?.filter((block) => block.type === "tool-call") ?? [];
			if (calls.length === 0) return null;
			return (0, react_jsx_runtime.jsx)("ul", {
				className: preview ? `${TrajectoryTable_module_css_default.assistantToolCalls} ${TrajectoryTable_module_css_default.assistantToolCallsPreview}` : TrajectoryTable_module_css_default.assistantToolCalls,
				children: calls.map((call, index) => (0, react_jsx_runtime.jsx)("li", { children: (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: TrajectoryTable_module_css_default.assistantToolCallButton,
					title: t("block.openSummaryTitle"),
					onClick: () => {
						if (call.callId !== void 0) onOpenCall(call.callId);
					},
					children: [(0, react_jsx_runtime.jsx)("svg", {
						className: TrajectoryTable_module_css_default.assistantToolCallIcon,
						width: "12",
						height: "12",
						viewBox: "0 0 24 24",
						fill: "none",
						"aria-hidden": "true",
						children: (0, react_jsx_runtime.jsx)("path", {
							d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z",
							stroke: "currentColor",
							strokeWidth: "1.8",
							strokeLinecap: "round",
							strokeLinejoin: "round"
						})
					}), (0, react_jsx_runtime.jsxs)("span", {
						className: TrajectoryTable_module_css_default.assistantToolCallText,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: TrajectoryTable_module_css_default.assistantToolCallName,
							children: call.toolName ?? t("details.toolCall")
						}), call.content !== "" && (0, react_jsx_runtime.jsx)("span", {
							className: TrajectoryTable_module_css_default.assistantToolCallArgs,
							children: call.content
						})]
					})]
				}) }, call.callId ?? index))
			});
		}
		function ToolGlyph() {
			return (0, react_jsx_runtime.jsx)("svg", {
				className: TrajectoryTable_module_css_default.toolCatalogIcon,
				width: "12",
				height: "12",
				viewBox: "0 0 24 24",
				fill: "none",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", {
					d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z",
					stroke: "currentColor",
					strokeWidth: "1.8",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}
		function ToolCatalog({ tools, stringWrapping, t }) {
			if (tools.length === 0) return (0, react_jsx_runtime.jsx)("p", {
				className: TrajectoryTable_module_css_default.noPayload,
				children: t("record.toolsMissing")
			});
			return (0, react_jsx_runtime.jsx)("div", {
				className: TrajectoryTable_module_css_default.toolCatalog,
				children: tools.map((tool, index) => (0, react_jsx_runtime.jsxs)("details", {
					className: TrajectoryTable_module_css_default.toolCatalogItem,
					children: [(0, react_jsx_runtime.jsxs)("summary", {
						className: TrajectoryTable_module_css_default.toolCatalogSummary,
						children: [
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {
								className: TrajectoryTable_module_css_default.toolCatalogChevron,
								size: 12
							}),
							(0, react_jsx_runtime.jsx)(ToolGlyph, {}),
							(0, react_jsx_runtime.jsx)("span", {
								className: TrajectoryTable_module_css_default.toolCatalogName,
								children: tool.name
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: TrajectoryTable_module_css_default.toolCatalogDescription,
								children: tool.description
							})
						]
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: TrajectoryTable_module_css_default.toolCatalogDefinition,
						children: [tool.description !== "" && (0, react_jsx_runtime.jsx)("p", {
							className: TrajectoryTable_module_css_default.toolCatalogFullDescription,
							children: tool.description
						}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonTree, {
							data: tool.parameters,
							stringWrapping,
							label: t("record.namedParametersJson", { name: tool.name }),
							labels: jsonTreeLabels(t),
							className: TrajectoryTable_module_css_default.toolCatalogTree
						})]
					})]
				}, `${tool.name}:${index}`))
			});
		}
		function promptDiffLines(before, after) {
			return structuredPatch("", "", before, after, void 0, void 0, { context: 3 }).hunks.flatMap((hunk, hunkIndex) => [
				...hunkIndex === 0 ? [] : [{
					kind: "meta",
					text: ""
				}],
				{
					kind: "meta",
					text: `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`
				},
				...hunk.lines.flatMap((line) => {
					if (line.startsWith("\\")) return [];
					if (line.startsWith("+")) return [{
						kind: "added",
						text: line
					}];
					if (line.startsWith("-")) return [{
						kind: "removed",
						text: line
					}];
					return [{
						kind: "context",
						text: line
					}];
				})
			]);
		}
		function PromptDiffSection({ title, before, after }) {
			const lines = promptDiffLines(before, after);
			if (lines.length === 0) return null;
			return (0, react_jsx_runtime.jsxs)("section", {
				className: TrajectoryTable_module_css_default.promptDiffSection,
				children: [(0, react_jsx_runtime.jsx)("h3", {
					className: TrajectoryTable_module_css_default.promptDiffTitle,
					children: title
				}), (0, react_jsx_runtime.jsx)("pre", {
					className: TrajectoryTable_module_css_default.promptDiff,
					children: lines.map((line, index) => (0, react_jsx_runtime.jsxs)("span", {
						className: TrajectoryTable_module_css_default[`promptDiffLine${line.kind}`],
						children: [line.text || " ", "\n"]
					}, index))
				})]
			});
		}
		function SystemPromptDiff({ before, after, t }) {
			const toolsBefore = JSON.stringify(before.tools, null, 2);
			const toolsAfter = JSON.stringify(after.tools, null, 2);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: TrajectoryTable_module_css_default.promptDiffSections,
				children: [before.system !== after.system && (0, react_jsx_runtime.jsx)(PromptDiffSection, {
					title: t("record.systemPrompt"),
					before: before.system,
					after: after.system
				}), toolsBefore !== toolsAfter && (0, react_jsx_runtime.jsx)(PromptDiffSection, {
					title: t("record.tools"),
					before: toolsBefore,
					after: toolsAfter
				})]
			});
		}
		function ToolOutputBlocks({ blocks, error, errorDetail, preview, renderSlot, loadImage }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: [
					TrajectoryTable_module_css_default.resultBlocks,
					preview ? TrajectoryTable_module_css_default.resultBlocksPreview : void 0,
					error ? TrajectoryTable_module_css_default.errorPayload : void 0
				].filter((value) => value !== void 0).join(" "),
				children: [error && errorDetail !== void 0 && errorDetail !== "" && !blocks.some((block) => block.type === "text" && block.content !== "") && (0, react_jsx_runtime.jsx)("pre", {
					className: TrajectoryTable_module_css_default.resultBlockText,
					children: errorDetail
				}), blocks.map((block, index) => block.attachment !== void 0 ? (0, react_jsx_runtime.jsx)("div", {
					className: TrajectoryTable_module_css_default.messageImages,
					children: renderSlot("conversation.trajectory.images", {
						images: [{ attachment: block.attachment }],
						align: "start",
						loadImage
					})
				}, index) : block.content !== "" ? (0, react_jsx_runtime.jsx)("pre", {
					className: TrajectoryTable_module_css_default.resultBlockText,
					children: block.content
				}, index) : null)]
			});
		}
		function MarkdownRecordContent({ record, rendered, preview = false, thinkingExpanded, onThinkingExpandedChange, onOpenCall, renderSlot, loadImage, t }) {
			if (record.cell.sourceBlocks?.length && record.cell.sourceBlocks.every((block) => block.type === "tool-addition" || block.type === "tool-removal")) return (0, react_jsx_runtime.jsx)("pre", {
				className: `${TrajectoryTable_module_css_default.payload} ${TrajectoryTable_module_css_default.toolUpdatePayload}`,
				children: record.cell.inputDetail
			});
			if (!rendered && record.cell.sourceBlocks && record.cell.sourceBlocks.length > 0) return (0, react_jsx_runtime.jsx)(SourceBlocks, {
				blocks: record.cell.sourceBlocks,
				onOpenCall,
				t
			});
			if (record.cell.thinkingDetail) {
				if (!rendered) return (0, react_jsx_runtime.jsx)(MarkdownFragment, {
					text: [record.cell.thinkingDetail, record.cell.outputDetail].filter((value) => value !== void 0 && value !== "").join("\n\n"),
					rendered: false,
					preview,
					t
				});
				return (0, react_jsx_runtime.jsxs)("div", {
					className: `${TrajectoryTable_module_css_default.assistantContent} ${TrajectoryTable_module_css_default.assistantContentRendered}`,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: preview && !record.cell.outputDetail ? `${TrajectoryTable_module_css_default.thinkingQuote} ${TrajectoryTable_module_css_default.thinkingQuoteOnlyPreview}` : TrajectoryTable_module_css_default.thinkingQuote,
							children: [(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: TrajectoryTable_module_css_default.thinkingToggle,
								"aria-expanded": thinkingExpanded,
								onClick: () => {
									onThinkingExpandedChange(!thinkingExpanded);
								},
								children: [t("record.thinking"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {
									className: TrajectoryTable_module_css_default.thinkingChevron,
									size: 12
								})]
							}), thinkingExpanded && (0, react_jsx_runtime.jsx)(MarkdownFragment, {
								text: record.cell.thinkingDetail,
								rendered,
								preview,
								variant: "compact",
								t
							})]
						}),
						record.cell.outputDetail && (0, react_jsx_runtime.jsx)("div", {
							className: TrajectoryTable_module_css_default.assistantOutput,
							children: (0, react_jsx_runtime.jsx)(MarkdownFragment, {
								text: record.cell.outputDetail,
								rendered,
								preview,
								t
							})
						}),
						(0, react_jsx_runtime.jsx)(AssistantToolCalls, {
							blocks: record.cell.sourceBlocks,
							preview,
							onOpenCall,
							t
						}),
						(0, react_jsx_runtime.jsx)(RecordAttachments, {
							blocks: record.cell.sourceBlocks,
							preview,
							renderSlot,
							loadImage,
							t
						})
					]
				});
			}
			const source = markdownSource(record);
			const hasAttachments = record.cell.sourceBlocks?.some((block) => block.attachment !== void 0 || block.file !== void 0) === true;
			const hasToolCalls = record.cell.kind === "message" && record.cell.sourceBlocks?.some((block) => block.type === "tool-call") === true;
			if (!source && !hasAttachments && !hasToolCalls) {
				const emptyLabel = isToolCallOnly(record.cell, t) ? t("record.toolCallOnly") : record.cell.text || t("record.noContent");
				return (0, react_jsx_runtime.jsx)("p", {
					className: TrajectoryTable_module_css_default.noPayload,
					children: emptyLabel
				});
			}
			if (!rendered || !hasAttachments && !hasToolCalls) return (0, react_jsx_runtime.jsx)(MarkdownFragment, {
				text: source ?? "",
				rendered,
				preview,
				t
			});
			return (0, react_jsx_runtime.jsxs)("div", { children: [
				source && (0, react_jsx_runtime.jsx)(MarkdownFragment, {
					text: source,
					rendered: true,
					preview,
					t
				}),
				record.cell.kind === "message" && (0, react_jsx_runtime.jsx)(AssistantToolCalls, {
					blocks: record.cell.sourceBlocks,
					preview,
					onOpenCall,
					t
				}),
				(0, react_jsx_runtime.jsx)(RecordAttachments, {
					blocks: record.cell.sourceBlocks,
					preview,
					renderSlot,
					loadImage,
					t
				})
			] });
		}
		function RecordTiming({ record, preview = false, t }) {
			return record.cell.kind === "message" && record.cell.assistantMetrics !== void 0 ? (0, react_jsx_runtime.jsx)(AssistantTimingPanel, {
				metrics: record.cell.assistantMetrics,
				t
			}) : (0, react_jsx_runtime.jsxs)("dl", {
				className: TrajectoryTable_module_css_default.overview,
				children: [
					(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("timing.started") }), (0, react_jsx_runtime.jsx)(StartedAtValue, {
						timestamp: record.cell.startedAt ?? null,
						t
					})] }),
					(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("timing.duration") }), (0, react_jsx_runtime.jsx)("dd", { children: formatElapsedSeconds(record.cell.timeSeconds, t) })] }),
					!preview && (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("timing.source") }), (0, react_jsx_runtime.jsx)("dd", { children: record.cell.timeSeconds === null ? t("timing.notAvailable") : t("timing.sessionTimestamps") })] })
				]
			});
		}
		function RequestTiming({ assistant, anchor, request, preview = false, t }) {
			if (assistant !== void 0) return (0, react_jsx_runtime.jsx)(RecordTiming, {
				record: assistant,
				preview,
				t
			});
			if (request?.startedAt !== void 0) {
				const duration = request.completedAt === null || request.completedAt === void 0 ? null : Math.max(0, (request.completedAt - request.startedAt) / 1e3);
				return (0, react_jsx_runtime.jsxs)("dl", {
					className: TrajectoryTable_module_css_default.overview,
					children: [
						(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("timing.started") }), (0, react_jsx_runtime.jsx)(StartedAtValue, {
							timestamp: request.startedAt,
							t
						})] }),
						(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("timing.duration") }), (0, react_jsx_runtime.jsx)("dd", { children: formatElapsedSeconds(duration, t) })] }),
						!preview && (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("timing.source") }), (0, react_jsx_runtime.jsx)("dd", { children: duration === null ? t("timing.sessionTimestampsRunning") : t("timing.sessionTimestamps") })] })
					]
				});
			}
			return (0, react_jsx_runtime.jsxs)("dl", {
				className: TrajectoryTable_module_css_default.overview,
				children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("timing.started") }), (0, react_jsx_runtime.jsx)(StartedAtValue, {
					timestamp: anchor?.cell.startedAt ?? null,
					t
				})] }), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("timing.duration") }), (0, react_jsx_runtime.jsx)("dd", { children: formatElapsedSeconds(null, t) })] })]
			});
		}
		function RecordPayload({ record, direction, preview = false, renderSlot, loadImage, stringWrapping, t }) {
			const value = direction === "input" ? record.cell.inputDetail : record.cell.outputDetail;
			const missing = direction === "input" ? t("record.noPayload") : t("record.noResult");
			if (!value) return (0, react_jsx_runtime.jsx)("p", {
				className: TrajectoryTable_module_css_default.noPayload,
				children: missing
			});
			const error = direction === "output" && record.cell.isError === true;
			const payloadClass = preview ? TrajectoryTable_module_css_default.jsonPreview : TrajectoryTable_module_css_default.jsonPayload;
			const payloadClassName = error ? `${payloadClass} ${TrajectoryTable_module_css_default.errorPayload}` : payloadClass;
			const json = error ? void 0 : parseJsonContainer(value);
			if (direction === "output" && record.cell.outputBlocks?.length === 1 && record.cell.outputBlocks[0]?.type === "text" && json !== void 0) return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonTree, {
				data: json,
				stringWrapping,
				collapsedStringLines: preview ? 3 : 12,
				label: t("record.resultJson"),
				labels: jsonTreeLabels(t),
				className: payloadClassName
			});
			if (direction === "output" && record.cell.outputBlocks?.some((block) => block.attachment !== void 0 || block.content !== "") === true) return (0, react_jsx_runtime.jsx)(ToolOutputBlocks, {
				blocks: record.cell.outputBlocks,
				error,
				errorDetail: error ? value : void 0,
				preview,
				renderSlot,
				loadImage
			});
			if (direction === "input" && (record.cell.kind === "user" || record.cell.kind === "context") || direction === "output" && record.cell.kind === "message") return (0, react_jsx_runtime.jsx)("div", {
				className: [preview ? TrajectoryTable_module_css_default.markdownPreview : TrajectoryTable_module_css_default.markdownPayload, error ? TrajectoryTable_module_css_default.errorPayload : void 0].filter((className) => className !== void 0).join(" "),
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
					text: value,
					labels: markdownLabels(t)
				})
			});
			if (json !== void 0) return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonTree, {
				data: json,
				stringWrapping,
				collapsedStringLines: preview ? 3 : 12,
				label: t(direction === "input" ? "record.payloadJson" : "record.outputJson"),
				labels: jsonTreeLabels(t),
				className: payloadClassName
			});
			return (0, react_jsx_runtime.jsx)("pre", {
				className: [
					TrajectoryTable_module_css_default.payload,
					preview ? TrajectoryTable_module_css_default.payloadPreview : void 0,
					error ? TrajectoryTable_module_css_default.errorPayload : void 0,
					value === t("record.noOutput") ? TrajectoryTable_module_css_default.noOutputText : void 0
				].filter((value) => value !== void 0).join(" "),
				children: value
			});
		}
		function RecordSchema({ record, preview = false, stringWrapping, t }) {
			if (!record.cell.schemaDetail) return (0, react_jsx_runtime.jsx)("p", {
				className: TrajectoryTable_module_css_default.noPayload,
				children: t("record.schemaUnavailable")
			});
			const schema = parseToolSchema(record.cell.schemaDetail);
			if (schema !== void 0) return (0, react_jsx_runtime.jsxs)("div", {
				className: preview ? `${TrajectoryTable_module_css_default.schema} ${TrajectoryTable_module_css_default.schemaPreview}` : TrajectoryTable_module_css_default.schema,
				children: [(0, react_jsx_runtime.jsxs)("header", {
					className: TrajectoryTable_module_css_default.schemaIntro,
					children: [(0, react_jsx_runtime.jsx)("h3", {
						className: TrajectoryTable_module_css_default.schemaName,
						children: schema.name
					}), (0, react_jsx_runtime.jsx)("p", {
						className: TrajectoryTable_module_css_default.schemaDescription,
						children: schema.description
					})]
				}), (0, react_jsx_runtime.jsxs)("section", {
					className: TrajectoryTable_module_css_default.schemaParameters,
					children: [(0, react_jsx_runtime.jsx)("h4", {
						className: TrajectoryTable_module_css_default.schemaParametersTitle,
						children: t("record.parameters")
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonTree, {
						data: schema.parameters,
						stringWrapping,
						collapsedStringLines: preview ? 3 : 12,
						label: t("record.namedParametersJson", { name: schema.name }),
						labels: jsonTreeLabels(t),
						className: TrajectoryTable_module_css_default.schemaTree
					})]
				})]
			});
			return (0, react_jsx_runtime.jsx)("pre", {
				className: `${TrajectoryTable_module_css_default.payload} ${preview ? TrajectoryTable_module_css_default.payloadPreview : ""}`,
				children: record.cell.schemaDetail
			});
		}
		function parseToolSchema(value) {
			try {
				const parsed = JSON.parse(value);
				if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return void 0;
				const schema = parsed;
				if (typeof schema.name !== "string" || typeof schema.description !== "string" || typeof schema.parameters !== "object" || schema.parameters === null || Array.isArray(schema.parameters)) return void 0;
				return {
					name: schema.name,
					description: schema.description,
					parameters: schema.parameters
				};
			} catch {
				return;
			}
		}
		function parseJsonContainer(value) {
			try {
				const parsed = JSON.parse(value);
				return typeof parsed === "object" && parsed !== null ? parsed : void 0;
			} catch {
				return;
			}
		}
		function InspectorCopyButton({ text, label, t }) {
			const [state, setState] = (0, react.useState)("idle");
			(0, react.useEffect)(() => {
				if (state === "idle") return;
				const timer = setTimeout(() => {
					setState("idle");
				}, 1500);
				return () => {
					clearTimeout(timer);
				};
			}, [state]);
			const title = state === "idle" ? label : t(state === "copied" ? "copied" : "copy.failed");
			return (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: TrajectoryTable_module_css_default.programAction,
				"data-state": state,
				"aria-label": title,
				title,
				onClick: () => {
					(0, _deepseek_ai_dsh_client_ui_primitives.writeClipboard)(text).then((ok) => {
						setState(ok ? "copied" : "failed");
					});
				},
				children: state === "copied" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 12 }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCopyOutlineRegular, { size: 12 })
			});
		}
		function ProgramInput({ program, initialWrapped, stringWrapping, onOpen, t }) {
			const contentsId = (0, react.useId)();
			const [wrapped, setWrapped] = (0, react.useState)(initialWrapped);
			const [showJson, setShowJson] = (0, react.useState)(false);
			const actions = (0, react_jsx_runtime.jsxs)("span", {
				className: TrajectoryTable_module_css_default.programActions,
				children: [
					!showJson && program.language !== void 0 && (0, react_jsx_runtime.jsx)("span", {
						className: TrajectoryTable_module_css_default.programLanguage,
						children: program.language
					}),
					!showJson && (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: TrajectoryTable_module_css_default.programAction,
						"aria-label": t("record.wrapLines"),
						title: t("record.wrapLines"),
						"aria-pressed": wrapped,
						"aria-controls": contentsId,
						onClick: () => {
							const next = !wrapped;
							setWrapped(next);
							stringWrapping?.setDefault(next);
						},
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWrapLinesOutlineRegular, { size: 12 })
					}),
					onOpen === void 0 && (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: TrajectoryTable_module_css_default.programAction,
						"aria-label": t("code.originalJson"),
						title: t("code.originalJson"),
						"aria-pressed": showJson,
						"aria-controls": contentsId,
						onClick: () => {
							setShowJson((value) => !value);
						},
						children: (0, react_jsx_runtime.jsxs)("svg", {
							width: "12",
							height: "12",
							viewBox: "0 0 16 16",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "1.5",
							strokeLinecap: "round",
							strokeLinejoin: "round",
							"aria-hidden": "true",
							children: [(0, react_jsx_runtime.jsx)("path", { d: "M6 2H5a2 2 0 0 0-2 2v2a2 2 0 0 1-2 2 2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h1" }), (0, react_jsx_runtime.jsx)("path", { d: "M10 2h1a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0-2 2v2a2 2 0 0 1-2 2h-1" })]
						})
					}),
					(0, react_jsx_runtime.jsx)(InspectorCopyButton, {
						text: showJson ? program.rawInput : program.source,
						label: t(showJson ? "copy.json" : "code.copySource"),
						t
					})
				]
			});
			const body = (0, react_jsx_runtime.jsx)("div", {
				id: contentsId,
				className: TrajectoryTable_module_css_default.programContent,
				"data-wrap": wrapped,
				children: showJson ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonTree, {
					data: program.arguments,
					label: t("record.parametersJson"),
					labels: jsonTreeLabels(t),
					stringWrapping
				}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.CodeBlock, {
					code: program.source,
					lang: program.language,
					lineNumbers: true,
					showHeader: false,
					className: TrajectoryTable_module_css_default.programSource,
					copyLabel: t("code.copySource"),
					copiedLabel: t("copied")
				})
			});
			return onOpen === void 0 ? (0, react_jsx_runtime.jsxs)("section", {
				className: TrajectoryTable_module_css_default.programPanel,
				children: [(0, react_jsx_runtime.jsxs)("header", {
					className: TrajectoryTable_module_css_default.overviewHeading,
					children: [(0, react_jsx_runtime.jsx)("span", { children: t("code.source") }), actions]
				}), body]
			}) : (0, react_jsx_runtime.jsx)(OverviewSection, {
				label: t("code.source"),
				onOpen,
				actions,
				children: body
			});
		}
		function ProgramOutput({ record, stringWrapping, onOpen, t }) {
			const output = record.cell.outputDetail;
			const json = output === void 0 || record.cell.isError === true ? void 0 : parseJsonContainer(output);
			const actions = output === void 0 ? void 0 : (0, react_jsx_runtime.jsx)("span", {
				className: TrajectoryTable_module_css_default.programActions,
				children: (0, react_jsx_runtime.jsx)(InspectorCopyButton, {
					text: output,
					label: t("code.copyOutput"),
					t
				})
			});
			const body = (0, react_jsx_runtime.jsx)("div", {
				className: TrajectoryTable_module_css_default.programContent,
				children: output === void 0 || output === "" ? (0, react_jsx_runtime.jsx)("p", {
					className: TrajectoryTable_module_css_default.noPayload,
					children: t(stateOf(record) === "running" ? "code.running" : "record.noOutput")
				}) : json !== void 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonTree, {
					data: json,
					label: t("record.outputJson"),
					labels: jsonTreeLabels(t),
					stringWrapping,
					collapsedStringLines: onOpen === void 0 ? 12 : 3
				}) : (0, react_jsx_runtime.jsx)("pre", {
					className: `${TrajectoryTable_module_css_default.programOutput} ${record.cell.isError === true ? TrajectoryTable_module_css_default.programError : ""}`,
					children: output
				})
			});
			return onOpen === void 0 ? body : (0, react_jsx_runtime.jsx)(OverviewSection, {
				label: t("code.output"),
				onOpen,
				actions,
				children: body
			});
		}
		function OverviewSection({ label, onOpen, actions, children }) {
			const previewRef = (0, react.useRef)(null);
			const [hasMore, setHasMore] = (0, react.useState)(false);
			const measureOverflow = (0, react.useCallback)((preview) => {
				setHasMore(preview.scrollHeight - preview.clientHeight - preview.scrollTop > 1);
			}, []);
			(0, react.useLayoutEffect)(() => {
				const preview = previewRef.current;
				const measure = () => {
					measureOverflow(preview);
				};
				measure();
				if (typeof ResizeObserver === "undefined") return;
				const observer = new ResizeObserver(measure);
				observer.observe(preview);
				for (const child of preview.children) observer.observe(child);
				return () => {
					observer.disconnect();
				};
			}, [children, measureOverflow]);
			return (0, react_jsx_runtime.jsxs)("section", {
				className: TrajectoryTable_module_css_default.overviewSection,
				children: [(0, react_jsx_runtime.jsxs)("h3", {
					className: TrajectoryTable_module_css_default.overviewHeading,
					children: [(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: TrajectoryTable_module_css_default.overviewTitle,
						onClick: onOpen,
						children: [(0, react_jsx_runtime.jsx)("span", { children: label }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {
							className: TrajectoryTable_module_css_default.overviewTitleIcon,
							size: 12
						})]
					}), actions]
				}), (0, react_jsx_runtime.jsx)("div", {
					ref: previewRef,
					className: `${TrajectoryTable_module_css_default.overviewPreview} ${TrajectoryTable_module_css_default.summaryScrollRegion}`,
					"data-summary-scroll-region": "",
					"data-scroll-more": hasMore || void 0,
					onScroll: (event) => {
						measureOverflow(event.currentTarget);
					},
					children
				})]
			});
		}
		/**
		* Render trajectory events as a dense ledger with turn and step separators.
		* Clicking ledger whitespace clears the active record or request selection.
		* @param props - Grouped trajectory data and whole-ledger fold state.
		* @returns The ledger and an optional local record inspector.
		*/
		function TrajectoryTable({ watchToolResult, t, stringWrapping, renderSlot, loadImage, requestNumbers: sessionRequestNumbers, turns, streamingCells = [], timelineFocusIndexes = null, searchMatchIndexes = null, onSelectedIndexChange, onRecordSelect, recordSelection = null, recordFocus = null, historyLoading = false, olderHistoryLoading = false, historyStartSeq, hasOlderRecords = false, onLoadOlder, onClearSelection, collapsedTurns, onToggleTurn, collapsedAssistants, onToggleAssistant, collapsedTools, onToggleTool, inspectCallId = null, onInspectApplied }) {
			const [selectedRecordId, setSelectedRecordId] = (0, react.useState)(null);
			const [selectedRequest, setSelectedRequest] = (0, react.useState)(null);
			const [activeTab, setActiveTab] = (0, react.useState)("overview");
			const [codeWrappingOnOpen, setCodeWrappingOnOpen] = (0, react.useState)(false);
			const [thinkingDisclosure, setThinkingDisclosure] = (0, react.useState)();
			const [detailsWidth, setDetailsWidth] = (0, react.useState)(null);
			const [toolRequestOffset, setToolRequestOffset] = (0, react.useState)(null);
			const detailsResizeDrag = (0, react.useRef)(null);
			const appliedRecordSelection = (0, react.useRef)(null);
			const appliedRecordFocus = (0, react.useRef)(null);
			const tabHistory = (0, react.useRef)(new Set(["overview"]));
			const rootRef = (0, react.useRef)(null);
			const tablePaneRef = (0, react.useRef)(null);
			const followsTableTail = (0, react.useRef)(false);
			const tableScrollInitialized = (0, react.useRef)(false);
			const [tableScrollReady, setTableScrollReady] = (0, react.useState)(false);
			const pendingScrollRecordId = (0, react.useRef)(null);
			const loadingOlder = (0, react.useRef)(false);
			const [olderLoading, setOlderLoading] = (0, react.useState)(false);
			const olderLoadAnchor = (0, react.useRef)(null);
			const allRecords = (0, react.useMemo)(() => flattenRecords(turns), [turns]);
			const streamingCellsByIndex = (0, react.useMemo)(() => new Map(streamingCells.map((cell) => [cell.index, cell])), [streamingCells]);
			const currentRecord = (0, react.useCallback)((record) => {
				const cell = streamingCellsByIndex.get(record.cell.index);
				return cell === void 0 ? record : {
					...record,
					cell
				};
			}, [streamingCellsByIndex]);
			const selectedTemplate = (0, react.useMemo)(() => selectedRecordId === null ? void 0 : allRecords.find((record) => trajectoryRecordId(record.cell) === selectedRecordId), [allRecords, selectedRecordId]);
			const selected = selectedTemplate === void 0 ? void 0 : currentRecord(selectedTemplate);
			const resultSeq = activeTab === "output" ? selected?.cell.resultSeq : void 0;
			const [liveResult, setLiveResult] = (0, react.useState)();
			(0, react.useEffect)(() => {
				setLiveResult(void 0);
				if (resultSeq === void 0 || watchToolResult === void 0) return;
				let active = true;
				const dispose = watchToolResult(resultSeq, (value) => {
					if (active) setLiveResult({
						seq: resultSeq,
						owner: watchToolResult,
						value
					});
				});
				return () => {
					active = false;
					dispose();
				};
			}, [resultSeq, watchToolResult]);
			const resultValue = liveResult?.seq === resultSeq && liveResult?.owner === watchToolResult ? liveResult?.value : void 0;
			const selectedProgram = selected === void 0 ? void 0 : codeProgram(selected.cell);
			const thinkingExpanded = thinkingDisclosure?.recordId === selectedRecordId ? thinkingDisclosure.expanded : selected?.cell.kind === "message" && Boolean(selected.cell.thinkingDetail?.trim());
			const setThinkingExpanded = (expanded) => {
				if (selectedRecordId !== null) setThinkingDisclosure({
					recordId: selectedRecordId,
					expanded
				});
			};
			const selectedIndex = selected?.cell.index ?? null;
			(0, react.useEffect)(() => {
				onSelectedIndexChange?.(selectedIndex);
			}, [onSelectedIndexChange, selectedIndex]);
			const requestGroups = (0, react.useMemo)(() => new Set((sessionRequestNumbers ?? []).map((request) => requestKey(request.turn, request.group))), [sessionRequestNumbers]);
			const requestBoundaries = (0, react.useMemo)(() => indexRequestBoundaries(allRecords, requestGroups), [allRecords, requestGroups]);
			const requestNumbers = (0, react.useMemo)(() => indexRequestNumbers(sessionRequestNumbers), [sessionRequestNumbers]);
			const records = (0, react.useMemo)(() => {
				if (searchMatchIndexes !== null) return filterRecords(allRecords, searchMatchIndexes);
				const turnRecords = collapsedTurns.size === 0 ? allRecords : collapseTurnRecords(allRecords, collapsedTurns, requestGroups, t);
				const assistantRecords = collapsedAssistants.size === 0 ? turnRecords : collapseCallRecords(turnRecords, collapsedAssistants, "assistant", t);
				return collapsedTools.size === 0 ? assistantRecords : collapseCallRecords(assistantRecords, collapsedTools, "tool", t);
			}, [
				allRecords,
				collapsedAssistants,
				collapsedTools,
				collapsedTurns,
				requestGroups,
				searchMatchIndexes,
				t
			]);
			const projectedVirtualRows = (0, react.useMemo)(() => groupTrajectoryVirtualRows(records), [records]);
			const virtualRowStructure = useStableVirtualRowStructure(projectedVirtualRows);
			const virtualizationEnabled = hasOlderRecords || records.length > VIRTUALIZATION_THRESHOLD;
			const virtualScrollMargin = hasOlderRecords ? HISTORY_LOAD_ROW_HEIGHT_PX : 0;
			const estimateVirtualRowSize = (0, react.useCallback)((index) => virtualRowStructure[index]?.height ?? 30, [virtualRowStructure]);
			const getVirtualRowKey = (0, react.useCallback)((index) => virtualRowStructure[index]?.key ?? index, [virtualRowStructure]);
			const getTableScrollElement = (0, react.useCallback)(() => tablePaneRef.current, []);
			const rowVirtualizer = (0, _tanstack_react_virtual.useVirtualizer)({
				count: virtualizationEnabled ? virtualRowStructure.length : 0,
				enabled: virtualizationEnabled,
				estimateSize: estimateVirtualRowSize,
				getItemKey: getVirtualRowKey,
				getScrollElement: getTableScrollElement,
				initialRect: {
					width: 0,
					height: VIRTUAL_INITIAL_VIEWPORT_HEIGHT_PX
				},
				anchorTo: "end",
				overscan: VIRTUAL_OVERSCAN_ROWS,
				scrollMargin: virtualScrollMargin,
				scrollEndThreshold: BOTTOM_FOLLOW_THRESHOLD_PX,
				followOnAppend: "auto"
			});
			const virtualIndexByRecordId = (0, react.useMemo)(() => {
				const indexes = /* @__PURE__ */ new Map();
				for (const [virtualIndex, row] of projectedVirtualRows.entries()) for (const entry of row.entries) if (entry.record.collapsedSummary === void 0) indexes.set(trajectoryRecordId(entry.record.cell), virtualIndex);
				return indexes;
			}, [projectedVirtualRows]);
			const virtualItems = virtualizationEnabled ? rowVirtualizer.getVirtualItems() : [];
			const virtualTop = Math.max(0, (virtualItems[0]?.start ?? 0) - virtualScrollMargin);
			const virtualBottom = virtualItems.length === 0 ? 0 : Math.max(0, rowVirtualizer.getTotalSize() + virtualScrollMargin - (virtualItems.at(-1)?.end ?? 0));
			const renderedRecords = virtualizationEnabled ? virtualItems.flatMap((item) => {
				const row = projectedVirtualRows[item.index];
				if (row === void 0) return [];
				return row.entries.map((entry, entryIndex) => ({
					record: currentRecord(entry.record),
					position: entry.logicalIndex,
					terminalRequestBoundary: entry.record.cell.requestOnly === true && row.entries.at(-1)?.record.cell.requestOnly === true && entryIndex === row.entries.length - 1
				}));
			}) : records.map((record, position) => ({
				record: currentRecord(record),
				position,
				terminalRequestBoundary: record.cell.requestOnly === true && position === records.length - 1
			}));
			const requestBoundaryRuns = (0, react.useMemo)(() => indexRequestBoundaryRuns(records, requestGroups), [records, requestGroups]);
			const selectedPrompt = selected?.cell.kind === "system" ? selected.cell.promptDetail : void 0;
			const selectedPreviousPrompt = selected?.cell.kind === "system" ? selected.cell.previousPromptDetail : void 0;
			const selectedSystemPrompt = selectedPrompt?.system ?? selected?.cell.systemPromptDetail;
			const promptSelected = selectedSystemPrompt !== void 0;
			const selectedState = selected === void 0 ? void 0 : stateOf(selected);
			const selectedRequestInfo = selectedRequest === null ? void 0 : sessionRequestNumbers?.find((request) => requestIdentity(request) === selectedRequest.identity);
			const selectedRequestRecords = (0, react.useMemo)(() => selectedRequestInfo === void 0 ? [] : allRecords.filter((record) => record.turn === selectedRequestInfo.turn && record.group === selectedRequestInfo.group), [allRecords, selectedRequestInfo]).map(currentRecord);
			const selectedRequestAssistant = selectedRequestRecords.find((record) => record.cell.kind === "message" && record.cell.requestOnly !== true);
			const selectedRequestAnchor = selectedRequestAssistant ?? selectedRequestRecords[0];
			const selectedRequestNumber = selectedRequestInfo?.number;
			const selectedRequestState = selectedRequestInfo === void 0 ? void 0 : selectedRequestInfo.status ?? (selectedRequestAssistant?.cell.assistantMetrics?.completedTime === null ? "running" : selectedRequestAssistant === void 0 && selectedRequestRecords.some((record) => stateOf(record) === "running") ? "running" : "complete");
			const selectedRequestToolCalls = selectedRequestRecords.filter((record) => record.cell.kind === "tool").length;
			const selectedRequestSubtoolCalls = selectedRequestRecords.filter((record) => record.cell.kind === "subtool").length;
			const selectedRequestResultTemplate = selectedRequestInfo?.resultSeq === void 0 ? selectedRequestAssistant : allRecords.find((record) => record.cell.sourceSeq === selectedRequestInfo.resultSeq);
			const selectedRequestResult = selectedRequestResultTemplate === void 0 ? void 0 : currentRecord(selectedRequestResultTemplate);
			const selectedRequestUsage = selectedRequestInfo?.usage ?? (selectedRequestAssistant === void 0 ? void 0 : {
				...selectedRequestAssistant.cell.input === void 0 ? {} : { input: selectedRequestAssistant.cell.input },
				...selectedRequestAssistant.cell.cacheRead === void 0 ? {} : { cacheRead: selectedRequestAssistant.cell.cacheRead },
				...selectedRequestAssistant.cell.cacheWrite === void 0 ? {} : { cacheWrite: selectedRequestAssistant.cell.cacheWrite },
				...selectedRequestAssistant.cell.output === void 0 ? {} : { output: selectedRequestAssistant.cell.output },
				...selectedRequestAssistant.cell.think === void 0 ? {} : { reasoning: selectedRequestAssistant.cell.think }
			});
			const selectedRequestCumulativeUsage = selectedRequestInfo?.cumulativeUsage ?? selectedRequestUsage;
			const selectedRequestOptions = selectedRequestInfo?.requestConfig;
			const activeTurn = selectedRequestInfo === void 0 ? selected?.turn : selectedRequestInfo.turn;
			const activeSection = selectedRequestInfo === void 0 ? selected?.section : selectedRequestRecords[0]?.section;
			const selectedTabs = selectedRequestInfo !== void 0 ? REQUEST_TABS.filter((tab) => tab.id !== "options" || selectedRequestOptions !== void 0) : selected === void 0 ? [] : detailTabs(selected);
			const selectedParents = selected === void 0 ? {} : parentRecords(allRecords, selected);
			const selectedParentMessage = selectedParents.message;
			const selectedParentTool = selectedParents.tool;
			const selectedAssistantRequest = selected?.cell.kind === "message" ? requestNumbers.get(requestKey(selected.turn, selected.group)) : void 0;
			const selectedAssistantRequestInfo = selectedAssistantRequest === void 0 ? void 0 : sessionRequestNumbers?.find((request) => request.number === selectedAssistantRequest);
			const selectedAssistantRequestTarget = selectedAssistantRequestInfo === void 0 ? void 0 : { identity: requestIdentity(selectedAssistantRequestInfo) };
			const hasSelectedHierarchy = selectedAssistantRequestTarget !== void 0 || selectedParents.message !== void 0 || selectedParents.tool !== void 0;
			const splitStyle = toolRequestOffset === null ? void 0 : { "--trajectory-tool-request-width": `calc(58cqw - ${toolRequestOffset}px)` };
			const activateTab = (tab) => {
				setCodeWrappingOnOpen(stringWrapping?.getDefault() ?? false);
				tabHistory.current.delete(tab);
				tabHistory.current.add(tab);
				setActiveTab(tab);
			};
			const clearInspectorSelection = () => {
				setSelectedRecordId(null);
				setSelectedRequest(null);
			};
			const clearAllSelections = () => {
				clearInspectorSelection();
				onClearSelection?.();
			};
			const selectRecord = (0, react.useCallback)((index) => {
				setCodeWrappingOnOpen(stringWrapping?.getDefault() ?? false);
				const record = allRecords.find((candidate) => candidate.cell.index === index);
				onRecordSelect?.(index);
				setSelectedRequest(null);
				setSelectedRecordId(record === void 0 ? null : trajectoryRecordId(record.cell));
				if (record === void 0) return;
				const tabs = detailTabs(record);
				const available = new Set(tabs.map((tab) => tab.id));
				setActiveTab([...tabHistory.current].reverse().find((tab) => available.has(tab)) ?? tabs[0]?.id ?? "overview");
			}, [
				allRecords,
				onRecordSelect,
				stringWrapping
			]);
			(0, react.useEffect)(() => {
				if (recordSelection === null || appliedRecordSelection.current === recordSelection) return;
				appliedRecordSelection.current = recordSelection;
				selectRecord(recordSelection.index);
				const record = allRecords.find((candidate) => candidate.cell.index === recordSelection.index);
				pendingScrollRecordId.current = record === void 0 ? null : trajectoryRecordId(record.cell);
			}, [
				allRecords,
				recordSelection,
				selectRecord
			]);
			(0, react.useEffect)(() => {
				if (recordFocus === null || appliedRecordFocus.current === recordFocus) return;
				appliedRecordFocus.current = recordFocus;
				const record = allRecords.find((candidate) => candidate.cell.index === recordFocus.index);
				pendingScrollRecordId.current = record === void 0 ? null : trajectoryRecordId(record.cell);
			}, [allRecords, recordFocus]);
			const selectRequest = (request, tab = "overview") => {
				setSelectedRecordId(null);
				setSelectedRequest(request);
				activateTab(tab);
			};
			const openRecordSummary = (target) => {
				const targetAt = allRecords.findIndex((record) => record.cell.index === target.cell.index);
				if (target.turn !== null && collapsedTurns.has(target.turn)) onToggleTurn(target.turn);
				if (target.cell.kind === "subtool") for (let i = targetAt - 1; i >= 0; i--) {
					const candidate = allRecords[i];
					if (candidate === void 0 || candidate.cell.kind === "subtool") continue;
					if (candidate.cell.kind === "tool") {
						const toolId = trajectoryRecordId(candidate.cell);
						if (collapsedTools.has(toolId)) onToggleTool(toolId);
					}
					break;
				}
				if (target.cell.kind === "tool" || target.cell.kind === "subtool") for (let i = targetAt - 1; i >= 0; i--) {
					const candidate = allRecords[i];
					if (candidate === void 0 || candidate.turn !== target.turn) break;
					if (candidate.cell.kind !== "message") continue;
					const assistantId = trajectoryRecordId(candidate.cell);
					if (collapsedAssistants.has(assistantId)) onToggleAssistant(assistantId);
					break;
				}
				setSelectedRequest(null);
				setSelectedRecordId(trajectoryRecordId(target.cell));
				activateTab("overview");
			};
			const openCallSummary = (callId) => {
				const target = allRecords.find((record) => record.cell.callId === callId);
				if (target !== void 0) openRecordSummary(target);
			};
			const expandSummary = (record, kind) => {
				switch (kind) {
					case "turn":
						if (record.turn !== null) onToggleTurn(record.turn);
						return;
					case "tool":
						onToggleTool(trajectoryRecordId(record.cell));
						return;
					case "assistant":
						onToggleAssistant(trajectoryRecordId(record.cell));
						return;
					default: assertNever(kind);
				}
			};
			const openRecordSummaryRef = (0, react.useRef)(openRecordSummary);
			openRecordSummaryRef.current = openRecordSummary;
			(0, react.useEffect)(() => {
				if (inspectCallId === null) return;
				const target = flattenRecords(turns).find((record) => record.cell.callId === inspectCallId);
				if (target === void 0) return;
				openRecordSummaryRef.current(target);
				pendingScrollRecordId.current = trajectoryRecordId(target.cell);
				onInspectApplied?.();
			}, [
				inspectCallId,
				turns,
				onInspectApplied
			]);
			(0, react.useEffect)(() => {
				const id = pendingScrollRecordId.current;
				if (id === null) return;
				const position = records.findIndex((record) => trajectoryRecordId(record.cell) === id && record.collapsedSummary === void 0);
				if (position === -1) return;
				if (virtualizationEnabled) {
					const virtualIndex = virtualIndexByRecordId.get(id);
					if (virtualIndex === void 0) return;
					pendingScrollRecordId.current = null;
					followsTableTail.current = false;
					rowVirtualizer.scrollToIndex(virtualIndex, {
						behavior: "smooth",
						align: "center"
					});
					return;
				}
				pendingScrollRecordId.current = null;
				followsTableTail.current = false;
				const recordIndex = records[position]?.cell.index;
				const row = recordIndex === void 0 ? null : rootRef.current?.querySelector(`tr[data-record-index="${recordIndex}"]`);
				/* v8 ignore next -- jsdom lacks scrollIntoView; browsers always have it. */
				if (row !== void 0 && row !== null && typeof row.scrollIntoView === "function") row.scrollIntoView({
					behavior: "smooth",
					block: "center"
				});
			}, [
				records,
				rowVirtualizer,
				virtualIndexByRecordId,
				virtualizationEnabled
			]);
			(0, react.useEffect)(() => {
				if (timelineFocusIndexes === null || timelineFocusIndexes.size === 0) return;
				const focusedPositions = records.flatMap((record, position) => record.collapsedSummary === void 0 && record.cell.requestOnly !== true && timelineFocusIndexes.has(record.cell.index) ? [position] : []);
				const first = focusedPositions.at(0);
				const last = focusedPositions.at(-1);
				if (first === void 0 || last === void 0) return;
				if (!virtualizationEnabled) {
					const ledger = rootRef.current;
					if (ledger === null) return;
					const focusedRows = [...ledger.querySelectorAll("tr[data-timeline-focus=\"inside\"]")];
					const firstRow = focusedRows.at(0);
					const lastRow = focusedRows.at(-1);
					if (firstRow === void 0 || lastRow === void 0) return;
					const focusHeight = lastRow.getBoundingClientRect().bottom - firstRow.getBoundingClientRect().top;
					const target = focusHeight > ledger.clientHeight ? firstRow : focusedRows[Math.floor((focusedRows.length - 1) / 2)];
					/* v8 ignore next -- jsdom lacks scrollIntoView; browsers always have it. */
					if (target !== void 0 && typeof target.scrollIntoView === "function") {
						followsTableTail.current = false;
						target.scrollIntoView({
							behavior: "smooth",
							block: focusHeight > ledger.clientHeight ? "start" : "center"
						});
					}
					return;
				}
				const focusedVirtualIndexes = [...new Set(focusedPositions.flatMap((position) => {
					const record = records[position];
					if (record === void 0) return [];
					const virtualIndex = virtualIndexByRecordId.get(trajectoryRecordId(record.cell));
					return virtualIndex === void 0 ? [] : [virtualIndex];
				}))].sort((left, right) => left - right);
				const firstVirtual = focusedVirtualIndexes.at(0);
				const lastVirtual = focusedVirtualIndexes.at(-1);
				if (firstVirtual === void 0 || lastVirtual === void 0) return;
				const paneHeight = tablePaneRef.current?.clientHeight ?? 0;
				const focusHeight = projectedVirtualRows.slice(firstVirtual, lastVirtual + 1).reduce((height, row) => height + row.height, 0);
				followsTableTail.current = false;
				rowVirtualizer.scrollToIndex(focusHeight > paneHeight ? firstVirtual : focusedVirtualIndexes[Math.floor((focusedVirtualIndexes.length - 1) / 2)] ?? firstVirtual, {
					behavior: "smooth",
					align: focusHeight > paneHeight ? "start" : "center"
				});
			}, [
				projectedVirtualRows,
				records,
				rowVirtualizer,
				timelineFocusIndexes,
				virtualIndexByRecordId,
				virtualizationEnabled
			]);
			const requestOlder = (0, react.useCallback)((pane, requireTop) => {
				if (!hasOlderRecords || onLoadOlder === void 0 || loadingOlder.current || olderHistoryLoading || requireTop && pane.scrollTop > OLDER_LOAD_THRESHOLD_PX) return;
				loadingOlder.current = true;
				setOlderLoading(true);
				olderLoadAnchor.current = {
					historyStartSeq,
					scrollHeight: pane.scrollHeight,
					scrollTop: pane.scrollTop
				};
				onLoadOlder().then((advanced) => {
					if (!advanced) olderLoadAnchor.current = null;
				}).finally(() => {
					loadingOlder.current = false;
					setOlderLoading(false);
				});
			}, [
				hasOlderRecords,
				historyStartSeq,
				olderHistoryLoading,
				onLoadOlder
			]);
			(0, react.useLayoutEffect)(() => {
				const pane = tablePaneRef.current;
				if (pane === null) return;
				const anchor = olderLoadAnchor.current;
				if (anchor !== null && anchor.historyStartSeq !== historyStartSeq) {
					if (!virtualizationEnabled) pane.scrollTop = anchor.scrollTop + pane.scrollHeight - anchor.scrollHeight;
					olderLoadAnchor.current = null;
					followsTableTail.current = false;
					return;
				}
				if (!tableScrollInitialized.current) {
					if (historyLoading) return;
					tableScrollInitialized.current = true;
					followsTableTail.current = true;
					if (virtualizationEnabled) rowVirtualizer.scrollToEnd({ behavior: "auto" });
					else pane.scrollTop = pane.scrollHeight;
					setTableScrollReady(true);
					return;
				}
				if (!followsTableTail.current) return;
				if (!virtualizationEnabled) pane.scrollTop = pane.scrollHeight;
			}, [
				historyLoading,
				historyStartSeq,
				rowVirtualizer,
				virtualRowStructure,
				virtualizationEnabled
			]);
			const olderBusy = olderHistoryLoading || olderLoading;
			const showInitialLoading = historyLoading || !tableScrollReady;
			const historyRowOffset = hasOlderRecords ? 1 : 0;
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: TrajectoryTable_module_css_default.split,
				style: splitStyle,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					ref: tablePaneRef,
					className: TrajectoryTable_module_css_default.tablePane,
					"data-trajectory-scroll": "",
					onScroll: (event) => {
						const pane = event.currentTarget;
						followsTableTail.current = pane.scrollHeight - pane.clientHeight - pane.scrollTop <= BOTTOM_FOLLOW_THRESHOLD_PX;
						requestOlder(pane, true);
					},
					onClick: (event) => {
						if (event.target === event.currentTarget) clearAllSelections();
					},
					children: [showInitialLoading && (0, react_jsx_runtime.jsx)("div", {
						className: TrajectoryTable_module_css_default.historyLoading,
						role: "status",
						"aria-live": "polite",
						children: (0, react_jsx_runtime.jsxs)("span", {
							className: TrajectoryTable_module_css_default.historyLoadingBar,
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" }), t("history.loadingTrajectory")]
						})
					}), (0, react_jsx_runtime.jsxs)("table", {
						className: TrajectoryTable_module_css_default.table,
						"data-scroll-ready": tableScrollReady || void 0,
						"aria-rowcount": records.length + historyRowOffset,
						children: [(0, react_jsx_runtime.jsxs)("colgroup", { children: [(0, react_jsx_runtime.jsx)("col", { className: TrajectoryTable_module_css_default.eventColumn }), (0, react_jsx_runtime.jsx)("col", { className: TrajectoryTable_module_css_default.contentColumn })] }), (0, react_jsx_runtime.jsxs)("tbody", { children: [
							hasOlderRecords && (0, react_jsx_runtime.jsx)("tr", {
								className: TrajectoryTable_module_css_default.historyLoadRow,
								"data-history-load": "",
								"aria-rowindex": 1,
								children: (0, react_jsx_runtime.jsx)("td", {
									colSpan: 2,
									children: (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: TrajectoryTable_module_css_default.historyLoadButton,
										disabled: olderBusy || onLoadOlder === void 0,
										"aria-label": olderBusy ? t("history.loadingEarlierAria") : t("history.loadEarlier"),
										onClick: () => {
											const pane = tablePaneRef.current;
											if (pane !== null) requestOlder(pane, false);
										},
										children: [
											olderBusy && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" }),
											(0, react_jsx_runtime.jsx)("span", {
												"aria-hidden": "true",
												children: olderBusy ? t("history.loadingEarlier") : t("history.loadEarlier")
											}),
											(0, react_jsx_runtime.jsx)("span", {
												className: TrajectoryTable_module_css_default.visuallyHidden,
												role: "status",
												"aria-live": "polite",
												children: olderBusy ? t("history.loadingEarlier") : ""
											})
										]
									})
								})
							}),
							virtualTop > 0 && (0, react_jsx_runtime.jsx)("tr", {
								className: TrajectoryTable_module_css_default.virtualSpacer,
								"data-virtual-spacer": "top",
								"aria-hidden": "true",
								children: (0, react_jsx_runtime.jsx)("td", {
									colSpan: 2,
									style: { "--trajectory-virtual-spacer-height": `${virtualTop}px` }
								})
							}),
							renderedRecords.map(({ record, position, terminalRequestBoundary }) => (0, react_jsx_runtime.jsx)(RecordPresentation, {
								cell: record.cell,
								t,
								children: ({ displayText, listDisplayText, resultText, toolCallOnly, toolCallText }) => {
									const summaryKind = record.collapsedSummaryKind;
									const isCollapsedSummary = summaryKind !== void 0;
									const isRequestOnly = record.cell.requestOnly === true;
									const isInitialSystem = record.cell.kind === "system" && record.cell.index === allRecords[0]?.cell.index;
									const key = requestKey(record.turn, record.group);
									const request = requestBoundaries.get(key) === record.cell.index && !isCollapsedSummary && (record.turn === null || !collapsedTurns.has(record.turn)) ? requestNumbers.get(key) : void 0;
									const requestInfo = request === void 0 ? void 0 : sessionRequestNumbers?.find((candidate) => candidate.number === request);
									const requestStatus = requestInfo?.status ?? (record.cell.isError === true ? "error" : void 0);
									const requestRunIndex = requestBoundaryRuns.get(record.cell.index) ?? 0;
									const requestBoundaryStyle = { "--request-boundary-offset": `${requestRunIndex * 8}px` };
									const requestLabel = request === void 0 ? void 0 : t(requestInfo?.purpose === "compaction" ? "request.labelCompaction" : "request.label", { request });
									const requestSelected = requestInfo !== void 0 && selectedRequest?.identity === requestIdentity(requestInfo);
									const sectionActive = record.turn === null ? activeSection === record.section : activeTurn === record.turn;
									const singleToolNotice = record.cell.kind === "context" && record.cell.sourceBlocks?.length === 1 && record.cell.sourceBlocks.every((block) => block.type === "tool-addition" || block.type === "tool-removal");
									return (0, react_jsx_runtime.jsxs)("tr", {
										tabIndex: isRequestOnly || singleToolNotice ? -1 : 0,
										"aria-rowindex": position + 1 + historyRowOffset,
										"aria-label": isCollapsedSummary ? t("request.collapsedSummary", {
											kind: t(COLLAPSED_SUMMARY_LABEL_KEY[summaryKind]),
											summary: record.collapsedSummary
										}) : isRequestOnly ? t("request.rowAriaCompaction", { request: request ?? "" }) : t("request.rowAria", {
											request: request === void 0 ? "" : t("request.rowPrefix", { request }),
											kind: t(KIND_LABEL_KEY[record.cell.kind]),
											content: listDisplayText || t("request.noContent")
										}),
										"aria-selected": !isCollapsedSummary && !isRequestOnly && selectedIndex === record.cell.index,
										"data-kind": record.cell.kind,
										"data-trajectory-row-key": trajectoryVirtualRecordKey(record),
										"data-virtual-position": virtualizationEnabled ? position : void 0,
										"data-record-index": !isCollapsedSummary && !isRequestOnly ? record.cell.index : void 0,
										"data-request-only": isRequestOnly || void 0,
										"data-terminal-request-boundary": terminalRequestBoundary || void 0,
										"data-group-start": record.groupStart || void 0,
										"data-turn-start": record.turnStart || void 0,
										"data-error": record.cell.isError || void 0,
										"data-running": stateOf(record) === "running" || void 0,
										"data-turn-end": record.turnEnd || void 0,
										"data-collapsed-summary": record.collapsedSummaryKind,
										"data-selected": !isCollapsedSummary && selectedIndex === record.cell.index || void 0,
										"data-timeline-focus": isCollapsedSummary || timelineFocusIndexes === null ? void 0 : timelineFocusIndexes.has(record.cell.index) ? "inside" : "outside",
										onClick: isRequestOnly || singleToolNotice ? void 0 : isCollapsedSummary ? () => {
											expandSummary(record, summaryKind);
										} : () => {
											selectRecord(record.cell.index);
										},
										onDoubleClick: (event) => {
											if (isCollapsedSummary || isRequestOnly || singleToolNotice) return;
											if (record.turn !== null && collapsedTurns.has(record.turn)) {
												event.preventDefault();
												onToggleTurn(record.turn);
												return;
											}
											if (record.cell.kind === "message" && assistantToolCalls(allRecords, record.cell.index).length > 0) {
												event.preventDefault();
												onToggleAssistant(trajectoryRecordId(record.cell));
												return;
											}
											if (!record.turnStart) return;
											if (record.turn === null) return;
											if (allRecords.filter((candidate) => candidate.turn === record.turn && candidate.cell.requestOnly !== true && candidate.cell.kind !== "system").length <= 1) return;
											event.preventDefault();
											onToggleTurn(record.turn);
										},
										onKeyDown: (event) => {
											if (isRequestOnly || singleToolNotice) return;
											if (event.key !== "Enter" && event.key !== " ") return;
											event.preventDefault();
											if (isCollapsedSummary) {
												expandSummary(record, summaryKind);
												return;
											}
											selectRecord(record.cell.index);
										},
										children: [(0, react_jsx_runtime.jsxs)("td", {
											className: TrajectoryTable_module_css_default.event,
											children: [
												request !== void 0 && (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: requestSelected ? `${TrajectoryTable_module_css_default.requestBoundaryControl} ${TrajectoryTable_module_css_default.requestBoundaryControlActive}` : TrajectoryTable_module_css_default.requestBoundaryControl,
													"aria-label": requestLabel,
													"aria-pressed": requestSelected,
													"data-label": requestLabel,
													"data-request-run-index": requestRunIndex,
													"data-request-status": requestStatus,
													style: requestBoundaryStyle,
													onClick: (event) => {
														event.stopPropagation();
														if (requestInfo !== void 0) selectRequest({ identity: requestIdentity(requestInfo) });
													},
													onDoubleClick: (event) => {
														event.stopPropagation();
													}
												}),
												record.turn !== null && activeTurn === record.turn && !isInitialSystem && (0, react_jsx_runtime.jsx)("span", {
													className: TrajectoryTable_module_css_default.turnRail,
													"aria-hidden": "true"
												}),
												!isCollapsedSummary && selectedIndex === record.cell.index && (0, react_jsx_runtime.jsx)("span", {
													className: TrajectoryTable_module_css_default.selectionRail,
													"aria-hidden": "true"
												}),
												!isCollapsedSummary && !isRequestOnly && record.turnStart && (0, react_jsx_runtime.jsx)("span", {
													className: sectionActive ? `${TrajectoryTable_module_css_default.turnLabel} ${TrajectoryTable_module_css_default.turnLabelActive}` : TrajectoryTable_module_css_default.turnLabel,
													"aria-label": sectionLabel(record.turn, t),
													children: record.turn === null ? sectionLabel(record.turn, t) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
														className: TrajectoryTable_module_css_default.turnLabelFull,
														"aria-hidden": "true",
														children: sectionLabel(record.turn, t)
													}), (0, react_jsx_runtime.jsxs)("span", {
														className: TrajectoryTable_module_css_default.turnLabelCompact,
														"aria-hidden": "true",
														children: ["#", record.turn]
													})] })
												}),
												(0, react_jsx_runtime.jsx)("div", {
													className: TrajectoryTable_module_css_default.eventInner,
													children: !isCollapsedSummary && !isRequestOnly && (0, react_jsx_runtime.jsx)("span", {
														className: TrajectoryTable_module_css_default.kindSlot,
														children: (0, react_jsx_runtime.jsxs)("span", {
															className: `${TrajectoryTable_module_css_default.kindTag} ${record.cell.kind === "system" ? TrajectoryTable_module_css_default.systemNeutral : record.cell.kind === "context" ? TrajectoryTable_module_css_default.contextGreen : record.cell.kind === "compacted" ? TrajectoryTable_module_css_default.compacted : record.cell.kind === "tool" ? TrajectoryTable_module_css_default.toolAmber : record.cell.kind === "message" ? TrajectoryTable_module_css_default.assistantVioletBright : record.cell.kind === "subtool" ? TrajectoryTable_module_css_default.subtoolAmber : TrajectoryTable_module_css_default[record.cell.kind]}`,
															"data-role-kind": record.cell.kind,
															children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
																label: t(KIND_LABEL_KEY[record.cell.kind]),
																side: "right",
																children: (0, react_jsx_runtime.jsx)("span", {
																	className: TrajectoryTable_module_css_default.kindTagIcon,
																	"aria-hidden": "true",
																	children: KIND_ICON[record.cell.kind]
																})
															}), (0, react_jsx_runtime.jsx)("span", {
																className: TrajectoryTable_module_css_default.kindTagLabel,
																children: t(KIND_LABEL_KEY[record.cell.kind])
															})]
														})
													})
												})
											]
										}), (0, react_jsx_runtime.jsx)("td", {
											className: TrajectoryTable_module_css_default.content,
											children: isRequestOnly ? null : record.collapsedSummary !== void 0 ? (0, react_jsx_runtime.jsxs)("span", {
												className: TrajectoryTable_module_css_default.collapsedTurnContent,
												title: record.collapsedSummary,
												children: [(0, react_jsx_runtime.jsx)("span", {
													className: TrajectoryTable_module_css_default.collapsedTurnEllipsis,
													children: "…"
												}), (0, react_jsx_runtime.jsx)("span", {
													className: TrajectoryTable_module_css_default.collapsedTurnText,
													children: record.collapsedSummary
												})]
											}) : (0, react_jsx_runtime.jsxs)("span", {
												className: resultText === void 0 ? TrajectoryTable_module_css_default.contentText : TrajectoryTable_module_css_default.resultPreview,
												title: resultText === void 0 ? listDisplayText : `${listDisplayText} → ${resultText}`,
												children: [(0, react_jsx_runtime.jsx)("span", {
													className: resultText === void 0 ? void 0 : TrajectoryTable_module_css_default.resultRequest,
													children: (0, react_jsx_runtime.jsx)(RecordListText, {
														displayText,
														toolCallOnly,
														toolCallText,
														t
													})
												}), resultText !== void 0 && (0, react_jsx_runtime.jsxs)("span", {
													className: record.cell.isError ? `${TrajectoryTable_module_css_default.inlineResult} ${TrajectoryTable_module_css_default.error}` : TrajectoryTable_module_css_default.inlineResult,
													children: [(0, react_jsx_runtime.jsx)("span", {
														className: TrajectoryTable_module_css_default.arrow,
														children: "→"
													}), (0, react_jsx_runtime.jsx)("span", {
														className: resultText === t("record.noOutput") ? `${TrajectoryTable_module_css_default.inlineResultText} ${TrajectoryTable_module_css_default.noOutputText}` : TrajectoryTable_module_css_default.inlineResultText,
														children: resultText
													})]
												})]
											})
										})]
									});
								}
							}, trajectoryVirtualRecordKey(record))),
							virtualBottom > 0 && (0, react_jsx_runtime.jsx)("tr", {
								className: TrajectoryTable_module_css_default.virtualSpacer,
								"data-virtual-spacer": "bottom",
								"aria-hidden": "true",
								children: (0, react_jsx_runtime.jsx)("td", {
									colSpan: 2,
									style: { "--trajectory-virtual-spacer-height": `${virtualBottom}px` }
								})
							})
						] })]
					})]
				}), (selectedRequestInfo !== void 0 || promptSelected || selected !== void 0 && selectedState !== void 0) && (0, react_jsx_runtime.jsxs)("aside", {
					className: TrajectoryTable_module_css_default.details,
					"aria-label": t("details.event"),
					style: detailsWidth === null ? void 0 : { width: detailsWidth },
					children: [
						(0, react_jsx_runtime.jsx)("div", {
							className: TrajectoryTable_module_css_default.detailsResizeHandle,
							role: "separator",
							"aria-label": t("details.resize"),
							"aria-controls": "trajectory-detail-panel",
							"aria-orientation": "vertical",
							tabIndex: 0,
							title: t("details.resizeTitle"),
							onDoubleClick: () => {
								setDetailsWidth(null);
								setToolRequestOffset(null);
							},
							onPointerDown: (event) => {
								if (event.button !== 0) return;
								const details = event.currentTarget.parentElement;
								if (details === null) return;
								const split = details.parentElement;
								if (split === null) return;
								const splitWidth = split.getBoundingClientRect().width;
								detailsResizeDrag.current = {
									pointerId: event.pointerId,
									startX: event.clientX,
									startWidth: details.getBoundingClientRect().width,
									splitWidth,
									startToolRequestOffset: toolRequestOffset ?? splitWidth * TOOL_REQUEST_SHARE - defaultToolRequestWidth(splitWidth)
								};
								event.currentTarget.setPointerCapture(event.pointerId);
								event.preventDefault();
							},
							onPointerMove: (event) => {
								const drag = detailsResizeDrag.current;
								if (drag === null || drag.pointerId !== event.pointerId) return;
								const nextDetailsWidth = clampDetailsWidth(drag.startWidth + drag.startX - event.clientX, drag.splitWidth);
								setDetailsWidth(nextDetailsWidth);
								setToolRequestOffset(drag.startToolRequestOffset + (nextDetailsWidth - drag.startWidth) * TOOL_REQUEST_SHARE);
							},
							onPointerUp: (event) => {
								if (detailsResizeDrag.current?.pointerId !== event.pointerId) return;
								detailsResizeDrag.current = null;
								event.currentTarget.releasePointerCapture(event.pointerId);
							},
							onPointerCancel: () => {
								detailsResizeDrag.current = null;
							},
							onKeyDown: (event) => {
								if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
								const details = event.currentTarget.parentElement;
								if (details === null) return;
								const split = details.parentElement;
								if (split === null) return;
								const direction = event.key === "ArrowLeft" ? 1 : -1;
								const currentDetailsWidth = details.getBoundingClientRect().width;
								const splitWidth = split.getBoundingClientRect().width;
								const nextDetailsWidth = clampDetailsWidth(currentDetailsWidth + direction * DETAILS_RESIZE_STEP, splitWidth);
								const currentToolRequestOffset = toolRequestOffset ?? splitWidth * TOOL_REQUEST_SHARE - defaultToolRequestWidth(splitWidth);
								setDetailsWidth(nextDetailsWidth);
								setToolRequestOffset(currentToolRequestOffset + (nextDetailsWidth - currentDetailsWidth) * TOOL_REQUEST_SHARE);
								event.preventDefault();
							}
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: TrajectoryTable_module_css_default.detailsHeader,
							children: [(0, react_jsx_runtime.jsx)("div", {
								className: TrajectoryTable_module_css_default.detailsTitle,
								children: selectedRequestInfo !== void 0 ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: TrajectoryTable_module_css_default.requestDetailsDot,
										"aria-hidden": "true"
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: TrajectoryTable_module_css_default.requestDetailsName,
										children: t("request.label", { request: selectedRequestNumber ?? "—" })
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: TrajectoryTable_module_css_default.detailsLocation,
										children: selectedRequestInfo.purpose === "compaction" ? t("request.compaction", { section: sectionLabel(selectedRequestInfo.turn, t) }) : sectionLabel(selectedRequestInfo.turn, t)
									})
								] }) : promptSelected ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
									className: `${TrajectoryTable_module_css_default.kindTag} ${TrajectoryTable_module_css_default.systemNeutral}`,
									children: t("kind.system")
								}), (0, react_jsx_runtime.jsx)("span", {
									className: TrajectoryTable_module_css_default.detailsLocation,
									children: selected?.cell.text
								})] }) : selected !== void 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
									className: `${TrajectoryTable_module_css_default.kindTag} ${selected.cell.kind === "context" ? TrajectoryTable_module_css_default.contextGreen : selected.cell.kind === "compacted" ? TrajectoryTable_module_css_default.compacted : selected.cell.kind === "tool" ? TrajectoryTable_module_css_default.toolAmber : selected.cell.kind === "message" ? TrajectoryTable_module_css_default.assistantVioletBright : selected.cell.kind === "subtool" ? TrajectoryTable_module_css_default.subtoolAmber : TrajectoryTable_module_css_default[selected.cell.kind]}`,
									children: t(KIND_LABEL_KEY[selected.cell.kind])
								}), (0, react_jsx_runtime.jsx)("span", {
									className: TrajectoryTable_module_css_default.detailsLocation,
									children: selected.cell.kind === "compacted" ? sectionLabel(selected.turn, t) : `${sectionLabel(selected.turn, t)} · ${selected.group}`
								})] })
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: TrajectoryTable_module_css_default.close,
								"aria-label": t("details.close"),
								onClick: clearInspectorSelection,
								children: (0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: "×"
								})
							})]
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: TrajectoryTable_module_css_default.detailTabs,
							role: "tablist",
							"aria-label": t("details.event"),
							children: selectedTabs.map((tab) => (0, react_jsx_runtime.jsx)("button", {
								id: `trajectory-detail-${tab.id}`,
								type: "button",
								role: "tab",
								"aria-controls": "trajectory-detail-panel",
								"aria-selected": activeTab === tab.id,
								className: activeTab === tab.id ? `${TrajectoryTable_module_css_default.detailTab} ${TrajectoryTable_module_css_default.detailTabActive}` : TrajectoryTable_module_css_default.detailTab,
								onClick: () => {
									activateTab(tab.id);
								},
								children: t(tab.labelKey)
							}, tab.id))
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							id: "trajectory-detail-panel",
							className: activeTab === "overview" ? `${TrajectoryTable_module_css_default.detailBody} ${TrajectoryTable_module_css_default.detailBodySummary}` : selectedProgram !== void 0 && activeTab === "input" ? `${TrajectoryTable_module_css_default.detailBody} ${TrajectoryTable_module_css_default.detailBodyProgram}` : TrajectoryTable_module_css_default.detailBody,
							role: "tabpanel",
							"aria-labelledby": `trajectory-detail-${activeTab}`,
							children: [
								selectedRequestInfo !== void 0 && selectedRequestState !== void 0 && activeTab === "overview" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("dl", {
									className: `${TrajectoryTable_module_css_default.overview} ${TrajectoryTable_module_css_default.summaryScrollRegion}`,
									"data-summary-scroll-region": "",
									children: [
										(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("details.status") }), (0, react_jsx_runtime.jsx)("dd", {
											className: selectedRequestState === "error" ? TrajectoryTable_module_css_default.error : void 0,
											children: statusLabel(selectedRequestState, t)
										})] }),
										selectedRequestInfo.purpose === "compaction" && (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("details.purpose") }), (0, react_jsx_runtime.jsx)("dd", { children: t("request.compactionPurpose") })] }),
										(selectedRequestInfo.provider ?? selectedRequestInfo.requestConfig?.provider) !== void 0 && (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("details.provider") }), (0, react_jsx_runtime.jsx)("dd", { children: selectedRequestInfo.provider ?? selectedRequestInfo.requestConfig?.provider })] }),
										(selectedRequestInfo.model ?? selectedRequestInfo.requestConfig?.model) !== void 0 && (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("details.model") }), (0, react_jsx_runtime.jsx)("dd", { children: selectedRequestInfo.model ?? selectedRequestInfo.requestConfig?.model })] }),
										(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("details.toolCalls") }), (0, react_jsx_runtime.jsx)("dd", { children: selectedRequestToolCalls })] }),
										selectedRequestSubtoolCalls > 0 && (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("details.subtoolCalls") }), (0, react_jsx_runtime.jsx)("dd", { children: selectedRequestSubtoolCalls })] }),
										selectedRequestInfo.error !== void 0 && (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t(selectedRequestState !== "error" && selectedRequestInfo.retry !== void 0 ? "details.lastAttemptError" : "details.error") }), (0, react_jsx_runtime.jsx)("dd", {
											className: selectedRequestState === "error" ? TrajectoryTable_module_css_default.error : void 0,
											children: requestErrorMessage(selectedRequestInfo, t)
										})] }),
										selectedRequestInfo.retry !== void 0 && (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("details.retry") }), (0, react_jsx_runtime.jsx)("dd", { children: selectedRequestInfo.maxRetries === void 0 ? selectedRequestInfo.retry : t("request.retryProgress", {
											retry: selectedRequestInfo.retry,
											maximum: selectedRequestInfo.maxRetries
										}) })] }),
										selectedRequestInfo.retryDelayMs !== void 0 && (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("details.retryDelay") }), (0, react_jsx_runtime.jsx)("dd", { children: formatDurationMs(selectedRequestInfo.retryDelayMs, t) })] }),
										selectedRequestResult !== void 0 && (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("details.result") }), (0, react_jsx_runtime.jsx)("dd", {
											className: TrajectoryTable_module_css_default.overviewParentLinks,
											children: (0, react_jsx_runtime.jsxs)("button", {
												type: "button",
												className: TrajectoryTable_module_css_default.overviewHierarchyNavLink,
												onClick: () => {
													openRecordSummary(selectedRequestResult);
												},
												children: [(0, react_jsx_runtime.jsx)("span", { children: selectedRequestInfo.purpose === "compaction" ? t("details.compacted") : t("details.assistantMessage") }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {
													className: TrajectoryTable_module_css_default.overviewHierarchyJumpIconTight,
													size: 11
												})]
											})
										})] })
									]
								}), (0, react_jsx_runtime.jsxs)("div", {
									className: TrajectoryTable_module_css_default.overviewSections,
									children: [
										selectedRequestOptions !== void 0 && (0, react_jsx_runtime.jsx)(OverviewSection, {
											label: t("tab.options"),
											onOpen: () => {
												activateTab("options");
											},
											children: (0, react_jsx_runtime.jsx)(RequestOptions, {
												options: selectedRequestOptions,
												preview: true,
												stringWrapping,
												t
											})
										}),
										(0, react_jsx_runtime.jsx)(OverviewSection, {
											label: t("tab.usage"),
											onOpen: () => {
												activateTab("usage");
											},
											children: (0, react_jsx_runtime.jsx)(UsageRows, {
												usage: selectedRequestUsage,
												t
											})
										}),
										(0, react_jsx_runtime.jsx)(OverviewSection, {
											label: t("tab.timing"),
											onOpen: () => {
												activateTab("timing");
											},
											children: (0, react_jsx_runtime.jsx)(RequestTiming, {
												assistant: selectedRequestAssistant,
												anchor: selectedRequestAnchor,
												request: selectedRequestInfo,
												preview: true,
												t
											})
										})
									]
								})] }),
								selectedRequestInfo !== void 0 && activeTab === "options" && (0, react_jsx_runtime.jsx)(RequestOptions, {
									options: selectedRequestOptions,
									stringWrapping,
									t
								}),
								selectedRequestInfo !== void 0 && activeTab === "usage" && (0, react_jsx_runtime.jsx)(RequestUsagePanel, {
									usage: selectedRequestUsage,
									cumulative: selectedRequestCumulativeUsage,
									t
								}),
								selectedRequestInfo !== void 0 && activeTab === "timing" && (0, react_jsx_runtime.jsx)(RequestTiming, {
									assistant: selectedRequestAssistant,
									anchor: selectedRequestAnchor,
									request: selectedRequestInfo,
									t
								}),
								selectedPrompt !== void 0 && selectedPreviousPrompt !== void 0 && activeTab === "diff" && (0, react_jsx_runtime.jsx)(SystemPromptDiff, {
									before: selectedPreviousPrompt,
									after: selectedPrompt,
									t
								}),
								promptSelected && activeTab === "system-prompt" && (selectedSystemPrompt === "" ? (0, react_jsx_runtime.jsx)("p", {
									className: TrajectoryTable_module_css_default.noPayload,
									children: t("record.systemPromptMissing")
								}) : (0, react_jsx_runtime.jsx)("div", {
									className: `${TrajectoryTable_module_css_default.markdownPayload} ${TrajectoryTable_module_css_default.systemPrompt}`,
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
										text: selectedSystemPrompt,
										labels: markdownLabels(t)
									})
								})),
								selectedPrompt !== void 0 && activeTab === "tools" && (0, react_jsx_runtime.jsx)(ToolCatalog, {
									tools: selectedPrompt.tools,
									stringWrapping,
									t
								}),
								!promptSelected && selected?.cell.kind === "compacted" && selectedState !== void 0 && activeTab === "overview" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("dl", {
									className: `${TrajectoryTable_module_css_default.overview} ${TrajectoryTable_module_css_default.summaryScrollRegion}`,
									"data-summary-scroll-region": "",
									children: [
										(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("details.status") }), (0, react_jsx_runtime.jsx)("dd", {
											className: selectedState === "error" ? TrajectoryTable_module_css_default.error : void 0,
											children: statusLabel(selectedState, t)
										})] }),
										(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("timing.duration") }), (0, react_jsx_runtime.jsx)("dd", { children: formatElapsedSeconds(selected.cell.timeSeconds, t) })] }),
										(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("usage.tokens") }), (0, react_jsx_runtime.jsx)("dd", { children: "—" })] })
									]
								}), selected.cell.outputDetail !== void 0 && (0, react_jsx_runtime.jsx)("div", {
									className: `${TrajectoryTable_module_css_default.compactedSummary} ${TrajectoryTable_module_css_default.summaryScrollRegion}`,
									"data-summary-scroll-region": "",
									children: (0, react_jsx_runtime.jsx)(MarkdownRecordContent, {
										record: selected,
										renderSlot,
										loadImage,
										rendered: true,
										thinkingExpanded,
										onThinkingExpandedChange: setThinkingExpanded,
										onOpenCall: openCallSummary,
										t
									})
								})] }),
								!promptSelected && selected !== void 0 && selected.cell.kind !== "compacted" && selectedState !== void 0 && activeTab === "overview" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									selectedProgram !== void 0 && selectedProgram.description !== "" && (0, react_jsx_runtime.jsx)("p", {
										className: TrajectoryTable_module_css_default.programDescription,
										children: selectedProgram.description
									}),
									(0, react_jsx_runtime.jsxs)("dl", {
										className: `${TrajectoryTable_module_css_default.overview} ${TrajectoryTable_module_css_default.summaryScrollRegion}`,
										"data-summary-scroll-region": "",
										children: [
											selected.cell.messageSource !== void 0 && (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("details.source") }), (0, react_jsx_runtime.jsx)("dd", {
												className: TrajectoryTable_module_css_default.overviewParentLinks,
												children: (0, react_jsx_runtime.jsxs)("button", {
													type: "button",
													className: TrajectoryTable_module_css_default.overviewHierarchyNavLink,
													onClick: () => {
														activateTab("source");
													},
													children: [(0, react_jsx_runtime.jsx)("span", { children: messageSourceLabel(selected.cell.messageSource, t) }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {
														className: TrajectoryTable_module_css_default.overviewHierarchyJumpIconTight,
														size: 11
													})]
												})
											})] }),
											hasSelectedHierarchy && (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: selectedAssistantRequestTarget !== void 0 ? t("details.source") : t("details.hierarchy") }), (0, react_jsx_runtime.jsxs)("dd", {
												className: TrajectoryTable_module_css_default.overviewParentLinks,
												children: [
													selectedAssistantRequestTarget !== void 0 && (0, react_jsx_runtime.jsxs)("button", {
														type: "button",
														className: TrajectoryTable_module_css_default.overviewHierarchyNavLink,
														onClick: () => {
															selectRequest(selectedAssistantRequestTarget);
														},
														children: [(0, react_jsx_runtime.jsx)("span", { children: t("request.label", { request: selectedAssistantRequest ?? "—" }) }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {
															className: TrajectoryTable_module_css_default.overviewHierarchyJumpIconTight,
															size: 11
														})]
													}),
													selectedParentMessage !== void 0 && (0, react_jsx_runtime.jsxs)("button", {
														type: "button",
														className: TrajectoryTable_module_css_default.overviewHierarchyNavLink,
														onClick: () => {
															openRecordSummary(selectedParentMessage);
														},
														children: [(0, react_jsx_runtime.jsx)("span", { children: t("details.assistantMessage") }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {
															className: TrajectoryTable_module_css_default.overviewHierarchyJumpIconTight,
															size: 11
														})]
													}),
													selectedParentTool !== void 0 && (0, react_jsx_runtime.jsxs)("button", {
														type: "button",
														className: TrajectoryTable_module_css_default.overviewHierarchyNavLink,
														onClick: () => {
															openRecordSummary(selectedParentTool);
														},
														children: [(0, react_jsx_runtime.jsx)("span", { children: t("details.toolCall") }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {
															className: TrajectoryTable_module_css_default.overviewHierarchyJumpIconTight,
															size: 11
														})]
													})
												]
											})] }),
											(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("details.status") }), (0, react_jsx_runtime.jsx)("dd", {
												className: selectedState === "error" ? TrajectoryTable_module_css_default.error : void 0,
												children: statusLabel(selectedState, t)
											})] }),
											selected.cell.kind === "message" && (0, react_jsx_runtime.jsx)(TokenRows, {
												cell: selected.cell,
												t
											}),
											(selected.cell.kind === "user" || selected.cell.kind === "context") && (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("timing.duration") }), (0, react_jsx_runtime.jsx)("dd", { children: formatElapsedSeconds(selected.cell.timeSeconds, t) })] })
										]
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: TrajectoryTable_module_css_default.overviewSections,
										children: [
											selectedProgram !== void 0 ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(ProgramInput, {
												program: selectedProgram,
												initialWrapped: codeWrappingOnOpen,
												stringWrapping,
												onOpen: () => {
													activateTab("input");
												},
												t
											}, `preview:${selectedRecordId}`), (0, react_jsx_runtime.jsx)(ProgramOutput, {
												record: selected,
												stringWrapping,
												onOpen: () => {
													activateTab("output");
												},
												t
											})] }) : isMarkdownRecord(selected) ? (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: (0, react_jsx_runtime.jsx)(OverviewSection, {
												label: t("tab.preview"),
												onOpen: () => {
													activateTab("rendered");
												},
												children: (0, react_jsx_runtime.jsx)(MarkdownRecordContent, {
													record: selected,
													renderSlot,
													loadImage,
													rendered: true,
													preview: true,
													thinkingExpanded,
													onThinkingExpandedChange: setThinkingExpanded,
													onOpenCall: openCallSummary,
													t
												})
											}) }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
												selected.cell.inputDetail && (0, react_jsx_runtime.jsx)(OverviewSection, {
													label: t("tab.payload"),
													onOpen: () => {
														activateTab("input");
													},
													children: (0, react_jsx_runtime.jsx)(RecordPayload, {
														record: selected,
														direction: "input",
														preview: true,
														renderSlot,
														loadImage,
														stringWrapping,
														t
													})
												}),
												selected.cell.outputDetail && (0, react_jsx_runtime.jsx)(OverviewSection, {
													label: t("tab.result"),
													onOpen: () => {
														activateTab("output");
													},
													children: (0, react_jsx_runtime.jsx)(RecordPayload, {
														record: selected,
														direction: "output",
														preview: true,
														renderSlot,
														loadImage,
														stringWrapping,
														t
													})
												}),
												(0, react_jsx_runtime.jsx)(OverviewSection, {
													label: t("tab.schema"),
													onOpen: () => {
														activateTab("schema");
													},
													children: (0, react_jsx_runtime.jsx)(RecordSchema, {
														record: selected,
														preview: true,
														stringWrapping,
														t
													})
												})
											] }),
											selectedAssistantRequestTarget !== void 0 && (0, react_jsx_runtime.jsx)(OverviewSection, {
												label: t("timing.request"),
												onOpen: () => {
													selectRequest(selectedAssistantRequestTarget, "timing");
												},
												children: (0, react_jsx_runtime.jsx)(RecordTiming, {
													record: selected,
													preview: true,
													t
												})
											}),
											(selected.cell.kind === "tool" || selected.cell.kind === "subtool") && (0, react_jsx_runtime.jsx)(OverviewSection, {
												label: t("tab.timing"),
												onOpen: () => {
													activateTab("timing");
												},
												children: (0, react_jsx_runtime.jsx)(RecordTiming, {
													record: selected,
													preview: true,
													t
												})
											})
										]
									})
								] }),
								!promptSelected && selected !== void 0 && activeTab === "rendered" && (0, react_jsx_runtime.jsx)(MarkdownRecordContent, {
									record: selected,
									renderSlot,
									loadImage,
									rendered: true,
									thinkingExpanded,
									onThinkingExpandedChange: setThinkingExpanded,
									onOpenCall: openCallSummary,
									t
								}),
								!promptSelected && selected !== void 0 && activeTab === "raw" && (0, react_jsx_runtime.jsx)(MarkdownRecordContent, {
									record: selected,
									renderSlot,
									loadImage,
									rendered: false,
									thinkingExpanded,
									onThinkingExpandedChange: setThinkingExpanded,
									onOpenCall: openCallSummary,
									t
								}),
								!promptSelected && selected !== void 0 && activeTab === "source" && (0, react_jsx_runtime.jsx)(MessageSource, {
									record: selected,
									stringWrapping,
									t
								}),
								!promptSelected && selected !== void 0 && activeTab === "input" && (selectedProgram === void 0 ? (0, react_jsx_runtime.jsx)(RecordPayload, {
									record: selected,
									direction: "input",
									renderSlot,
									loadImage,
									stringWrapping,
									t
								}) : (0, react_jsx_runtime.jsx)(ProgramInput, {
									program: selectedProgram,
									initialWrapped: codeWrappingOnOpen,
									stringWrapping,
									t
								}, `input:${selectedRecordId}`)),
								!promptSelected && selected !== void 0 && activeTab === "output" && (selected.cell.kind === "tool" || selected.cell.kind === "subtool" ? (0, react_jsx_runtime.jsxs)("div", {
									className: TrajectoryTable_module_css_default.resultSections,
									children: [(0, react_jsx_runtime.jsxs)("section", {
										className: TrajectoryTable_module_css_default.resultSection,
										"aria-label": t("record.rawResult"),
										children: [(0, react_jsx_runtime.jsx)("header", {
											className: TrajectoryTable_module_css_default.overviewHeading,
											children: (0, react_jsx_runtime.jsx)("h3", {
												className: TrajectoryTable_module_css_default.resultTitle,
												children: t("record.rawResult")
											})
										}), resultValue === void 0 ? (0, react_jsx_runtime.jsx)("p", {
											className: TrajectoryTable_module_css_default.noPayload,
											children: t(stateOf(selected) === "running" ? "code.running" : "record.rawResultUnavailable")
										}) : resultValue !== null && typeof resultValue === "object" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonTree, {
											data: resultValue,
											label: t("record.resultJson"),
											labels: jsonTreeLabels(t),
											stringWrapping,
											collapsedStringLines: 12,
											className: TrajectoryTable_module_css_default.jsonPayload
										}) : (0, react_jsx_runtime.jsx)("pre", {
											className: TrajectoryTable_module_css_default.programOutput,
											children: JSON.stringify(resultValue)
										})]
									}), (0, react_jsx_runtime.jsxs)("section", {
										className: TrajectoryTable_module_css_default.resultSection,
										"aria-label": t("record.renderedResult"),
										children: [(0, react_jsx_runtime.jsx)("header", {
											className: TrajectoryTable_module_css_default.overviewHeading,
											children: (0, react_jsx_runtime.jsx)("h3", {
												className: TrajectoryTable_module_css_default.resultTitle,
												children: t("record.renderedResult")
											})
										}), selectedProgram === void 0 ? (0, react_jsx_runtime.jsx)(RecordPayload, {
											record: selected,
											direction: "output",
											renderSlot,
											loadImage,
											stringWrapping,
											t
										}) : (0, react_jsx_runtime.jsx)(ProgramOutput, {
											record: selected,
											stringWrapping,
											t
										})]
									})]
								}) : (0, react_jsx_runtime.jsx)(RecordPayload, {
									record: selected,
									direction: "output",
									renderSlot,
									loadImage,
									stringWrapping,
									t
								})),
								!promptSelected && selected !== void 0 && activeTab === "schema" && (0, react_jsx_runtime.jsx)(RecordSchema, {
									record: selected,
									stringWrapping,
									t
								}),
								!promptSelected && selected !== void 0 && activeTab === "timing" && (0, react_jsx_runtime.jsx)(RecordTiming, {
									record: selected,
									t
								})
							]
						})
					]
				})]
			});
		}
