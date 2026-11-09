// Extracted from @deepseek-ai/dsh-client-ui-deliverables (lib/client.js); region lib/types/client/FileDiff.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Shared file comparison for the turn-tail hover preview and Sidebar review. */
		/** Maximum rendered lines per comparison. */
		const MAX_RENDERED_LINES = 5e3;
		function highlightedSide(rows, side, highlighter) {
			const source = rows.flatMap((row) => {
				const no = row[side];
				return no === void 0 ? [] : [{
					no,
					text: row.text
				}];
			});
			if (source.length === 0) return /* @__PURE__ */ new Map();
			const highlighted = highlighter(source.map((line) => line.text).join("\n"));
			if (highlighted === void 0) return void 0;
			return new Map(source.map((line, index) => {
				return [line.no, highlighted[index] ?? []];
			}));
		}
		function hunkHighlights(hunk, highlighter) {
			const rows = hunkRows(hunk);
			return {
				old: highlightedSide(rows, "old", highlighter),
				new: highlightedSide(rows, "new", highlighter)
			};
		}
		function DiffText({ text, spans }) {
			return (0, react_jsx_runtime.jsx)("span", {
				className: FileDiff_module_css_default.text,
				"data-diff-code": spans === void 0 ? void 0 : "",
				children: spans === void 0 ? text : spans.map((span, index) => (0, react_jsx_runtime.jsx)("span", {
					style: span.style,
					children: span.text
				}, index))
			});
		}
		/**
		* Number a hunk's lines: context lines count on both sides, deletions on the
		* old side, additions on the new side.
		* @param hunk - a served hunk.
		* @returns the rows in order.
		*/
		function hunkRows(hunk) {
			let oldNo = hunk.oldStart;
			let newNo = hunk.newStart;
			return hunk.lines.map((line) => {
				const text = line.slice(1);
				switch (line[0]) {
					case "+": return {
						kind: "add",
						old: void 0,
						new: newNo++,
						text
					};
					case "-": return {
						kind: "del",
						old: oldNo++,
						new: void 0,
						text
					};
					default: return {
						kind: "context",
						old: oldNo++,
						new: newNo++,
						text
					};
				}
			});
		}
		/**
		* Pair a hunk's lines for the side-by-side view: each run of deletions is
		* aligned with the run of additions that follows it, row by row, and context
		* lines sit on both sides.
		* @param hunk - a served hunk.
		* @returns the rows in order.
		*/
		function splitRows(hunk) {
			const rows = [];
			let dels = [];
			let adds = [];
			const flush = () => {
				for (let at = 0; at < Math.max(dels.length, adds.length); at += 1) {
					const left = dels[at];
					const right = adds[at];
					rows.push({
						...left === void 0 ? {} : { left },
						...right === void 0 ? {} : { right }
					});
				}
				dels = [];
				adds = [];
			};
			for (const row of hunkRows(hunk)) if (row.kind === "del") dels.push({
				no: row.old,
				text: row.text,
				kind: "del"
			});
			else if (row.kind === "add") adds.push({
				no: row.new,
				text: row.text,
				kind: "add"
			});
			else {
				flush();
				rows.push({
					left: {
						no: row.old,
						text: row.text,
						kind: "context"
					},
					right: {
						no: row.new,
						text: row.text,
						kind: "context"
					}
				});
			}
			flush();
			return rows;
		}
		/**
		* The hunks to draw, cut at {@link MAX_RENDERED_LINES} lines in total.
		* @param hunks - served hunks.
		* @returns the hunks with the last one shortened as needed, and whether anything was cut.
		*/
		function renderedHunks(hunks) {
			let budget = MAX_RENDERED_LINES;
			const kept = [];
			for (const hunk of hunks) {
				if (budget === 0) return {
					hunks: kept,
					truncated: true
				};
				kept.push(hunk.lines.length <= budget ? hunk : {
					...hunk,
					lines: hunk.lines.slice(0, budget)
				});
				budget -= Math.min(budget, hunk.lines.length);
			}
			return {
				hunks: kept,
				truncated: hunks.some((hunk, at) => kept[at] !== hunk)
			};
		}
		/** The one-line fact about a text comparison worth stating above its hunks, if any. */
		function noteOf(diff) {
			if (!diff.before) return "diff.created";
			if (!diff.after) return "diff.deleted";
			if (diff.hunks.length === 0) return "diff.unchanged";
		}
		/**
		* Render a file comparison with the same states and highlighting in previews and review tabs.
		* Addition-only and deletion-only comparisons use one column without changing the requested layout.
		* @param props - comparison state, layout choices, retry action, and localized copy.
		* @returns the comparison or its loading, unavailable, or error state.
		*/
		function FileDiff({ state, split, wrap, retry, t }) {
			if (state === void 0 || state === "loading") return (0, react_jsx_runtime.jsx)("p", {
				className: FileDiff_module_css_default.status,
				role: "status",
				children: t("diff.loading")
			});
			if (state === "missing") return (0, react_jsx_runtime.jsx)("p", {
				className: FileDiff_module_css_default.status,
				children: t("diff.missing")
			});
			if (state === "error") return (0, react_jsx_runtime.jsxs)("div", {
				className: FileDiff_module_css_default.status,
				children: [(0, react_jsx_runtime.jsx)("span", { children: t("diff.error") }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					size: "sm",
					onClick: retry,
					children: t("presented.retry")
				})]
			});
			if (state.kind === "binary") return (0, react_jsx_runtime.jsx)("p", {
				className: FileDiff_module_css_default.status,
				children: t("diff.binary")
			});
			if (state.kind === "oversized") return (0, react_jsx_runtime.jsx)("p", {
				className: FileDiff_module_css_default.status,
				children: t("diff.oversized")
			});
			const oneSided = state.hunks.some((hunk) => hunk.lines.some((line) => line.startsWith("+"))) !== state.hunks.some((hunk) => hunk.lines.some((line) => line.startsWith("-")));
			return (0, react_jsx_runtime.jsx)(TextDiff, {
				diff: state,
				split: split && !oneSided,
				wrap,
				t
			});
		}
		/** The kind a paired row carries: a deletion or addition on either side, otherwise context. */
		function splitRowKind(row) {
			return row.left?.kind === "del" ? "del" : row.right?.kind === "add" ? "add" : "context";
		}
		function hunkHeader(hunk) {
			return `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`;
		}
		/**
		* The side-by-side view without wrapping: two columns that clip their long
		* lines and scroll together on both axes, so a long line on one side never
		* runs under the other and both sides show the same rows and columns of text.
		* Every line is one fixed-height row, which keeps the sides aligned.
		* The columns suppress elastic overscroll while retaining native in-range scrolling.
		*/
		function SplitColumns({ hunks, highlights }) {
			const paired = (0, react.useMemo)(() => hunks.map((hunk) => ({
				header: hunkHeader(hunk),
				rows: splitRows(hunk)
			})), [hunks]);
			const columns = (0, react.useRef)({
				left: null,
				right: null
			});
			const offsets = (0, react.useRef)({
				left: {
					scrollLeft: 0,
					scrollTop: 0
				},
				right: {
					scrollLeft: 0,
					scrollTop: 0
				}
			});
			const follow = (side) => (event) => {
				const peer = side === "left" ? "right" : "left";
				const other = columns.current[peer];
				/* v8 ignore next -- Both column refs are attached before browser scroll events can run. */
				if (other === null) return;
				for (const axis of ["scrollLeft", "scrollTop"]) {
					const value = event.currentTarget[axis];
					if (offsets.current[side][axis] === value) continue;
					offsets.current[side][axis] = value;
					other[axis] = value;
					offsets.current[peer][axis] = other[axis];
				}
			};
			return (0, react_jsx_runtime.jsx)("div", {
				className: FileDiff_module_css_default.columns,
				children: ["left", "right"].map((side) => (0, react_jsx_runtime.jsx)("div", {
					className: FileDiff_module_css_default.column,
					"data-diff-side": side,
					ref: (element) => {
						columns.current[side] = element;
					},
					onScroll: follow(side),
					children: paired.map((hunk, position) => (0, react_jsx_runtime.jsxs)("section", {
						className: FileDiff_module_css_default.hunk,
						children: [(0, react_jsx_runtime.jsx)("div", {
							className: FileDiff_module_css_default.hunkHeader,
							"data-diff-hunk-header": true,
							children: hunk.header
						}), hunk.rows.map((row, at) => {
							const cell = row[side];
							const spans = cell === void 0 ? void 0 : highlights[position]?.[side === "left" ? "old" : "new"]?.get(cell.no);
							return (0, react_jsx_runtime.jsxs)("div", {
								className: `${FileDiff_module_css_default.sideLine} ${cell === void 0 ? FileDiff_module_css_default.empty : FileDiff_module_css_default[cell.kind]}`,
								"data-diff-line": splitRowKind(row),
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: FileDiff_module_css_default.number,
									children: cell?.no ?? ""
								}), (0, react_jsx_runtime.jsx)(DiffText, {
									text: cell?.text ?? "",
									spans
								})]
							}, at);
						})]
					}, position))
				}, side))
			});
		}
		/** The hunks of a text comparison with their line numbers, unified or side by side. */
		function TextDiff({ diff, split, wrap, t }) {
			const note = noteOf(diff);
			const { hunks, truncated } = (0, react.useMemo)(() => renderedHunks(diff.hunks), [diff.hunks]);
			const highlighter = (0, _deepseek_ai_dsh_client_ui_primitives.useCodeHighlighter)((0, _deepseek_ai_dsh_client_ui_primitives.languageForPath)(diff.path));
			const highlights = (0, react.useMemo)(() => hunks.map((hunk) => hunkHighlights(hunk, highlighter)), [hunks, highlighter]);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: FileDiff_module_css_default.body,
				"data-review-view": split ? "split" : "unified",
				"data-review-wrap": wrap || void 0,
				children: [
					note !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						className: FileDiff_module_css_default.note,
						"data-diff-note": hunks.length === 0 ? "empty" : "metadata",
						children: t(note)
					}),
					diff.coarse && (0, react_jsx_runtime.jsx)("p", {
						className: FileDiff_module_css_default.note,
						"data-diff-coarse": true,
						children: t("diff.coarse")
					}),
					truncated && (0, react_jsx_runtime.jsx)("p", {
						className: FileDiff_module_css_default.note,
						"data-diff-truncated": true,
						children: t("diff.truncated", { count: String(5e3) })
					}),
					split && !wrap ? (0, react_jsx_runtime.jsx)(SplitColumns, {
						hunks,
						highlights
					}) : hunks.map((hunk, position) => {
						const highlighted = highlights[position];
						return (0, react_jsx_runtime.jsxs)("section", {
							className: FileDiff_module_css_default.hunk,
							children: [(0, react_jsx_runtime.jsx)("div", {
								className: FileDiff_module_css_default.hunkHeader,
								"data-diff-hunk-header": true,
								children: hunkHeader(hunk)
							}), split ? splitRows(hunk).map((row, at) => (0, react_jsx_runtime.jsxs)("div", {
								className: FileDiff_module_css_default.splitLine,
								"data-diff-line": splitRowKind(row),
								children: [(0, react_jsx_runtime.jsxs)("span", {
									className: `${FileDiff_module_css_default.cell} ${row.left === void 0 ? FileDiff_module_css_default.empty : FileDiff_module_css_default[row.left.kind]}`,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: FileDiff_module_css_default.number,
										children: row.left?.no ?? ""
									}), (0, react_jsx_runtime.jsx)(DiffText, {
										text: row.left?.text ?? "",
										spans: row.left === void 0 ? void 0 : highlighted?.old?.get(row.left.no)
									})]
								}), (0, react_jsx_runtime.jsxs)("span", {
									className: `${FileDiff_module_css_default.cell} ${row.right === void 0 ? FileDiff_module_css_default.empty : FileDiff_module_css_default[row.right.kind]}`,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: FileDiff_module_css_default.number,
										children: row.right?.no ?? ""
									}), (0, react_jsx_runtime.jsx)(DiffText, {
										text: row.right?.text ?? "",
										spans: row.right === void 0 ? void 0 : highlighted?.new?.get(row.right.no)
									})]
								})]
							}, at)) : hunkRows(hunk).map((row, at) => (0, react_jsx_runtime.jsxs)("div", {
								className: `${FileDiff_module_css_default.line} ${FileDiff_module_css_default[row.kind]}`,
								"data-diff-line": row.kind,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: FileDiff_module_css_default.number,
										children: row.old ?? ""
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: FileDiff_module_css_default.number,
										children: row.new ?? ""
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: FileDiff_module_css_default.sign,
										children: row.kind === "add" ? "+" : row.kind === "del" ? "-" : " "
									}),
									(0, react_jsx_runtime.jsx)(DiffText, {
										text: row.text,
										spans: row.kind === "add" ? highlighted?.new?.get(row.new) : highlighted?.old?.get(row.old)
									})
								]
							}, at))]
						}, position);
					})
				]
			});
		}
