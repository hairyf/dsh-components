// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/conversation-nodes/command.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

const COMPACT_KIND = "compact-checkpoint";
function commandFromRun(match) {
	if (match.event.type !== "command/run") throw new Error("command start requires command/run");
	const data = match.event.data;
	return {
		kind: "command",
		seq: match.event.seq,
		time: match.event.time,
		commandId: data.commandId,
		name: data.name,
		args: data.args ?? null,
		outcome: null
	};
}
function commandFromDone(match, previous) {
	if (match.event.type !== "command/done") throw new Error("command update requires command/done");
	const data = match.event.data;
	const sourceEventSeq = data.kind === "success" && data.sourceEventSeq !== void 0 && Number.isSafeInteger(data.sourceEventSeq) && data.sourceEventSeq >= 0 ? data.sourceEventSeq : void 0;
	return {
		kind: "command",
		seq: previous?.seq ?? match.event.seq,
		time: previous?.time ?? match.event.time,
		commandId: data.commandId,
		name: previous?.name ?? null,
		args: previous?.args ?? null,
		outcome: {
			kind: data.kind,
			...data.text === void 0 ? {} : { text: data.text },
			...sourceEventSeq === void 0 ? {} : { sourceEventSeq }
		}
	};
}
/**
* Read correlation identity from a compaction replacement checkpoint.
* @param event - candidate Session event.
* @returns correlated compaction and optional command identity.
*/
function compactSource(event) {
	if (event.type !== "user/message" || !isReplacementSurfaceEvent(event)) return void 0;
	const source = event.data.source;
	if (source.kind !== COMPACT_KIND || typeof source.compactionId !== "string") return void 0;
	return {
		compactionId: source.compactionId,
		...source.sourceCommandId === void 0 ? {} : { sourceCommandId: source.sourceCommandId }
	};
}
/**
* Build the visible summary marker from optional lifecycle evidence.
* @param match - compaction/summary Match, when loaded.
* @param checkpoint - replacement checkpoint Match.
* @returns final compaction summary Node data.
*/
function compactSummary(match, checkpoint) {
	let summary = null;
	let shadowedItemCount = null;
	let shadowedTokenCount = null;
	if (match?.event.type === "compaction/summary") {
		const data = match.event.data;
		if (Array.isArray(data.summary)) {
			const text = data.summary.map((block) => block.type === "text" ? block.text : "").join("");
			summary = text.trim() === "" ? null : text;
		}
		shadowedItemCount = Array.isArray(data.shadowedSeqs) && data.shadowedSeqs.every((seq) => Number.isSafeInteger(seq) && seq >= 0) ? data.shadowedSeqs.length : null;
		shadowedTokenCount = Number.isSafeInteger(data.shadowedTokenCount) && data.shadowedTokenCount >= 0 ? data.shadowedTokenCount : null;
	}
	return {
		kind: "compaction",
		seq: checkpoint.event.seq,
		time: checkpoint.event.time,
		summary,
		summaryEventSeq: match?.event.seq ?? null,
		shadowedItemCount,
		shadowedTokenCount
	};
}
function fallbackState$4(context) {
	const done = context.matches.find((match) => match.event.type === "command/done");
	const checkpoint = context.matches.find((match) => compactSource(match.event) !== void 0);
	const summary = context.matches.find((match) => match.event.type === "compaction/summary");
	if (checkpoint === void 0) return done === void 0 ? void 0 : { command: commandFromDone(done) };
	const source = compactSource(checkpoint.event);
	if (source?.sourceCommandId === void 0) return done === void 0 ? void 0 : { command: commandFromDone(done) };
	return {
		command: done === void 0 ? {
			kind: "command",
			seq: checkpoint.event.seq,
			time: checkpoint.event.time,
			commandId: source.sourceCommandId,
			name: "compact",
			args: null,
			outcome: null
		} : {
			...commandFromDone(done),
			name: "compact"
		},
		checkpoint,
		...summary === void 0 ? {} : { summary }
	};
}
/**
* Fold shared compaction evidence into a Definition-owned State.
* @param state - current business State carrying optional compaction evidence.
* @param match - next compaction lifecycle Match.
* @returns adopted State, preserving reference identity when the Match adds no evidence.
*/
function updateCompactionState(state, match) {
	if (match.event.type === "compaction/summary") return {
		...state,
		summary: match
	};
	if (compactSource(match.event) !== void 0) return {
		...state,
		checkpoint: match
	};
	return state;
}
/** Slash-command lifecycle, including integrated manual compaction, Definition. */
const commandDefinition = {
	kind: "command",
	target: "chat",
	match: (event) => {
		if (event.type === "command/run") return {
			id: String(event.data.commandId),
			role: "start"
		};
		if (event.type === "command/done") return {
			id: String(event.data.commandId),
			role: "update"
		};
		const checkpoint = compactSource(event);
		if (checkpoint?.sourceCommandId !== void 0) return {
			id: String(checkpoint.sourceCommandId),
			role: "update"
		};
		if (event.type === "compaction/start" || event.type === "compaction/summary" || event.type === "compaction/end") {
			if (event.data.sourceCommandId !== void 0) return {
				id: String(event.data.sourceCommandId),
				role: "update"
			};
		}
		return null;
	},
	start: (_context, match) => ({ command: commandFromRun(match) }),
	update: (context, match) => {
		if (match.event.type === "command/done") return {
			...context.state,
			command: commandFromDone(match, context.state.command)
		};
		return updateCompactionState(context.state, match);
	},
	buildViewNode: (context) => {
		const state = context.state ?? fallbackState$4(context);
		if (state === void 0) return null;
		if (state.command.name !== "compact") return chatNode(context, "command", state.command.seq, state.command);
		const compaction = state.checkpoint === void 0 ? null : compactSummary(state.summary, state.checkpoint);
		const data = {
			command: state.command,
			compaction
		};
		return chatNode(context, "manual-compaction", compaction?.seq ?? state.command.seq, data);
	}
};
/**
* Register the command lifecycle business contribution.
* @param ctx - owning UI Conversation context.
*/
function registerCommandConversationNode(ctx) {
	ctx.uiConversation.events.register(commandDefinition);
}
