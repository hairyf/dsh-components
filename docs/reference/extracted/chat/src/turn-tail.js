// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/conversation-nodes/turn-tail.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

function isSessionEvent(event) {
	return event.type !== "assistant/live-chunk";
}
function turnCoordinates(event) {
	if (event.type === "assistant/message" || event.type === "assistant/attempt" || event.type === "assistant/live-chunk" || event.type === "step/start" || event.type === "step/end") return {
		turn: event.data.turn,
		step: event.data.step
	};
	if (event.type === "llm/retry" || event.type === "llm/retry-started") return {
		turn: event.data.turn,
		step: event.data.step
	};
}
function turnLocation(context) {
	const location = context.start?.location ?? context.matches[0]?.location;
	return location?.kind === "turn" || location?.kind === "step" ? location.turn : void 0;
}
function hasText(data) {
	return data.finalNode !== void 0 && data.blocks.some((block) => block.kind === "text" && block.text.trim() !== "");
}
function tailData(context) {
	const end = context.state === void 0 ? context.matches.find((match) => match.event.type === "turn/end") : context.state.end;
	if (end?.event.type !== "turn/end") return null;
	const turn = turnLocation(context);
	if (turn === void 0) return null;
	const finalized = turn.steps.map((step) => step.data.get("assistant-step")).filter((candidate) => candidate !== void 0).filter((candidate) => candidate.finalNode !== void 0).sort((left, right) => left.finalNode.seq - right.finalNode.seq);
	const closing = finalized.findLast(hasText) ?? null;
	let latestTranscriptSeq = finalized.at(-1)?.finalNode.seq;
	for (const match of context.matches) {
		const event = match.event;
		const candidate = event.type === "tool/call" || event.type === "tool/result" && event.surfaceOp === "append" || event.type === "turn/end" && event.data.reason.kind === "error" || event.type === "llm/retry" ? event.seq : void 0;
		if (candidate !== void 0 && (latestTranscriptSeq === void 0 || candidate > latestTranscriptSeq)) latestTranscriptSeq = candidate;
	}
	const tokenUsage = context.start?.event.type === "turn/start" ? deriveTurnTokenUsage(context.matches.map((match) => match.event).filter(isSessionEvent)) : void 0;
	return {
		turn: end.event.data.turn,
		seq: end.event.seq,
		time: end.event.time,
		closing,
		branchUnavailable: closing === null || latestTranscriptSeq !== closing.finalNode.seq,
		...tokenUsage === void 0 ? {} : { tokenUsage }
	};
}
/** Completed-turn footer Definition independent of any Assistant row. */
const turnTailDefinition = {
	kind: "turn-tail",
	target: "chat",
	match: (event) => {
		if (event.type === "turn/start") return {
			id: String(event.data.turn),
			role: "start"
		};
		if (event.type === "turn/end") return {
			id: String(event.data.turn),
			role: "update"
		};
		if (event.type === "tool/call" || event.type === "tool/result") return {
			id: String(event.data.turn),
			role: "update"
		};
		const coordinates = turnCoordinates(event);
		if (coordinates !== void 0) return {
			id: String(coordinates.turn),
			role: "update"
		};
		return null;
	},
	start: (_context, match) => {
		if (match.event.type !== "turn/start") throw new Error("turn-tail start requires turn/start");
		return { turn: match.event.data.turn };
	},
	update: (context, match) => match.event.type === "turn/end" ? {
		...context.state,
		end: match
	} : context.state,
	publication: (match) => match.event.type === "turn/end" ? "immediate" : "none",
	buildLocationData: (context, scope) => {
		if (scope !== "turn") return null;
		const value = tailData(context);
		return value === null ? null : {
			kind: "turn",
			turn: value.turn,
			key: "turn-tail",
			value
		};
	},
	buildViewNode: (context) => {
		const data = turnLocation(context)?.data.get("turn-tail");
		return data === void 0 ? null : chatNode(context, "turn-tail", data.seq + CHAT_SYNTHETIC_SEQ_OFFSETS.finalizedFollowup, data, { groupTree: "turn" });
	}
};
/**
* Register completed-Turn footer data and its Chat node contribution.
* @param ctx - owning UI Conversation context.
*/
function registerTurnTailConversationNode(ctx) {
	const match = turnTailDefinition.match.bind(turnTailDefinition);
	ctx.uiConversation.events.register({
		...turnTailDefinition,
		match: {
			"turn/start": match,
			"turn/end": match,
			"tool/call": match,
			"tool/result": match,
			"assistant/message": match,
			"assistant/attempt": match,
			"assistant/live-chunk": match,
			"step/start": match,
			"step/end": match,
			"llm/retry": match,
			"llm/retry-started": match
		}
	});
}
