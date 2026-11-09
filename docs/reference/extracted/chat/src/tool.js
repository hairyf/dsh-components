// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/conversation-nodes/tool.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

const MAX_DEPTH = 256;
const projectedBlocks = /* @__PURE__ */ new WeakMap();
function jsonArguments(value) {
	return JSON.stringify(value);
}
function rootCall(match, previous) {
	if (match.event.type !== "tool/call") throw new Error("tool-call start requires tool/call");
	return {
		phase: "start",
		callId: String(match.event.data.callId),
		name: match.event.data.name,
		argsRaw: match.event.data.arguments,
		args: previous === void 0 ? PartialArguments.fromText(match.event.data.arguments) : previous.args.settle(match.event.data.arguments),
		turn: match.event.data.turn,
		step: match.event.data.step,
		time: match.event.time,
		subCalls: []
	};
}
/**
* Retain argument fragments in the named call's lazy view. Root replacement
* belongs to publication, after all pending fragments can be observed together.
*/
function applyDelta(state, match) {
	const event = match.event;
	if (event.type !== "assistant/live-chunk") return state;
	const chunk = event.data.chunk;
	const root = state.root;
	if (chunk.type === "block-end" && chunk.block.type === "tool-call") {
		if (root === void 0 || "kind" in root || root.phase !== "preparing") return state;
		return {
			...state,
			root: {
				...root,
				name: chunk.block.name,
				args: root.args.settle(chunk.block.arguments)
			}
		};
	}
	if (chunk.type !== "tool-call-delta") return state;
	if (root === void 0) {
		if (!chunk.name) return state;
		const args = new PartialArguments();
		args.append(chunk.argumentsDelta);
		return {
			...state,
			root: {
				phase: "preparing",
				callId: String(chunk.id),
				name: chunk.name,
				turn: event.data.turn,
				step: event.data.step,
				time: event.time,
				subCalls: [],
				args
			}
		};
	}
	if ("kind" in root || root.phase !== "preparing" || root.args.isSealed) return state;
	root.args.append(chunk.argumentsDelta);
	return state;
}
function preparingBlock(root, current) {
	const changed = root.args.refresh();
	if (!changed && current !== void 0 && !("kind" in current) && current.phase === "preparing" && current.name === root.name && current.args === root.args) return current;
	return changed ? { ...root } : root;
}
function rootResult(match, previous) {
	if (match.event.type !== "tool/result") return void 0;
	const message = match.event.data.message;
	return {
		kind: "tool-result",
		seq: match.event.seq,
		time: match.event.time,
		callId: String(message.source.callId),
		name: previous?.name ?? "",
		args: previous?.args ?? PartialArguments.EMPTY,
		call: previous === void 0 ? null : {
			name: previous.name,
			argsRaw: previous.argsRaw
		},
		callTime: previous?.time ?? null,
		content: message.content,
		isError: message.isError === true,
		...match.event.data.error === void 0 ? {} : { error: match.event.data.error },
		meta: match.event.data.meta,
		subCalls: []
	};
}
function childCall(match, data) {
	return {
		phase: "start",
		callId: data.subCallId,
		parentCallId: data.parentCallId,
		name: data.name,
		argsRaw: jsonArguments(data.arguments),
		args: PartialArguments.fromObject(data.arguments),
		turn: locationTurn(match),
		step: locationStep(match),
		time: match.event.time,
		subCalls: []
	};
}
function childResult(match, data, previous) {
	return {
		kind: "tool-result",
		seq: match.event.seq,
		time: match.event.time,
		callId: data.subCallId,
		parentCallId: data.parentCallId,
		name: data.name,
		args: previous !== void 0 && !("kind" in previous) ? previous.args : PartialArguments.fromObject(data.arguments),
		call: {
			name: data.name,
			argsRaw: jsonArguments(data.arguments)
		},
		callTime: previous?.time ?? null,
		content: data.content ?? [],
		meta: data.meta,
		isError: data.isError === true,
		...data.error === void 0 ? {} : { error: data.error },
		subCalls: []
	};
}
function locationTurn(match) {
	return match.location.kind === "step" || match.location.kind === "turn" ? match.location.turn.turn : 0;
}
function locationStep(match) {
	return match.location.kind === "step" ? match.location.step.step : 0;
}
function acceptsEdge(state, parent, child) {
	if (parent === child || state.parents.has(child)) return false;
	let cursor = parent;
	let parentDepth = 0;
	const ancestors = /* @__PURE__ */ new Set();
	while (cursor !== void 0) {
		if (cursor === child || ancestors.has(cursor)) return false;
		ancestors.add(cursor);
		parentDepth++;
		cursor = state.parents.get(cursor);
	}
	const pending = [{
		callId: child,
		depth: 1
	}];
	const descendants = /* @__PURE__ */ new Set();
	let subtreeDepth = 0;
	for (const candidate of pending) {
		if (descendants.has(candidate.callId)) return false;
		descendants.add(candidate.callId);
		subtreeDepth = Math.max(subtreeDepth, candidate.depth);
		for (const nested of state.children.get(candidate.callId) ?? []) pending.push({
			callId: nested.callId,
			depth: candidate.depth + 1
		});
	}
	return parentDepth + subtreeDepth <= MAX_DEPTH;
}
function updateDispatch(state, match) {
	const event = match.event;
	if (event.type !== "tool/ptc-dispatch-start" && event.type !== "tool/ptc-dispatch") return state;
	const data = event.data;
	const parentCallId = String(data.parentCallId);
	const subCallId = String(data.subCallId);
	const siblings = state.children.get(parentCallId) ?? [];
	const index = siblings.findIndex((candidate) => candidate.callId === subCallId);
	if (event.type === "tool/ptc-dispatch-start") {
		if (index >= 0 || !acceptsEdge(state, parentCallId, subCallId)) return state;
		const children = new Map(state.children);
		children.set(parentCallId, [...siblings, childCall(match, data)]);
		const parents = new Map(state.parents);
		parents.set(subCallId, parentCallId);
		return {
			...state,
			children,
			parents
		};
	}
	if (index < 0 && !acceptsEdge(state, parentCallId, subCallId)) return state;
	const settled = childResult(match, data, index < 0 ? void 0 : siblings[index]);
	const children = new Map(state.children);
	children.set(parentCallId, index < 0 ? [...siblings, settled] : siblings.map((child, at) => at === index ? settled : child));
	const parents = new Map(state.parents);
	if (index < 0) parents.set(subCallId, parentCallId);
	return {
		...state,
		children,
		parents
	};
}
function projectBlock(block, state, interruptedAt, visited = /* @__PURE__ */ new Set(), depth = 1) {
	if (!("kind" in block) && block.phase === "preparing") return block;
	if (visited.has(block.callId) || depth > MAX_DEPTH) return {
		...block,
		subCalls: []
	};
	const nextVisited = new Set(visited);
	nextVisited.add(block.callId);
	const children = (state.children.get(block.callId) ?? block.subCalls).map((child) => projectBlock(child, state, interruptedAt, nextVisited, depth + 1));
	const interruptionSeq = "kind" in block ? void 0 : interruptedAt?.seq;
	const interruptionTime = "kind" in block ? void 0 : interruptedAt?.time;
	const cached = projectedBlocks.get(block);
	if (cached !== void 0 && cached.interruptionSeq === interruptionSeq && cached.interruptionTime === interruptionTime && sameReferences(cached.children, children)) return cached.value;
	const projected = "kind" in block || interruptedAt === void 0 ? sameReferences(block.subCalls, children) ? block : {
		...block,
		subCalls: children
	} : {
		kind: "tool-result",
		seq: interruptedAt.seq + CHAT_SYNTHETIC_SEQ_OFFSETS.interruptedFollowup,
		time: interruptedAt.time,
		callId: block.callId,
		...block.parentCallId === void 0 ? {} : { parentCallId: block.parentCallId },
		name: block.name,
		args: block.args,
		call: {
			name: block.name,
			argsRaw: block.argsRaw
		},
		callTime: block.time,
		content: [],
		isError: true,
		error: {
			name: "Interrupted",
			code: "interrupted"
		},
		subCalls: children
	};
	projectedBlocks.set(block, {
		children,
		interruptionSeq,
		interruptionTime,
		value: projected
	});
	return projected;
}
function sameReferences(left, right) {
	return left.length === right.length && left.every((value, index) => value === right[index]);
}
function interruption(context) {
	const location = context.start?.location;
	if (location?.kind === "step" && location.step.status === "closed") return location.step.end;
	if ((location?.kind === "step" || location?.kind === "turn") && location.turn.status === "closed") return location.turn.end;
}
function fallbackState$2(context) {
	const match = context.matches.find((candidate) => candidate.event.type === "tool/result");
	const root = match === void 0 ? void 0 : rootResult(match);
	if (root === void 0) return void 0;
	let state = {
		root,
		children: /* @__PURE__ */ new Map(),
		parents: /* @__PURE__ */ new Map()
	};
	for (const candidate of context.matches) state = updateDispatch(state, candidate);
	return state;
}
/** Root Tool preparation, dispatch, result, and nested PTC calls. */
const toolDefinition = {
	kind: "tool-call",
	target: "chat",
	match: (event) => {
		if (event.type === "assistant/live-chunk") {
			const chunk = event.data.chunk;
			if (chunk.type === "block-end" && chunk.block.type === "tool-call") return {
				id: String(chunk.block.id),
				role: "start"
			};
			return chunk.type === "tool-call-delta" ? {
				id: String(chunk.id),
				role: "start"
			} : null;
		}
		if (event.type === "tool/call") return {
			id: String(event.data.callId),
			role: "start"
		};
		if (event.type === "tool/result" && isAppendSurfaceEvent(event)) return {
			id: String(event.data.message.source.callId),
			role: "update"
		};
		if (event.type === "tool/ptc-dispatch-start" || event.type === "tool/ptc-dispatch") {
			const rootCallId = event.data.rootCallId;
			return typeof rootCallId === "string" && rootCallId !== "" ? {
				id: rootCallId,
				role: "update"
			} : null;
		}
		return null;
	},
	start: (_context, match) => {
		const state = {
			root: void 0,
			children: /* @__PURE__ */ new Map(),
			parents: /* @__PURE__ */ new Map()
		};
		return match.event.type === "tool/call" ? {
			...state,
			root: rootCall(match)
		} : applyDelta(state, match);
	},
	update: (context, match) => {
		if (match.event.type === "assistant/live-chunk") return applyDelta(context.state, match);
		if (match.event.type === "tool/call") return {
			...context.state,
			root: rootCall(match, context.state.root)
		};
		if (match.event.type === "tool/result") {
			const root = context.state.root;
			const result = rootResult(match, root !== void 0 && !("kind" in root) && root.phase === "start" ? root : void 0);
			return result === void 0 ? context.state : {
				...context.state,
				root: result
			};
		}
		return updateDispatch(context.state, match);
	},
	publication: (match) => match.event.type === "assistant/live-chunk" ? "animation-frame" : "immediate",
	buildViewNode: (context) => {
		const current = context.current.get("chat");
		const state = context.state ?? fallbackState$2(context);
		if (state?.root === void 0) return current == null ? null : current.visibility === "hidden" ? current : {
			...current,
			visibility: "hidden"
		};
		const interruptedAt = interruption(context);
		const projected = projectBlock(!("kind" in state.root) && state.root.phase === "preparing" ? preparingBlock(state.root, current?.data.root) : state.root, state, interruptedAt);
		const anchor = context.start?.event.seq ?? ("kind" in state.root ? state.root.seq : context.matches[0]?.event.seq ?? 0);
		const visibility = !("kind" in projected) && projected.phase === "preparing" && interruptedAt !== void 0 ? "hidden" : "visible";
		const location = contextLocation(context);
		const data = current?.data.root === projected ? current.data : { root: projected };
		if (current?.data === data && current.anchorSeq === anchor && current.visibility === visibility && current.location === location) return current;
		return chatNode(context, "tool-call", anchor, data, {
			visibility,
			location
		});
	}
};
/**
* Register the root Tool lifecycle and nested-subcall contribution.
* @param ctx - owning UI Conversation context.
*/
function registerToolConversationNode(ctx) {
	const match = toolDefinition.match.bind(toolDefinition);
	ctx.uiConversation.events.register({
		...toolDefinition,
		match: {
			"assistant/live-chunk": match,
			"tool/call": match,
			"tool/result": match,
			"tool/ptc-dispatch-start": match,
			"tool/ptc-dispatch": match
		}
	});
}
