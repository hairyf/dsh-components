// Extracted from @deepseek-ai/dsh-client-ui-skill (lib/client.js); region lib/types/client/SkillRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** First physical line for the collapsed error summary and malformed-args fallback. */
		function firstLine(text) {
			const newline = text.indexOf("\n");
			return newline === -1 ? text : text.slice(0, newline);
		}
		/** Skill names are the only call argument the compact row presents. */
		function skillName(argsRaw, callId) {
			try {
				const parsed = JSON.parse(argsRaw);
				if (typeof parsed === "object" && parsed !== null) {
					const name = parsed.name;
					if (typeof name === "string" && name !== "") return firstLine(name);
				}
			} catch {}
			return argsRaw === "" ? callId : firstLine(argsRaw);
		}
		/** Flatten durable result blocks under the generic Tool-row text contract.
		*  Keep aligned with ui-tool's models/tool-call-model.ts `resultText`. */
		function resultText(block) {
			if (!("kind" in block)) return null;
			const parts = [];
			for (const item of block.content) parts.push(item.type === "text" ? item.text : JSON.stringify(item, null, 2));
			if (parts.length === 0 && block.error !== void 0) parts.push(`${block.error.name}: ${block.error.code}`);
			return parts.join("\n") || null;
		}
		/** Derive display state without consulting the live skill catalog. */
		function skillRowModel(block) {
			const settled = "kind" in block;
			const argsRaw = (settled ? block.call?.argsRaw : block.argsRaw) ?? "";
			const state = !settled ? "running" : block.error?.code === "interrupted" ? "stopped" : block.isError ? "error" : "ok";
			const output = resultText(block);
			return {
				name: skillName(argsRaw, block.callId),
				output,
				errorSummary: state === "error" && output !== null ? firstLine(output) : null,
				state
			};
		}
		/** Leading disclosure slot: state icon at rest, chevron on hover or while open. */
		function disclosureLeading(open, expandable) {
			if (open) return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { className: SkillRow_module_css_default.chevron });
			const icon = (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSkillOutlineRegular, { size: 14 });
			if (!expandable) return icon;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
				className: SkillRow_module_css_default.iconIdle,
				children: icon
			}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { className: `${SkillRow_module_css_default.chevron} ${SkillRow_module_css_default.chevronHover}` })] });
		}
		/** Visually hidden state copy for the color-only running sweep and error tone. */
		function stateStatus(state, t) {
			switch (state) {
				case "running": return t("row.running");
				case "error": return t("row.failed");
				default: return null;
			}
		}
		/**
		* Render one `skill` tool call as an accent summary and instructions disclosure.
		* @param props - keyed toolview payload plus the skill locale seat.
		* @returns the dedicated skill row.
		*/
		function SkillRow(props) {
			if (props.phase === "preparing") return (0, react_jsx_runtime.jsx)("div", {
				className: SkillRow_module_css_default.card,
				"data-tool": "skill",
				"data-state": "preparing",
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: SkillRow_module_css_default.row,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: SkillRow_module_css_default.leading,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSkillOutlineRegular, { size: 14 })
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: SkillRow_module_css_default.visuallyHidden,
							children: props.t("row.preparing")
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, {
							active: true,
							className: SkillRow_module_css_default.title,
							children: props.t("row.title")
						})
					]
				})
			});
			return (0, react_jsx_runtime.jsx)(StartedSkillRow, { ...props });
		}
		function StartedSkillRow({ block, inspect, t }) {
			const model = skillRowModel(block);
			const [expanded, setExpanded] = (0, react.useState)(false);
			const expandable = model.output !== null;
			const open = expanded && expandable;
			const status = stateStatus(model.state, t);
			const running = model.state === "running";
			const summary = model.state === "stopped" ? t("row.stopped") : model.errorSummary ?? model.name;
			const toggleExpand = () => {
				setExpanded((value) => !value);
			};
			const toggleFromKeyboard = (event) => {
				if (!expandable || event.key !== "Enter" && event.key !== " ") return;
				event.preventDefault();
				toggleExpand();
			};
			const disclosureProps = expandable ? {
				role: "button",
				tabIndex: 0,
				"aria-expanded": open,
				onClick: toggleExpand,
				onKeyDown: toggleFromKeyboard
			} : {};
			const leading = disclosureLeading(open, expandable);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: SkillRow_module_css_default.card,
				"data-tool": "skill",
				"data-state": model.state,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: SkillRow_module_css_default.row,
					"data-expandable": expandable || void 0,
					...disclosureProps,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: SkillRow_module_css_default.leading,
							children: leading
						}),
						status !== null ? (0, react_jsx_runtime.jsx)("span", {
							className: SkillRow_module_css_default.visuallyHidden,
							children: status
						}) : null,
						(0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, {
							active: running,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: SkillRow_module_css_default.title,
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, { children: t("row.title") })
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: SkillRow_module_css_default.separator,
									"data-shimmer-decoration": true,
									"aria-hidden": true
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: `${SkillRow_module_css_default.summary}${model.state === "error" ? ` ${SkillRow_module_css_default.errorSummary}` : model.state === "stopped" ? ` ${SkillRow_module_css_default.stoppedSummary}` : ""}`,
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, { children: summary })
								})
							]
						})
					]
				}), open ? (0, react_jsx_runtime.jsxs)("div", {
					className: SkillRow_module_css_default.bodyWrap,
					children: [(0, react_jsx_runtime.jsxs)("section", {
						className: SkillRow_module_css_default.instructionsCard,
						"aria-label": t("row.instructions"),
						children: [(0, react_jsx_runtime.jsx)("div", {
							className: SkillRow_module_css_default.instructionsHeader,
							children: t("row.instructions")
						}), (0, react_jsx_runtime.jsx)("pre", {
							className: SkillRow_module_css_default.instructions,
							"data-error": model.state === "error" || void 0,
							children: model.output
						})]
					}), inspect !== void 0 ? (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: SkillRow_module_css_default.inspectButton,
						onClick: inspect,
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconInspectOutlineRegular, {}), t("row.inspect")]
					}) : null]
				}) : null]
			});
		}
