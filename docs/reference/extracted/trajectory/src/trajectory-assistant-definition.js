// Extracted from @deepseek-ai/dsh-client-ui-trajectory (lib/client.js); region lib/types/client/trajectory-assistant-definition.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		function initialState(turn, step, startSeq, startTime, started) {
			return {
				turn,
				step,
				startSeq,
				startTime,
				started,
				blocks: [],
				visibleBlocks: 0,
				firstVisibleSeq: void 0,
				firstVisibleTime: void 0,
				firstTokenTime: void 0,
				final: void 0,
				usage: void 0,
				retry: void 0,
				stepEnd: void 0
			};
		}
		function compactBlocks(blocks) {
			return blocks.filter((block) => block !== void 0);
		}
		function blockIsVisible(block) {
			if (block === void 0 || block.kind === "tool-call") return false;
			if (block.kind === "text" || block.kind === "reasoning") return block.text.trim() !== "";
			return true;
		}
		function countVisibleBlocks(blocks) {
			let count = 0;
			for (const block of blocks) if (blockIsVisible(block)) count++;
			return count;
		}
		function hasInterruptionEvidence(blocks) {
			return blocks.some((block) => {
				if (block.kind === "text" || block.kind === "reasoning") return block.text.trim() !== "";
				return true;
			});
		}
		function addUsage$1(current, next) {
			return {
				inputTokens: (current?.inputTokens ?? 0) + next.inputTokens,
				outputTokens: (current?.outputTokens ?? 0) + next.outputTokens,
				...current?.cacheReadTokens === void 0 && next.cacheReadTokens === void 0 ? {} : { cacheReadTokens: (current?.cacheReadTokens ?? 0) + (next.cacheReadTokens ?? 0) },
				...current?.cacheWriteTokens === void 0 && next.cacheWriteTokens === void 0 ? {} : { cacheWriteTokens: (current?.cacheWriteTokens ?? 0) + (next.cacheWriteTokens ?? 0) },
				...current?.reasoningTokens === void 0 && next.reasoningTokens === void 0 ? {} : { reasoningTokens: (current?.reasoningTokens ?? 0) + (next.reasoningTokens ?? 0) }
			};
		}
		function updateChunk(state, chunk, seq, time) {
			if (chunk.type === "usage") return {
				...state,
				usage: addUsage$1(state.usage, chunk.usage)
			};
			const blocks = [...state.blocks];
			let changedIndex = -1;
			let previousVisible = false;
			switch (chunk.type) {
				case "block-start":
					changedIndex = chunk.index;
					previousVisible = blockIsVisible(blocks[chunk.index]);
					blocks[chunk.index] = emptyAssistantBlock(chunk.blockType);
					break;
				case "text-delta": {
					const previous = blocks[chunk.index];
					changedIndex = chunk.index;
					previousVisible = blockIsVisible(previous);
					blocks[chunk.index] = {
						kind: "text",
						text: (previous?.kind === "text" ? previous.text : "") + chunk.text
					};
					break;
				}
				case "reasoning-delta": {
					const previous = blocks[chunk.index];
					changedIndex = chunk.index;
					previousVisible = blockIsVisible(previous);
					blocks[chunk.index] = {
						kind: "reasoning",
						text: (previous?.kind === "reasoning" ? previous.text : "") + chunk.text
					};
					break;
				}
				case "tool-call-delta": {
					const previous = blocks[chunk.index];
					changedIndex = chunk.index;
					previousVisible = blockIsVisible(previous);
					const base = previous?.kind === "tool-call" ? previous : {
						kind: "tool-call",
						callId: "",
						name: "",
						argsRaw: ""
					};
					blocks[chunk.index] = {
						kind: "tool-call",
						callId: base.callId || String(chunk.id),
						name: chunk.name ?? base.name,
						argsRaw: base.argsRaw + chunk.argumentsDelta
					};
					break;
				}
				case "block-end":
					changedIndex = chunk.index;
					previousVisible = blockIsVisible(blocks[chunk.index]);
					blocks[chunk.index] = toAssistantBlock(chunk.block);
					break;
				default: return state;
			}
			const visibleBlocks = state.visibleBlocks - Number(previousVisible) + Number(blockIsVisible(blocks[changedIndex]));
			return {
				...state,
				blocks,
				visibleBlocks,
				...visibleBlocks > 0 && state.firstVisibleSeq === void 0 ? {
					firstVisibleSeq: seq,
					firstVisibleTime: time
				} : {},
				...isTokenDelta(chunk) && state.firstTokenTime === void 0 ? { firstTokenTime: time } : {}
			};
		}
		/** The Step retains its first token across live chunks and settled retry attempts. */
		function settleTiming(state, event) {
			return {
				...state,
				firstTokenTime: state.firstTokenTime ?? assistantStreamFirstTokenTime(event.data.stream)
			};
		}
		function settleMessage(state, match, event) {
			const blocks = toAssistantBlocks(event.data.message.content);
			return {
				...settleTiming(state, event),
				blocks,
				visibleBlocks: countVisibleBlocks(blocks),
				final: match,
				usage: event.data.usage
			};
		}
		function closedBoundary(context) {
			if (context.state?.stepEnd?.event.type === "step/end") return context.state.stepEnd.event;
			const location = context.start?.location ?? context.matches.at(-1)?.location;
			if (location?.kind === "step" && location.step.status === "closed") return location.step.end;
			if ((location?.kind === "step" || location?.kind === "turn") && location.turn.status === "closed") return location.turn.end;
		}
		function fallbackState$1(context) {
			let state;
			for (const match of context.matches) {
				const event = match.event;
				if (event.type === "assistant/live-chunk") {
					state ??= initialState(event.data.turn, event.data.step, event.seq, event.time, false);
					state = updateChunk(state, event.data.chunk, event.seq, event.time);
				} else if (event.type === "assistant/attempt") {
					state ??= initialState(event.data.turn, event.data.step, event.seq, event.time, false);
					state = settleTiming(state, event);
				} else if (event.type === "assistant/message") {
					state ??= initialState(event.data.turn, event.data.step, event.seq, event.time, false);
					state = settleMessage(state, match, event);
				} else if (event.type === "step/end" && state !== void 0) state = {
					...state,
					stepEnd: match
				};
			}
			return state;
		}
		function finalNode(state, context) {
			const final = state.final;
			if (final?.event.type === "assistant/message") {
				const event = final.event;
				return {
					kind: "assistant",
					seq: event.seq,
					messageId: event.data.message.id,
					time: event.time,
					turn: state.turn,
					step: state.step,
					blocks: toAssistantBlocks(event.data.message.content),
					usage: event.data.usage,
					providerMetadata: {
						provider: event.data.message.source.provider,
						model: event.data.message.source.model
					},
					timing: {
						stepStartTime: state.started ? state.startTime : null,
						firstTokenTime: state.firstTokenTime ?? null,
						completedTime: event.time
					},
					...event.data.interrupted === true ? { interrupted: true } : {}
				};
			}
			const boundary = closedBoundary(context);
			if (boundary === void 0) return void 0;
			const blocks = compactBlocks(state.blocks);
			if (!hasInterruptionEvidence(blocks)) return void 0;
			return {
				kind: "assistant",
				seq: boundary.seq - .9,
				time: boundary.time,
				turn: state.turn,
				step: state.step,
				blocks,
				interrupted: true
			};
		}
		function assistantRequest(state, node, boundary) {
			if (!state.started) return void 0;
			const status = node !== void 0 ? node.interrupted === true ? "error" : "complete" : boundary !== void 0 ? "error" : "running";
			return {
				purpose: "assistant",
				startSeq: state.startSeq,
				turn: state.turn,
				step: state.step,
				startedAt: state.startTime,
				completedAt: node?.time ?? boundary?.time ?? null,
				status,
				...state.retry === void 0 ? {} : {
					error: state.retry.message,
					...state.retry.code === void 0 ? {} : { errorCode: state.retry.code },
					retry: state.retry.retry,
					...state.retry.maxRetries === void 0 ? {} : { maxRetries: state.retry.maxRetries },
					retryDelayMs: state.retry.delayMs
				},
				...node?.messageId === void 0 ? {} : {
					resultSeq: node.seq,
					...node.providerMetadata === void 0 ? {} : { providerMetadata: node.providerMetadata }
				},
				...state.usage === void 0 ? {} : { usage: state.usage }
			};
		}
		/** Trajectory-owned Assistant streaming, settlement, and request lifecycle. */
		const trajectoryAssistantDefinition = {
			kind: "trajectory-assistant-step",
			target: "trajectory",
			match: (event) => {
				if (event.type === "step/start") return {
					id: `${event.data.turn}:${event.data.step}`,
					role: "start"
				};
				if (event.type === "assistant/live-chunk" || event.type === "assistant/message" || event.type === "assistant/attempt" || event.type === "llm/retry" || event.type === "step/end") return {
					id: `${event.data.turn}:${event.data.step}`,
					role: "update"
				};
				return null;
			},
			start: (_context, match) => {
				if (match.event.type !== "step/start") throw new Error("trajectory-assistant-step start requires step/start");
				return initialState(match.event.data.turn, match.event.data.step, match.event.seq, match.event.time, true);
			},
			update: (context, match) => {
				if (match.event.type === "assistant/live-chunk") return updateChunk(context.state, match.event.data.chunk, match.event.seq, match.event.time);
				if (match.event.type === "assistant/message") return settleMessage(context.state, match, match.event);
				if (match.event.type === "assistant/attempt") return settleTiming(context.state, match.event);
				if (match.event.type === "step/end") return {
					...context.state,
					stepEnd: match
				};
				if (match.event.type !== "llm/retry") return context.state;
				const data = match.event.data;
				const failure = displayFailure(data.failure);
				return {
					...initialState(context.state.turn, context.state.step, context.state.startSeq, context.state.startTime, true),
					firstTokenTime: context.state.firstTokenTime,
					usage: context.state.usage,
					retry: {
						message: failure.message,
						...failure.code === void 0 ? {} : { code: failure.code },
						retry: data.retry,
						...data.mode === "normal" ? { maxRetries: data.maxRetries } : {},
						delayMs: data.delayMs
					}
				};
			},
			publication: (match) => {
				if (match.event.type === "step/start" || match.event.type === "assistant/attempt") return "none";
				if (match.event.type !== "assistant/live-chunk") return "immediate";
				const type = match.event.data.chunk.type;
				return type === "usage" || type === "finish" ? "none" : "animation-frame";
			},
			buildViewNode: (context) => {
				const state = context.state ?? fallbackState$1(context);
				if (state === void 0) return null;
				const node = finalNode(state, context);
				const boundary = closedBoundary(context);
				const partial = node === void 0 && boundary === void 0 && state.blocks.length > 0 ? {
					turn: state.turn,
					step: state.step,
					blocks: compactBlocks(state.blocks),
					timing: {
						stepStartTime: state.started ? state.startTime : null,
						firstTokenTime: state.firstTokenTime ?? null
					}
				} : null;
				const request = assistantRequest(state, node, boundary);
				if (node === void 0 && partial === null && request === void 0) return null;
				return trajectoryNode(context, state.startSeq, {
					kind: "assistant",
					...node === void 0 ? {} : { node },
					partial,
					...request === void 0 ? {} : { request }
				});
			}
		};
		const trajectoryTurnEndDefinition = {
			kind: "trajectory-turn-end",
			target: "trajectory",
			match: (event) => event.type === "turn/end" ? {
				id: String(event.seq),
				role: "start"
			} : null,
			start: (_context, match) => {
				if (match.event.type !== "turn/end") throw new Error("trajectory-turn-end start requires turn/end");
				const reason = match.event.data.reason;
				const failure = reason.kind === "error" ? displayFailure(reason.error) : void 0;
				return {
					turn: match.event.data.turn,
					seq: match.event.seq,
					time: match.event.time,
					...failure === void 0 ? {} : {
						error: failure.message,
						...failure.code === void 0 ? {} : { errorCode: failure.code }
					}
				};
			},
			update: (context) => context.state,
			buildViewNode: (context) => context.state === void 0 ? null : trajectoryNode(context, context.state.seq, {
				kind: "turn-end",
				turn: context.state.turn,
				time: context.state.time,
				...context.state.error === void 0 ? {} : { error: context.state.error },
				...context.state.errorCode === void 0 ? {} : { errorCode: context.state.errorCode }
			})
		};
		/**
		* Register the Trajectory Assistant lifecycle.
		*
		* @param ctx - Plugin context receiving the Definitions.
		*/
		function registerTrajectoryAssistantDefinition(ctx) {
			ctx.uiConversation.events.register(trajectoryAssistantDefinition);
			ctx.uiConversation.events.register(trajectoryTurnEndDefinition);
		}
