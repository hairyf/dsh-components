// Extracted from @deepseek-ai/dsh-client-ui-agent-preset (lib/client.js); region lib/types/client/AgentPresetSection.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		function CardDescription({ text }) {
			const ref = (0, react.useRef)(null);
			const [truncated, setTruncated] = (0, react.useState)(false);
			(0, react.useLayoutEffect)(() => {
				const el = ref.current;
				/* v8 ignore next -- the ref is attached before layout effects run. */
				if (el === null) return;
				const measure = () => {
					setTruncated(el.scrollHeight > el.clientHeight);
				};
				measure();
				if (typeof ResizeObserver === "undefined") return;
				const observer = new ResizeObserver(measure);
				observer.observe(el);
				return () => {
					observer.disconnect();
				};
			}, [text]);
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: text,
				side: "bottom",
				delayMs: 400,
				disabled: !truncated,
				maxWidth: 360,
				children: (0, react_jsx_runtime.jsx)("span", {
					ref,
					className: AgentPresetSection_module_css_default.cardDesc,
					title: "",
					children: text
				})
			});
		}
		/** Render the roster with its default, mode help, composition viewer, and the guidance to Creator mode.
		* @param props Settings actions, snapshot hooks and localized text.
		* @returns The preset settings section.
		*/
		function AgentPresetSection({ useAgentPresetSection, load, view, closeView, makeDefault, startCreatorDraft, close: closeSettings, useDeveloperTools, t }) {
			const state = useAgentPresetSection((value) => value);
			const developerTools = useDeveloperTools((enabled) => enabled);
			const [guide, setGuide] = (0, react.useState)(null);
			const viewTrigger = (0, react.useRef)(null);
			const closeViewOnUnmount = (0, react.useRef)(closeView);
			(0, react.useEffect)(() => {
				load();
			}, [load]);
			(0, react.useLayoutEffect)(() => {
				closeViewOnUnmount.current = closeView;
			}, [closeView]);
			(0, react.useEffect)(() => () => {
				closeViewOnUnmount.current();
			}, []);
			const closeViewer = () => {
				closeView();
				viewTrigger.current?.focus();
			};
			const viewed = state.view;
			const viewedRow = viewed === null ? void 0 : state.rows.find((row) => row.id === viewed.id);
			const viewedTitle = viewed === null ? "" : viewedRow === void 0 ? viewed.title : presetDisplayText(viewedRow, t).name;
			const creator = startCreatorDraft !== void 0 && state.rows.some((row) => row.id === "cordis") ? startCreatorDraft : void 0;
			const creatorButton = creator === void 0 ? null : (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: AgentPresetSection_module_css_default.creatorButton,
				disabled: state.saving,
				onClick: () => {
					creator();
					closeSettings();
				},
				children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 14 }), t("creatorDraft")]
			});
			return (0, react_jsx_runtime.jsxs)("section", {
				className: AgentPresetSection_module_css_default.section,
				children: [
					(0, react_jsx_runtime.jsx)("h2", {
						className: AgentPresetSection_module_css_default.title,
						children: t("nav")
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: AgentPresetSection_module_css_default.intro,
						children: t("sectionIntro")
					}),
					state.error === null ? null : (0, react_jsx_runtime.jsx)("p", {
						className: AgentPresetSection_module_css_default.error,
						role: "alert",
						children: state.error
					}),
					[true, false].map((builtIn) => {
						const rows = state.rows.filter((row) => isBuiltInPreset(row) === builtIn && (developerTools || !requiresCodingTools(row)));
						const entry = builtIn ? null : creatorButton;
						if (rows.length === 0 && entry === null) return null;
						return (0, react_jsx_runtime.jsxs)("section", {
							className: AgentPresetSection_module_css_default.group,
							children: [
								(0, react_jsx_runtime.jsx)("h3", {
									className: AgentPresetSection_module_css_default.groupHead,
									children: t(builtIn ? "builtInGroup" : "customGroup")
								}),
								rows.length === 0 ? null : (0, react_jsx_runtime.jsx)("ul", {
									className: AgentPresetSection_module_css_default.cards,
									children: rows.map((row) => {
										const display = presetDisplayText(row, t);
										const help = presetGuide(row.id, builtIn ? "system" : "user");
										const selectionAction = row.broken !== void 0 ? t("brokenBadge") : t(row.isDefault ? "inUse" : "setDefault");
										return (0, react_jsx_runtime.jsxs)("li", {
											"data-agent-preset-id": row.id,
											className: [
												AgentPresetSection_module_css_default.card,
												row.broken === void 0 ? void 0 : AgentPresetSection_module_css_default.cardBroken,
												row.isDefault ? AgentPresetSection_module_css_default.cardActive : void 0
											].filter(Boolean).join(" "),
											children: [(0, react_jsx_runtime.jsxs)("button", {
												type: "button",
												className: AgentPresetSection_module_css_default.cardMain,
												"aria-pressed": row.isDefault,
												disabled: row.isDefault || row.broken === void 0 && state.saving,
												"aria-disabled": row.broken !== void 0,
												"aria-label": `${selectionAction}: ${display.name}`,
												title: selectionAction,
												onClick: () => {
													if (row.broken === void 0) makeDefault(row.id);
												},
												children: [
													(0, react_jsx_runtime.jsxs)("span", {
														className: AgentPresetSection_module_css_default.cardHead,
														children: [(0, react_jsx_runtime.jsxs)("span", {
															className: AgentPresetSection_module_css_default.cardIdentity,
															children: [
																(0, react_jsx_runtime.jsx)("span", {
																	className: AgentPresetSection_module_css_default.cardName,
																	title: display.name,
																	children: display.name
																}),
																row.broken === void 0 ? null : (0, react_jsx_runtime.jsxs)("span", {
																	className: AgentPresetSection_module_css_default.brokenBadge,
																	children: [t("brokenBadge"), (0, react_jsx_runtime.jsx)("span", {
																		className: AgentPresetSection_module_css_default.brokenTip,
																		"aria-hidden": "true",
																		children: row.broken
																	})]
																}),
																(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
																	tone: row.isDefault ? "solid" : "outline",
																	children: row.isDefault ? t("inUse") : t(builtIn ? "builtInGroup" : "customGroup")
																})
															]
														}), (0, react_jsx_runtime.jsx)("code", {
															className: AgentPresetSection_module_css_default.cardId,
															title: row.id,
															children: row.id
														})]
													}),
													(0, react_jsx_runtime.jsx)(CardDescription, { text: display.description ?? t("noDescription") }),
													row.broken === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
														className: AgentPresetSection_module_css_default.cardBrokenReason,
														role: "alert",
														children: row.broken
													})
												]
											}), (0, react_jsx_runtime.jsxs)("div", {
												className: AgentPresetSection_module_css_default.cardFoot,
												children: [help === void 0 ? null : (0, react_jsx_runtime.jsxs)("div", {
													className: AgentPresetSection_module_css_default.cardHelp,
													children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
														variant: "ghost",
														className: AgentPresetSection_module_css_default.helpButton,
														"aria-label": `${t("modeExplanation")}: ${display.name}`,
														onClick: () => {
															setGuide({
																content: help,
																page: "explanation"
															});
														},
														children: t("modeExplanation")
													}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
														variant: "ghost",
														className: AgentPresetSection_module_css_default.helpButton,
														"aria-label": `${t("howToUse")}: ${display.name}`,
														onClick: () => {
															setGuide({
																content: help,
																page: "usage"
															});
														},
														children: t("howToUse")
													})]
												}), (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: AgentPresetSection_module_css_default.iconButton,
													"data-tip": t("view"),
													"aria-label": `${t("view")}: ${display.name}`,
													onClick: (event) => {
														viewTrigger.current = event.currentTarget;
														view(row.id);
													},
													children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBrowseOutlineRegular, {})
												})]
											})]
										}, row.id);
									})
								}),
								entry
							]
						}, String(builtIn));
					}),
					guide === null ? null : (0, react_jsx_runtime.jsx)(PresetGuideDialog, {
						guide: guide.content,
						initialPage: guide.page,
						t,
						onClose: () => {
							setGuide(null);
						}
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: viewed !== null,
						onClose: closeViewer,
						closeLabel: t("close"),
						onKeyDownCapture: (event) => {
							if (event.key === "Escape") {
								event.preventDefault();
								event.stopPropagation();
								closeViewer();
							} else trapPresetReaderTab(event);
						},
						title: viewed === null ? "" : `${t("view")} · ${viewedTitle}`,
						className: AgentPresetSection_module_css_default.dialog,
						footer: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							autoFocus: true,
							onClick: closeViewer,
							children: t("close")
						}),
						children: viewed === null ? null : (0, react_jsx_runtime.jsx)("pre", {
							className: AgentPresetSection_module_css_default.viewerCode,
							children: viewed.content
						})
					})
				]
			});
		}
