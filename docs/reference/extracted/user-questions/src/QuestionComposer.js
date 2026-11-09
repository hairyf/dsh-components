// Extracted from @deepseek-ai/dsh-client-ui-user-questions (lib/client.js); region lib/types/client/QuestionComposer.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** A removed card can remain mounted until the composer seat updates. */
		const REMOVED_CARD = {
			state: "open",
			waitState: "counting",
			countdown: void 0,
			channel: "none",
			closed: true
		};
		const NOTHING_EXPANDED = /* @__PURE__ */ new Set();
		/**
		* Split the conventional recommendation suffix without changing the answer value.
		* @param label - Original option label returned if selected.
		* @returns Display label plus recommendation state.
		*/
		function parseRecommendedLabel(label) {
			const suffix = /\s*(?:\((?:recommended|推荐)\)|（(?:recommended|推荐)）)\s*$/i;
			return suffix.test(label) ? {
				label: label.replace(suffix, ""),
				recommended: true
			} : {
				label,
				recommended: false
			};
		}
		/**
		* Implicit draft selection the user still submits: every marked choice of a
		* multi-select question, or a marked first choice of a single-select question.
		*/
		function recommendedOptions(question) {
			const labels = (question.options ?? []).map((option) => option.label);
			return (question.multiSelect === true ? labels : labels.slice(0, 1)).filter((label) => parseRecommendedLabel(label).recommended);
		}
		/** Accept persisted progress only when it still describes this question batch. */
		function isQuestionDraftProgress(value, questionCount) {
			if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
			const progress = value;
			if (typeof progress.index !== "number" || !Number.isInteger(progress.index) || progress.index < 0 || progress.index >= questionCount || !Array.isArray(progress.drafts) || progress.drafts.length !== questionCount || progress.wait !== void 0 && progress.wait !== "editing" && progress.wait !== "waiting") return false;
			return progress.drafts.every((item) => {
				if (typeof item !== "object" || item === null || Array.isArray(item)) return false;
				const draft = item;
				return Array.isArray(draft.selected) && draft.selected.every((label) => typeof label === "string") && typeof draft.custom === "string" && typeof draft.skipped === "boolean";
			});
		}
		/** Return whether a text-field key event belongs to an active IME composition. */
		function isComposing(event) {
			return event.nativeEvent.isComposing || Reflect.get(event.nativeEvent, "keyCode") === 229;
		}
		/**
		* Auto-growing free-text answer: a textarea, so a long answer soft-wraps and
		* Shift+Enter breaks a line, over a hidden mirror that owns the height.
		*
		* The mirror renders the draft plus a trailing newline in normal flow and so
		* sizes the grid row (counting rows by '\n' cannot see soft wraps); the
		* textarea shares that one cell and stretches to it, and `rows={1}` keeps the
		* control's own intrinsic height out of the row sizing so the mirror alone
		* decides. Past the mirror's cap the textarea scrolls itself — it is the only
		* scrollport in the stack, there being no second glyph layer to keep aligned.
		* Mirror and textarea MUST share font, line-height, padding and wrapping rules
		* or the two heights diverge.
		*
		* @param props - visual variant, draft text, and the field's event handlers.
		* @returns The mirrored auto-growing field.
		*/
		function AnswerField(props) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: clsx(QuestionComposer_module_css_default.field, props.variant === "inline" ? QuestionComposer_module_css_default.customInline : QuestionComposer_module_css_default.customBlock),
				children: [(0, react_jsx_runtime.jsx)("div", {
					"aria-hidden": true,
					className: QuestionComposer_module_css_default.fieldMirror,
					children: `${props.value}\n`
				}), (0, react_jsx_runtime.jsx)("textarea", {
					autoFocus: props.autoFocus,
					className: QuestionComposer_module_css_default.fieldInput,
					value: props.value,
					disabled: props.disabled,
					rows: 1,
					placeholder: props.placeholder,
					onFocus: props.onFocus,
					onChange: props.onChange,
					onKeyDown: props.onKeyDown
				})]
			});
		}
		/**
		* Composer takeover router. Generic-question drafts live in this entry's
		* Session-scoped Slot store, keyed by the pending carrier, so a strict Session
		* entry remount restores the same request without exposing it to another one.
		*
		* One takeover, two presentations: a request that declares a presentation intent this
		* package renders uses that presentation (a plan review is one decision over one
		* plan, not a question set), and every other request takes the generic flow.
		* The routing lives here, at the one entry that owns the composer seat, so
		* neither presentation can claim a request the other is already rendering.
		*
		* @param props - the selector-matched pending question carrier plus the framework standard kit.
		* @returns The question flow, or the intent's own surface, for this request.
		*/
		function QuestionComposer(props) {
			const question = props.matched;
			const review = (0, react.useMemo)(() => planReviewOf(question.questions), [question]);
			return review === void 0 ? (0, react_jsx_runtime.jsx)(QuestionFlow, {
				pending: question,
				t: props.t,
				useStore: props.useStore,
				useQuestionCard: props.useQuestionCard,
				actions: props.actions
			}, question.key) : (0, react_jsx_runtime.jsx)(PlanReviewPanel, {
				pending: question,
				review,
				t: props.t,
				renderSlot: props.renderSlot
			}, question.key);
		}
		function QuestionFlow({ pending, t, useStore, useQuestionCard, actions }) {
			const descriptionIdPrefix = (0, react.useId)();
			const questions = pending.questions;
			const review = pending.review;
			const markdownLabels = (0, react.useMemo)(() => ({
				code: {
					copyLabel: t("copy"),
					copiedLabel: t("copied"),
					toolbarLabels: {
						codeLabel: t("codeBlock.title"),
						wrapLabel: t("codeBlock.wrap"),
						unwrapLabel: t("codeBlock.unwrap")
					}
				},
				footnotes: t("markdown.footnotes")
			}), [t]);
			const initialDrafts = (0, react.useMemo)(() => {
				const recorded = new Map((review ?? []).map((answer) => [answer.id, answer]));
				return questions.map((item) => {
					const answer = recorded.get(item.id);
					const custom = answer?.custom ?? "";
					return {
						selected: answer !== void 0 ? [...answer.selected] : review === void 0 ? recommendedOptions(item) : [],
						custom,
						skipped: answer !== void 0 && answer.selected.length === 0 && custom === ""
					};
				});
			}, [questions, review]);
			const stored = useStore((state) => state.progressByRequest[pending.key]);
			const validStored = isQuestionDraftProgress(stored, questions.length) ? stored : void 0;
			const storedProgress = review === void 0 ? validStored : void 0;
			const index = validStored?.index ?? 0;
			const drafts = storedProgress?.drafts ?? initialDrafts;
			const restoredWait = storedProgress?.wait ?? (storedProgress?.drafts.some((item, itemIndex) => item.selected.length !== initialDrafts[itemIndex]?.selected.length || item.selected.some((label, labelIndex) => label !== initialDrafts[itemIndex]?.selected[labelIndex]) || item.custom !== "" || item.skipped) === true ? "editing" : void 0);
			const [busy, setBusy] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const card = useQuestionCard(pending.key, (snapshot) => snapshot ?? REMOVED_CARD);
			const canSubmit = card.channel !== "none";
			const locked = busy !== null || review !== void 0;
			const sentVia = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (sentVia.current !== "waterfall" || card.state !== "continued") return;
				sentVia.current = null;
				setBusy(null);
				setError({ key: "error.resubmit" });
			}, [card.state]);
			(0, react.useEffect)(() => {
				if (card.closed) actions.clear(pending.key);
			}, [
				actions,
				card.closed,
				pending.key
			]);
			(0, react.useEffect)(() => {
				actions.prune(pending.liveKeys());
			}, [actions, pending]);
			const waitDisposition = (0, react.useRef)(restoredWait);
			(0, react.useEffect)(() => {
				if (waitDisposition.current === "waiting") pending.takeTime();
				if (waitDisposition.current === "editing") pending.engage();
			}, [pending]);
			const countdown = card.countdown;
			const [minimized, setMinimized] = (0, react.useState)(false);
			const focusedQuestions = (0, react.useRef)(/* @__PURE__ */ new Set());
			const answerSurface = (0, react.useRef)(null);
			const question = questions[index];
			const draft = drafts[index];
			const hasOptions = (question.options?.length ?? 0) > 0;
			const [expandedCopy, setExpandedCopy] = (0, react.useState)({
				index,
				copies: NOTHING_EXPANDED
			});
			const expanded = expandedCopy.index === index ? expandedCopy.copies : NOTHING_EXPANDED;
			const questionToggleLabel = t(expanded.has("question") ? "text.collapse" : "text.expand");
			const toggleCopy = (copy) => {
				const copies = new Set(expanded);
				if (!copies.delete(copy)) copies.add(copy);
				setExpandedCopy({
					index,
					copies
				});
			};
			const replaceProgress = (nextIndex, nextDrafts) => {
				if (nextIndex !== index) {
					if (answerSurface.current !== null) answerSurface.current.scrollTop = 0;
					setExpandedCopy({
						index: nextIndex,
						copies: NOTHING_EXPANDED
					});
				}
				actions.replace(pending.key, {
					index: nextIndex,
					drafts: nextDrafts,
					...waitDisposition.current === void 0 ? {} : { wait: waitDisposition.current }
				});
			};
			const takeTime = () => {
				waitDisposition.current = "waiting";
				pending.takeTime();
				replaceProgress(index, drafts);
			};
			const engage = () => {
				if (waitDisposition.current !== void 0) return;
				waitDisposition.current = "editing";
				pending.engage();
			};
			const focusAnswerSurface = (event) => {
				if (!event.currentTarget.contains(event.relatedTarget)) pending.holdFocus();
			};
			const blurAnswerSurface = (event) => {
				if (!event.currentTarget.contains(event.relatedTarget)) pending.releaseFocus();
			};
			(0, react.useEffect)(() => {
				const release = () => {
					pending.releaseFocus();
				};
				const refocus = () => {
					if (waitDisposition.current === "editing") {
						pending.engage();
						return;
					}
					if (answerSurface.current?.contains(document.activeElement) === true) pending.holdFocus();
				};
				const visibilityChanged = () => {
					if (document.hidden) release();
					else refocus();
				};
				window.addEventListener("blur", release);
				window.addEventListener("focus", refocus);
				document.addEventListener("visibilitychange", visibilityChanged);
				return () => {
					release();
					window.removeEventListener("blur", release);
					window.removeEventListener("focus", refocus);
					document.removeEventListener("visibilitychange", visibilityChanged);
				};
			}, [pending]);
			const dismissFlow = () => {
				if (pending.dismissal === "hide") {
					pending.dismiss();
					return;
				}
				if (!canSubmit) {
					setError({ key: "error.unavailable" });
					return;
				}
				setBusy("cancel");
				setError(null);
				sentVia.current = "waterfall";
				pending.dismiss().catch((cause) => {
					sentVia.current = null;
					setBusy(null);
					setError({ text: cause instanceof Error ? cause.message : String(cause) });
				});
			};
			const updateDraft = (update, nextIndex = index) => {
				engage();
				replaceProgress(nextIndex, drafts.map((item, itemIndex) => itemIndex === index ? update(item) : item));
				setError(null);
			};
			const choose = (label) => {
				updateDraft((current) => {
					if (question.multiSelect === true) {
						const selected = current.selected.includes(label) ? current.selected.filter((item) => item !== label) : [...current.selected, label];
						return {
							...current,
							selected,
							skipped: false
						};
					}
					return {
						selected: [label],
						custom: "",
						skipped: false
					};
				}, question.multiSelect !== true && index < questions.length - 1 ? index + 1 : index);
			};
			const answered = (item) => item.selected.length > 0 || item.custom.trim() !== "";
			const completed = (item) => answered(item) || item.skipped;
			const submitDrafts = (values) => {
				const missing = values.findIndex((item) => !completed(item));
				if (missing >= 0) {
					replaceProgress(missing, values);
					setError({ key: "error.incomplete" });
					return;
				}
				if (!canSubmit) {
					setError({ key: "error.unavailable" });
					return;
				}
				const answer = { answers: questions.map((item, itemIndex) => {
					const value = values[itemIndex];
					if (value.skipped) return {
						id: item.id,
						selected: []
					};
					const custom = value.custom.trim();
					return {
						id: item.id,
						selected: custom === "" || item.multiSelect === true ? value.selected : [],
						...custom === "" ? {} : { custom }
					};
				}) };
				setBusy("answer");
				setError(null);
				const channel = pending.snapshot().channel;
				sentVia.current = channel === "waterfall" ? "waterfall" : null;
				pending.answer(answer).then(() => {
					if (channel !== "rpc") return;
					sentVia.current = null;
					setBusy(null);
					setError(null);
					pending.dismiss().catch(() => {
						setError({ key: "status.sent" });
					});
				}).catch((cause) => {
					sentVia.current = null;
					setBusy(null);
					setError({ text: cause instanceof Error ? cause.message : String(cause) });
				});
			};
			const continueFlow = () => {
				if (!answered(draft)) {
					setError({ key: "error.unanswered" });
					return;
				}
				if (index < questions.length - 1) {
					replaceProgress(index + 1, drafts);
					setError(null);
					return;
				}
				submitDrafts(drafts);
			};
			const draftCustom = (event) => {
				const value = event.target.value;
				updateDraft((current) => ({
					...current,
					selected: question.multiSelect === true ? current.selected : [],
					custom: value,
					skipped: false
				}));
			};
			const continueFromCustom = (event) => {
				if (event.key !== "Enter" || event.shiftKey || isComposing(event)) return;
				event.preventDefault();
				continueFlow();
			};
			const skipQuestion = () => {
				engage();
				const nextDrafts = drafts.map((item, itemIndex) => itemIndex === index ? {
					selected: [],
					custom: "",
					skipped: true
				} : item);
				replaceProgress(index < questions.length - 1 ? index + 1 : index, nextDrafts);
				setError(null);
				if (index < questions.length - 1) return;
				submitDrafts(nextDrafts);
			};
			return (0, react_jsx_runtime.jsx)("div", {
				className: QuestionComposer_module_css_default.frame,
				"data-question-key": pending.key,
				children: (0, react_jsx_runtime.jsxs)("section", {
					className: clsx(QuestionComposer_module_css_default.card, minimized && QuestionComposer_module_css_default.cardMinimized),
					"aria-labelledby": `question-${pending.key}-${String(index)}`,
					children: [(0, react_jsx_runtime.jsxs)("header", {
						className: QuestionComposer_module_css_default.header,
						children: [(question.header !== void 0 || minimized) && (0, react_jsx_runtime.jsxs)("div", {
							className: QuestionComposer_module_css_default.headingBlock,
							children: [question.header !== void 0 && (0, react_jsx_runtime.jsx)("div", {
								className: QuestionComposer_module_css_default.eyebrow,
								children: question.header
							}), minimized && (0, react_jsx_runtime.jsx)("h2", {
								className: QuestionComposer_module_css_default.title,
								id: `question-${pending.key}-${String(index)}`,
								children: question.question
							})]
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: QuestionComposer_module_css_default.headerActions,
							children: [
								countdown !== void 0 && card.waitState !== "waiting" && card.waitState !== "editing" && card.waitState !== "continued" && (0, react_jsx_runtime.jsx)("span", {
									className: QuestionComposer_module_css_default.waitStatus,
									children: t(countdown.running ? "wait.countdown" : "wait.paused", { seconds: Math.ceil(countdown.remainingMs / 1e3) })
								}),
								countdown !== void 0 && card.waitState !== "waiting" && card.waitState !== "editing" && card.waitState !== "continued" && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									className: QuestionComposer_module_css_default.waitButton,
									onClick: takeTime,
									children: t("wait.takeTime")
								}),
								card.state === "continued" && (0, react_jsx_runtime.jsx)("span", {
									className: QuestionComposer_module_css_default.waitStatus,
									children: t("wait.continued")
								}),
								countdown !== void 0 && (card.waitState === "waiting" || card.waitState === "editing") && (0, react_jsx_runtime.jsx)("span", {
									className: QuestionComposer_module_css_default.waitStatus,
									children: t("wait.held")
								}),
								review !== void 0 && (0, react_jsx_runtime.jsx)("span", {
									className: QuestionComposer_module_css_default.waitStatus,
									children: t("review.status")
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: QuestionComposer_module_css_default.iconButton,
									"aria-label": t(minimized ? "nav.maximize" : "nav.minimize"),
									title: t(minimized ? "nav.maximize" : "nav.minimize"),
									"aria-expanded": !minimized,
									disabled: busy !== null,
									onClick: () => {
										setMinimized((current) => !current);
									},
									children: minimized ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: QuestionComposer_module_css_default.iconButton,
									"aria-label": t(pending.dismissal === "hide" ? "nav.close" : "nav.cancel"),
									title: t(pending.dismissal === "hide" ? "nav.close" : "nav.cancel"),
									disabled: busy !== null,
									onClick: dismissFlow,
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, {})
								})
							]
						})]
					}), !minimized && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("div", {
						ref: answerSurface,
						className: QuestionComposer_module_css_default.body,
						"data-question-scroll": true,
						onFocusCapture: focusAnswerSurface,
						onBlurCapture: blurAnswerSurface,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: QuestionComposer_module_css_default.questionTitle,
								"data-expanded": expanded.has("question") || void 0,
								children: [(0, react_jsx_runtime.jsx)("h2", {
									className: clsx(QuestionComposer_module_css_default.title, QuestionComposer_module_css_default.titlePreview),
									id: `question-${pending.key}-${String(index)}`,
									children: question.question
								}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									label: questionToggleLabel,
									side: "top",
									portal: true,
									children: (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: clsx(QuestionComposer_module_css_default.iconButton, QuestionComposer_module_css_default.copyToggle, QuestionComposer_module_css_default.questionToggle),
										"aria-label": questionToggleLabel,
										"aria-expanded": expanded.has("question"),
										"aria-controls": `question-${pending.key}-${String(index)}`,
										"aria-describedby": `question-${pending.key}-${String(index)}`,
										onClick: () => {
											toggleCopy("question");
										},
										children: expanded.has("question") ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})
									})
								})]
							}),
							question.detail !== void 0 && (0, react_jsx_runtime.jsx)("div", {
								className: QuestionComposer_module_css_default.detail,
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
									text: question.detail,
									labels: markdownLabels
								})
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: QuestionComposer_module_css_default.options,
								role: question.multiSelect === true ? "group" : "radiogroup",
								children: [
									(question.options ?? []).map((option, optionIndex) => {
										const selected = draft.selected.includes(option.label);
										const display = parseRecommendedLabel(option.label);
										const hasDescription = option.description !== void 0 && option.description.trim() !== "";
										const descriptionExpanded = expanded.has(optionIndex);
										const descriptionToggleLabel = t(descriptionExpanded ? "text.collapse" : "text.expand");
										const descriptionId = `${descriptionIdPrefix}-question-${String(index)}-option-${String(optionIndex)}-description`;
										return (0, react_jsx_runtime.jsxs)("div", {
											className: clsx(QuestionComposer_module_css_default.optionRow, !locked && QuestionComposer_module_css_default.optionRowInteractive, selected && question.multiSelect !== true && QuestionComposer_module_css_default.optionSelected),
											"data-option-row": true,
											"data-expanded": descriptionExpanded || void 0,
											children: [(0, react_jsx_runtime.jsxs)("button", {
												type: "button",
												className: QuestionComposer_module_css_default.option,
												role: question.multiSelect === true ? "checkbox" : "radio",
												"aria-checked": selected,
												"aria-label": display.label,
												"aria-describedby": hasDescription ? descriptionId : void 0,
												disabled: locked,
												onClick: () => {
													choose(option.label);
												},
												onKeyDown: (event) => {
													if (event.key !== "Enter") return;
													event.preventDefault();
													submitDrafts(drafts);
												},
												children: [question.multiSelect === true ? (0, react_jsx_runtime.jsx)("span", {
													className: clsx(QuestionComposer_module_css_default.checkbox, selected && QuestionComposer_module_css_default.checkboxChecked),
													"aria-hidden": "true",
													children: selected && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 12 })
												}) : (0, react_jsx_runtime.jsx)("span", {
													className: QuestionComposer_module_css_default.number,
													children: optionIndex + 1
												}), (0, react_jsx_runtime.jsxs)("span", {
													className: QuestionComposer_module_css_default.optionCopy,
													children: [(0, react_jsx_runtime.jsxs)("span", {
														className: QuestionComposer_module_css_default.optionLine,
														"data-option-line": true,
														children: [(0, react_jsx_runtime.jsx)("span", {
															className: QuestionComposer_module_css_default.optionLabel,
															children: display.label
														}), display.recommended && (0, react_jsx_runtime.jsx)("span", {
															className: QuestionComposer_module_css_default.badge,
															children: t("option.recommended")
														})]
													}), hasDescription && (0, react_jsx_runtime.jsx)("span", {
														id: descriptionId,
														className: QuestionComposer_module_css_default.description,
														"data-option-description": true,
														children: option.description
													})]
												})]
											}), hasDescription && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
												label: descriptionToggleLabel,
												side: "top",
												portal: true,
												children: (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: clsx(QuestionComposer_module_css_default.iconButton, QuestionComposer_module_css_default.copyToggle, QuestionComposer_module_css_default.descriptionToggle),
													"aria-label": descriptionToggleLabel,
													"aria-expanded": descriptionExpanded,
													"aria-controls": descriptionId,
													"aria-describedby": descriptionId,
													onClick: () => {
														toggleCopy(optionIndex);
													},
													children: descriptionExpanded ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})
												})
											})]
										}, `${option.label}-${String(optionIndex)}`);
									}),
									review !== void 0 && draft.skipped && (0, react_jsx_runtime.jsx)("p", {
										className: QuestionComposer_module_css_default.reviewNote,
										children: t("review.skipped")
									}),
									(review === void 0 || draft.custom !== "") && (hasOptions ? (0, react_jsx_runtime.jsxs)("div", {
										className: clsx(QuestionComposer_module_css_default.customRow, draft.custom !== "" && QuestionComposer_module_css_default.customRowActive, question.multiSelect !== true && draft.selected.length > 0 && QuestionComposer_module_css_default.customRowYielded),
										children: [question.multiSelect === true ? (0, react_jsx_runtime.jsx)("span", {
											className: clsx(QuestionComposer_module_css_default.checkbox, draft.custom !== "" && QuestionComposer_module_css_default.checkboxChecked),
											"aria-hidden": "true",
											children: draft.custom !== "" && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 12 })
										}) : (0, react_jsx_runtime.jsx)("span", {
											className: QuestionComposer_module_css_default.number,
											"aria-hidden": "true",
											children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular, { size: 12 })
										}), (0, react_jsx_runtime.jsx)(AnswerField, {
											variant: "inline",
											value: draft.custom,
											disabled: locked,
											placeholder: t("custom.placeholder"),
											onChange: draftCustom,
											onKeyDown: continueFromCustom
										})]
									}) : (0, react_jsx_runtime.jsx)(AnswerField, {
										autoFocus: canSubmit && countdown === void 0 && !locked && !focusedQuestions.current.has(index),
										variant: "block",
										value: draft.custom,
										disabled: locked,
										placeholder: t("custom.placeholder"),
										onFocus: () => {
											focusedQuestions.current.add(index);
										},
										onChange: draftCustom,
										onKeyDown: continueFromCustom
									}))
								]
							})
						]
					}), (0, react_jsx_runtime.jsxs)("footer", {
						className: QuestionComposer_module_css_default.footer,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: QuestionComposer_module_css_default.pager,
								children: [
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: QuestionComposer_module_css_default.iconButton,
										"aria-label": t("nav.prev"),
										disabled: index === 0 || busy !== null,
										onClick: () => {
											replaceProgress(index - 1, drafts);
											setError(null);
										},
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutlineRegular, {})
									}),
									(0, react_jsx_runtime.jsxs)("span", {
										className: QuestionComposer_module_css_default.progress,
										children: [
											index + 1,
											" / ",
											questions.length
										]
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: QuestionComposer_module_css_default.iconButton,
										"aria-label": t("nav.next"),
										disabled: index === questions.length - 1 || busy !== null,
										onClick: () => {
											replaceProgress(index + 1, drafts);
											setError(null);
										},
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {})
									})
								]
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: QuestionComposer_module_css_default.feedback,
								role: "status",
								children: error === null ? null : "key" in error ? t(error.key) : error.text
							}),
							review === void 0 && (0, react_jsx_runtime.jsxs)("div", {
								className: QuestionComposer_module_css_default.footerActions,
								children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									disabled: busy !== null,
									onClick: skipQuestion,
									children: t("action.skip")
								}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									disabled: busy !== null || !answered(draft) || index === questions.length - 1 && !canSubmit,
									onClick: continueFlow,
									children: busy === "answer" ? t("submitting") : index === questions.length - 1 ? t("submit") : t("action.next")
								})]
							})
						]
					})] })]
				})
			});
		}
