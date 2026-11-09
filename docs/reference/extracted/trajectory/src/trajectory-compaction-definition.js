// Extracted from @deepseek-ai/dsh-client-ui-trajectory (lib/client.js); region lib/types/client/trajectory-compaction-definition.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

function checkpointId(event) {
	if (event.type !== "user/message") return void 0;
	const source = event.data.source;
	return source.kind === "compact-checkpoint" && typeof source.compactionId === "string" && source.compactionId !== "" ? source.compactionId : void 0;
}
function eventCompactionId(event) {
	if (event.type !== "compaction/start" && event.type !== "compaction/summary" && event.type !== "compaction/end") return void 0;
	const value = event.data.compactionId;
	return typeof value === "string" && value !== "" ? value : void 0;
}
function requestFromState(state) {
	const start = state.start.event;
	if (start.type !== "compaction/start") return void 0;
	const summary = state.summary?.event;
	const end = state.end?.event;
	const checkpoint = state.checkpoint?.event;
	return {
		purpose: "compaction",
		startSeq: start.seq,
		turn: start.data.turn,
		step: 0,
		startedAt: start.time,
		completedAt: end?.type === "compaction/end" ? end.time : null,
		status: end?.type !== "compaction/end" ? "running" : end.data.error === void 0 ? "complete" : "error",
		...end?.type === "compaction/end" && end.data.error !== void 0 ? { error: end.data.error } : {},
		...summary?.type !== "compaction/summary" ? {} : {
			resultSeq: summary.seq,
			summary: summary.data.summary,
			...summary.data.rawOutput === void 0 ? {} : { rawOutput: summary.data.rawOutput },
			providerMetadata: {
				provider: summary.data.provider,
				model: summary.data.model
			},
			requestConfig: {
				provider: summary.data.provider,
				model: summary.data.model,
				purpose: "compaction",
				...summary.data.maxTokens === void 0 ? {} : { maxTokens: summary.data.maxTokens }
			},
			...summary.data.usage === void 0 ? {} : { usage: summary.data.usage }
		},
		...checkpoint?.type === "user/message" ? { replacementSeq: checkpoint.seq } : {}
	};
}
const trajectoryCompactionDefinition = {
	kind: "trajectory-compaction",
	target: "trajectory",
	match: (event) => {
		const compactId = eventCompactionId(event);
		if (compactId !== void 0) return {
			id: compactId,
			role: event.type === "compaction/start" ? "start" : "update"
		};
		const checkpoint = checkpointId(event);
		return checkpoint === void 0 ? null : {
			id: checkpoint,
			role: "update"
		};
	},
	start: (_context, match) => {
		if (match.event.type !== "compaction/start") throw new Error("trajectory-compaction start requires compaction/start");
		return { start: match };
	},
	update: (context, match) => {
		if (match.event.type === "compaction/summary") return {
			...context.state,
			summary: match
		};
		if (match.event.type === "compaction/end") return {
			...context.state,
			end: match
		};
		return checkpointId(match.event) === void 0 ? context.state : {
			...context.state,
			checkpoint: match
		};
	},
	buildViewNode: (context) => {
		if (context.state === void 0) return null;
		const request = requestFromState(context.state);
		return request === void 0 ? null : trajectoryNode(context, request.startSeq, {
			kind: "compaction",
			request
		});
	}
};
const trajectorySessionEndDefinition = {
	kind: "trajectory-session-end",
	target: "trajectory",
	match: (event) => event.type === "session/end-seed" ? {
		id: String(event.seq),
		role: "start"
	} : null,
	start: (_context, match) => ({
		seq: match.event.seq,
		time: match.event.time
	}),
	update: (context) => context.state,
	buildViewNode: (context) => context.state === void 0 ? null : trajectoryNode(context, context.state.seq, {
		kind: "session-end",
		seq: context.state.seq,
		time: context.state.time
	})
};
/**
* Register Trajectory compaction requests and session boundaries.
*
* @param ctx - Plugin context receiving the Definitions.
*/
function registerTrajectoryCompactionDefinitions(ctx) {
	ctx.uiConversation.events.register(trajectoryCompactionDefinition);
	ctx.uiConversation.events.register(trajectorySessionEndDefinition);
}
