// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/StatsPills.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Fold assistant and tool-result nodes into window-scoped display totals —
		* the FALLBACK for assemblies without the `sessionStats` projection.
		*
		* Every displayed figure rides that durable whole-log projection (and token
		* accounting rides `tokenUsage`) because the window is paged and compaction
		* rewrites it; this fold answers "what is on screen" only when no projection
		* value is served. Its field names deliberately mirror the projection's so
		* the two swap wholesale.
		* @param nodes - snapshot nodes.
		* @returns fallback counts and summed wall times.
		*/
		function deriveStats(nodes) {
			const turns = /* @__PURE__ */ new Set();
			let steps = 0;
			let llmMs = 0;
			let toolMs = 0;
			let ttftMs = 0;
			let ttftSteps = 0;
			let decodeMs = 0;
			let decodeTokens = 0;
			for (const node of nodes) {
				if (node.kind === "tool-result") {
					if (node.callTime !== null) toolMs += Math.max(0, node.time - node.callTime);
					continue;
				}
				if (node.kind !== "assistant") continue;
				turns.add(node.turn);
				steps += 1;
				if (node.timing !== void 0 && node.timing.stepStartTime !== null) llmMs += Math.max(0, node.timing.completedTime - node.timing.stepStartTime);
				const reading = assistantStepReading(node);
				if (reading.ttftMs !== null) {
					ttftMs += reading.ttftMs;
					ttftSteps += 1;
				}
				if (reading.decodeMs !== null && reading.outputTokens !== null) {
					decodeMs += reading.decodeMs;
					decodeTokens += reading.outputTokens;
				}
			}
			return {
				turns: turns.size,
				steps,
				llmMs,
				toolMs,
				ttftMs,
				ttftSteps,
				decodeMs,
				decodeTokens
			};
		}
		/**
		* Compact duration: 45.2s under a minute, 2m42s from there on.
		* @param ms - duration in milliseconds.
		* @returns display string.
		*/
		function formatDuration(ms, t) {
			const s = ms / 1e3;
			if (s < 60) return t("duration.compactSeconds", { seconds: Math.round(s * 10) / 10 });
			const whole = Math.round(s);
			return t("duration.compactMinutes", {
				minutes: Math.floor(whole / 60),
				seconds: whole % 60
			});
		}
		/**
		* Display-ready cache-hit share of prompt-side input over the whole durable log.
		* @param usage - the session's token-usage projection value.
		* @returns integer text when integer rounding stays below 100, otherwise the
		* minimum decimal precision that still rounds below 100; a full hit returns
		* 100, and no billed input returns null.
		*/
		function cacheHitPercent(usage) {
			const denominator = billedInputTokens(usage);
			return formatCacheHitPercent(usage.cacheReadTokens, denominator);
		}
		/**
		* Sum the three disjoint prompt-side billing buckets.
		* @param usage - the session's token-usage projection value.
		* @returns billed input tokens.
		*/
		function billedInputTokens(usage) {
			return usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
		}
		function exactCount(value, t) {
			return t("message.turnUsage.count", { count: formatExactTokens(value, t) });
		}
		/** One or two reading segments, visually joined by a separator glyph. */
		function reading(first, second) {
			if (second === null) return {
				label: first,
				text: first
			};
			return {
				label: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					first,
					(0, react_jsx_runtime.jsx)("span", {
						className: StatsPills_module_css_default.sep,
						"aria-hidden": true,
						children: "·"
					}),
					second
				] }),
				text: `${first} · ${second}`
			};
		}
		function useSessionStats(useChat, useProjection) {
			const settledNodes = useChat((s) => s.legacy.nodes);
			const projected = useProjection("sessionStats");
			return (0, react.useMemo)(() => projected ?? deriveStats(settledNodes), [projected, settledNodes]);
		}
		function decodeSpeed(stats, t) {
			return t("message.tokensPerSecond", { tps: formatTokensPerSecond(stats.decodeTokens / (stats.decodeMs / 1e3)) });
		}
		/** The full reading above a pill, only while an ellipsis cuts its label; the delay matches the dock's context meter. */
		const FULL_READING_TOOLTIP = {
			side: "top",
			portal: true,
			delayMs: 200,
			onlyWhenClipped: true
		};
		/** A static reading: used when the pill has no dialog rows or the mode is Compact. */
		function PlainPill({ stat, icon, label, text }) {
			return (0, react_jsx_runtime.jsx)("span", {
				className: StatsPills_module_css_default.anchor,
				"data-composer-stat": stat,
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label: text,
					...FULL_READING_TOOLTIP,
					openOnClick: true,
					children: (0, react_jsx_runtime.jsxs)("span", {
						className: StatsPills_module_css_default.pill,
						children: [icon, (0, react_jsx_runtime.jsx)("span", {
							className: StatsPills_module_css_default.label,
							children: label
						})]
					})
				})
			});
		}
		/**
		* A pill button opening its own portaled dialog. Each pill owns its open
		* state; useStatDialog closes it on Escape or an outside pointerdown or click,
		* so at most one dialog is open across the dock.
		*/
		function DialogPill({ stat, icon, label, text, title, titleValue, children }) {
			const { open, setOpen, rootRef, panelRef, pos } = useStatDialog();
			return (0, react_jsx_runtime.jsxs)("span", {
				ref: rootRef,
				className: StatsPills_module_css_default.anchor,
				"data-composer-stat": stat,
				children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label: text,
					...FULL_READING_TOOLTIP,
					disabled: open,
					children: (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: StatsPills_module_css_default.pill,
						"aria-haspopup": "dialog",
						"aria-expanded": open,
						"aria-label": text,
						onClick: () => {
							setOpen(!open);
						},
						children: [icon, (0, react_jsx_runtime.jsx)("span", {
							className: StatsPills_module_css_default.label,
							children: label
						})]
					})
				}), open && (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)("div", {
					ref: panelRef,
					className: stat_dialog_module_css_default.panel,
					role: "dialog",
					"aria-label": title,
					style: pos ?? MEASURE_STYLE,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: stat_dialog_module_css_default.title,
							children: [(0, react_jsx_runtime.jsxs)("span", {
								className: stat_dialog_module_css_default.titleLabel,
								children: [icon, title]
							}), titleValue !== void 0 && (0, react_jsx_runtime.jsx)("span", {
								className: stat_dialog_module_css_default.titleValue,
								children: titleValue
							})]
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: stat_dialog_module_css_default.titleRule,
							"aria-hidden": true
						}),
						children
					]
				}), document.body)]
			});
		}
		/**
		* Turn and step counts with whole-session speed, opening the time and speed
		* dialog; Compact keeps only the speed reading.
		*/
		const ActivityPill = (0, react.memo)(function ActivityPill({ useChat, useProjection, usePerformanceUsage, t }) {
			const mode = usePerformanceUsage((value) => value);
			const stats = useSessionStats(useChat, useProjection);
			const speed = stats.decodeMs > 0 ? decodeSpeed(stats, t) : null;
			const icon = (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconGaugeOutlineRegular, {});
			if (mode === "compact") return speed === null ? null : (0, react_jsx_runtime.jsx)(PlainPill, {
				stat: "activity",
				icon,
				...reading(speed, null)
			});
			if (stats.steps === 0) return null;
			const counts = t("stats.counts", {
				turns: stats.turns,
				steps: stats.steps
			});
			const content = {
				stat: "activity",
				icon,
				...reading(counts, speed)
			};
			if (stats.llmMs <= 0 && stats.toolMs <= 0 && stats.ttftSteps <= 0 && speed === null) return (0, react_jsx_runtime.jsx)(PlainPill, { ...content });
			return (0, react_jsx_runtime.jsx)(DialogPill, {
				...content,
				title: t("stats.dialog.title"),
				titleValue: counts,
				children: (0, react_jsx_runtime.jsxs)("dl", {
					className: stat_dialog_module_css_default.details,
					"data-session-stats-details": true,
					children: [
						stats.llmMs > 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("stats.dialog.llmTime") }), (0, react_jsx_runtime.jsx)("dd", { children: formatDuration(stats.llmMs, t) })] }),
						stats.toolMs > 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("stats.dialog.toolTime") }), (0, react_jsx_runtime.jsx)("dd", { children: formatDuration(stats.toolMs, t) })] }),
						stats.ttftSteps > 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("stats.dialog.ttft") }), (0, react_jsx_runtime.jsx)("dd", { children: formatDuration(stats.ttftMs / stats.ttftSteps, t) })] }),
						speed !== null && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("stats.dialog.speed") }), (0, react_jsx_runtime.jsx)("dd", { children: speed })] })
					]
				})
			});
		});
		/** Whole-log token total and cache hit; Compact keeps only the cache hit. */
		const UsagePill = (0, react.memo)(function UsagePill({ useProjection, usePerformanceUsage, t }) {
			const mode = usePerformanceUsage((value) => value);
			const usage = useProjection("tokenUsage");
			if (usage === void 0 || billedInputTokens(usage) === 0 && usage.outputTokens === 0) return null;
			const cacheHit = cacheHitPercent(usage);
			const cacheHitText = cacheHit !== null ? t("stats.cacheHit", { percent: cacheHit }) : null;
			const icon = (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDatabaseOutlineRegular, {});
			if (mode === "compact") return cacheHitText === null ? null : (0, react_jsx_runtime.jsx)(PlainPill, {
				stat: "usage",
				icon,
				...reading(cacheHitText, null)
			});
			const total = billedInputTokens(usage) + usage.outputTokens;
			return (0, react_jsx_runtime.jsx)(DialogPill, {
				stat: "usage",
				icon,
				...reading(t("message.turnUsage.count", { count: formatTokens(total, t) }), cacheHitText),
				title: t("stats.dialog.usageTitle"),
				titleValue: exactCount(total, t),
				children: (0, react_jsx_runtime.jsxs)("dl", {
					className: stat_dialog_module_css_default.details,
					"data-session-stats-usage": true,
					children: [
						cacheHit !== null && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("message.turnUsage.cacheHit") }), (0, react_jsx_runtime.jsx)("dd", { children: `${cacheHit}%` })] }),
						(0, react_jsx_runtime.jsx)("dt", { children: t("message.turnUsage.input") }),
						(0, react_jsx_runtime.jsx)("dd", { children: exactCount(usage.uncachedInputTokens, t) }),
						(0, react_jsx_runtime.jsx)("dt", { children: t("message.turnUsage.cacheRead") }),
						(0, react_jsx_runtime.jsx)("dd", { children: exactCount(usage.cacheReadTokens, t) }),
						usage.cacheWriteTokens !== 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("message.turnUsage.cacheWrite") }), (0, react_jsx_runtime.jsx)("dd", { children: exactCount(usage.cacheWriteTokens, t) })] }),
						(0, react_jsx_runtime.jsx)("dt", { children: t("message.turnUsage.output") }),
						(0, react_jsx_runtime.jsx)("dd", { children: exactCount(usage.outputTokens, t) })
					]
				})
			});
		});
