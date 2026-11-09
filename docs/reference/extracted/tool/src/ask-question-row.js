// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/toolviews/ask-question-row.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function parseJson(text) {
	try {
		return JSON.parse(text);
	} catch {
		return;
	}
}
/** Answer records from the result JSON; null when the result is malformed. */
function answerEntries(text) {
	const parsed = parseJson(text);
	if (!isRecord(parsed)) return null;
	const answers = parsed.answers;
	if (!Array.isArray(answers) || !answers.every(isRecord)) return null;
	const entries = [];
	for (const answer of answers) {
		if (typeof answer.id !== "string" || !Array.isArray(answer.selected) || !answer.selected.every((item) => typeof item === "string") || answer.custom !== void 0 && typeof answer.custom !== "string") return null;
		entries.push({
			id: answer.id,
			selected: answer.selected,
			...answer.custom === void 0 ? {} : { custom: answer.custom }
		});
	}
	return entries;
}
/** Answers from a submitted steer that still awaits admission to a step. */
function queuedAnswerEntries(message, callId) {
	if (!isRecord(message) || !Array.isArray(message.content)) return null;
	const content = message.content[0];
	if (!isRecord(content) || content.type !== "text" || typeof content.text !== "string") return null;
	const parsed = parseJson(content.text);
	if (!isRecord(parsed) || parsed.kind !== "answer_to_pending_question" || parsed.callId !== callId) return null;
	return answerEntries(content.text);
}
/** One question's choices from call JSON; absent when any entry is malformed. */
function optionEntries(value) {
	if (!Array.isArray(value)) return void 0;
	const options = [];
	for (const option of value) {
		if (!isRecord(option) || typeof option.label !== "string") return void 0;
		options.push({
			label: option.label,
			...typeof option.description === "string" ? { description: option.description } : {}
		});
	}
	return options;
}
/**
* Questions from call JSON; null when pairing with answers would be ambiguous.
* The optional presentation fields are carried for the read-only answer panel,
* which renders the same option lists the user chose from; a malformed one is
* dropped rather than failing the whole call, because the transcript card needs
* only the id and the question text.
*/
function questionEntries(argsRaw) {
	const parsed = parseJson(argsRaw);
	if (!isRecord(parsed) || !Array.isArray(parsed.questions) || parsed.questions.length === 0) return null;
	const questions = [];
	const ids = /* @__PURE__ */ new Set();
	for (const question of parsed.questions) {
		if (!isRecord(question) || typeof question.id !== "string" || typeof question.question !== "string" || ids.has(question.id)) return null;
		ids.add(question.id);
		const options = optionEntries(question.options);
		questions.push({
			id: question.id,
			question: question.question,
			...typeof question.header === "string" ? { header: question.header } : {},
			...typeof question.detail === "string" ? { detail: question.detail } : {},
			...options === void 0 ? {} : { options },
			...typeof question.multi_select === "boolean" ? { multiSelect: question.multi_select } : {}
		});
	}
	return questions;
}
/** Pair questions with result entries by their echoed stable ids. */
function pairAnswers(questions, answers) {
	if (questions.length !== answers.length) return null;
	const byId = /* @__PURE__ */ new Map();
	for (const answer of answers) {
		if (byId.has(answer.id)) return null;
		byId.set(answer.id, answer);
	}
	const paired = [];
	for (const question of questions) {
		const answer = byId.get(question.id);
		if (answer === void 0) return null;
		paired.push({
			id: question.id,
			question: question.question,
			answers: [...answer.selected, ...answer.custom === void 0 || answer.custom === "" ? [] : [answer.custom]]
		});
	}
	return paired;
}
/**
* Answer summary, transcript content, and panel material from one recorded
* answer batch, whether the result carried it in time or a late reply did.
* @param questions - The call's questions, or null when they failed validation.
* @param answers - The recorded answer batch.
* @param t - Row translator.
* @returns What the answered row shows.
*/
function answeredPresentation(questions, answers, t) {
	const answered = answers.filter((answer) => answer.selected.length > 0 || (answer.custom ?? "") !== "").length;
	const paired = questions === null ? null : pairAnswers(questions, answers);
	return {
		summary: t("ask.answered", {
			answered,
			total: answers.length
		}),
		transcript: paired === null ? null : {
			kind: "answered",
			questions: paired,
			skippedLabel: t("ask.skipped")
		},
		record: paired === null || questions === null ? void 0 : {
			questions,
			answers
		}
	};
}
/** Best-effort answered-count summary when strict transcript pairing fails. */
function answeredSummary(text, t) {
	const parsed = parseJson(text);
	if (!isRecord(parsed)) return null;
	const answers = parsed.answers;
	if (!Array.isArray(answers) || !answers.every(isRecord)) return null;
	const answered = answers.filter((a) => Array.isArray(a.selected) && a.selected.length > 0 || typeof a.custom === "string" && a.custom !== "").length;
	return t("ask.answered", {
		answered,
		total: answers.length
	});
}
/** Whether a successful tool result records a still-answerable timed question. */
function isPendingResult(text) {
	const parsed = parseJson(text);
	return isRecord(parsed) && parsed.pending === true && typeof parsed.callId === "string";
}
/** Summarizes a pending, answered, cancelled, or interrupted question set. */
function AskQuestionRow({ callId, toolName, block, inspect, useDisclosure, useProjection, revealPanel, reviewPanel, t }) {
	const model = toolRowModel(toolName, block);
	const answerable = useProjection("userQuestions", (view) => view?.active.some((row) => row.callId === callId) ?? false);
	const settled = useProjection("userQuestions", (view) => view?.settled.find((row) => row.callId === callId));
	const queuedReply = useProjection("inbox", (view) => {
		const matches = (message) => {
			const source = isRecord(message) ? message.source : void 0;
			return isRecord(source) && source.kind === "user-question-reply" && source.callId === callId;
		};
		return view?.["next-step"].find(matches) ?? view?.["next-turn"].find(matches);
	});
	const reopen = (0, react.useCallback)(() => revealPanel(callId), [callId, revealPanel]);
	const code = "kind" in block ? block.error?.code : void 0;
	const argsRaw = model.bodyRaw ?? "";
	let summary = model.summary;
	let state = model.state;
	let transcript = null;
	let rowAction;
	let rowActionLabel = t("ask.reopen");
	if (code === "ASK_CANCELLED") {
		summary = t("ask.cancelled");
		state = "ok";
		const questions = questionEntries(argsRaw);
		if (questions !== null) transcript = {
			kind: "unanswered",
			questions,
			verdict: t("ask.cancelledDetail")
		};
	} else if (code === "ASK_ABORTED") {
		summary = t("ask.interrupted");
		state = "stopped";
		const questions = questionEntries(argsRaw);
		if (questions !== null) transcript = {
			kind: "unanswered",
			questions,
			verdict: t("ask.interruptedDetail")
		};
	} else if (model.state === "running") {
		summary = t("ask.waiting");
		if (answerable) rowAction = reopen;
	} else if (code === "TOOL_OUTCOME_UNKNOWN" && (answerable || settled !== void 0)) {
		state = "ok";
		const questions = questionEntries(argsRaw);
		if (answerable) {
			summary = t("ask.pending");
			if (questions !== null) transcript = {
				kind: "unanswered",
				questions,
				verdict: t("ask.pendingDetail")
			};
			rowAction = reopen;
		} else if (settled?.answers.length === 0) {
			summary = t("ask.closed");
			if (questions !== null) transcript = {
				kind: "unanswered",
				questions,
				verdict: t("ask.closedDetail")
			};
		} else if (settled !== void 0) {
			const presentation = answeredPresentation(questions, settled.answers, t);
			summary = presentation.summary;
			transcript = presentation.transcript;
			const record = presentation.record;
			if (record !== void 0) {
				rowAction = () => reviewPanel(callId, record);
				rowActionLabel = t("ask.review");
			}
		}
	} else if ("kind" in block && model.state === "ok") {
		const text = singleResultText(block);
		if (text !== void 0) {
			const questions = questionEntries(argsRaw);
			const pending = isPendingResult(text);
			if (pending && answerable) {
				summary = t("ask.pending");
				if (questions !== null) transcript = {
					kind: "unanswered",
					questions,
					verdict: t("ask.pendingDetail")
				};
				rowAction = reopen;
			} else if (pending && (settled === void 0 || settled.answers.length === 0)) {
				summary = t("ask.closed");
				if (questions !== null) transcript = {
					kind: "unanswered",
					questions,
					verdict: t("ask.closedDetail")
				};
			} else {
				const answers = settled?.answers ?? answerEntries(text);
				const presentation = answers === null ? null : answeredPresentation(questions, answers, t);
				summary = presentation?.summary ?? answeredSummary(text, t) ?? model.summary;
				transcript = presentation?.transcript ?? null;
				const record = settled === void 0 ? void 0 : presentation?.record;
				if (record !== void 0) {
					rowAction = () => reviewPanel(callId, record);
					rowActionLabel = t("ask.review");
				}
			}
		}
	}
	if (answerable && queuedReply !== void 0 && rowAction === reopen) {
		const answers = queuedAnswerEntries(queuedReply, callId);
		const presentation = answers === null ? null : answeredPresentation(questionEntries(argsRaw), answers, t);
		if (presentation?.record !== void 0) {
			summary = presentation.summary;
			transcript = presentation.transcript;
			rowAction = () => false;
			rowActionLabel = t("ask.review");
		}
	}
	if (rowAction !== void 0) return (0, react_jsx_runtime.jsx)(QuestionToolRow, {
		useDisclosure,
		t,
		summary,
		bodyRaw: transcript === null ? model.bodyRaw : null,
		output: transcript === null ? model.output : null,
		askQuestion: transcript,
		state,
		inspect,
		openPanel: rowAction,
		panelLabel: rowActionLabel
	});
	return (0, react_jsx_runtime.jsx)(ToolRow, {
		useDisclosure,
		t,
		variant: model.variant,
		toolName,
		icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconQuestionOutlineRegular, {}),
		title: t(model.titleKey),
		summary,
		bodyRaw: transcript === null ? model.bodyRaw : null,
		output: transcript === null ? model.output : null,
		askQuestion: transcript,
		state,
		inspect
	});
}
/** Registers the ask-user-question conversation row. */
const askQuestionToolview = {
	name: "ask-question-toolview",
	inject: ["slots"],
	apply(ctx) {
		ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
			name: "tool.call.toolview",
			key: "ask_user_question",
			locale: CONVERSATION_NS,
			inject: (sessionId) => ({
				revealPanel: (callId) => ctx.get("userQuestionPanels")?.reveal(sessionId, callId) ?? false,
				reviewPanel: (callId, record) => ctx.get("userQuestionPanels")?.review(sessionId, callId, record) ?? false
			})
		}, AskQuestionRow));
	}
};
