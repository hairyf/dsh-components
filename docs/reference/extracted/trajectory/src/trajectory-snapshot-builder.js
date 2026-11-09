// Extracted from @deepseek-ai/dsh-client-ui-trajectory (lib/client.js); region lib/types/client/trajectory-snapshot-builder.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		const EMPTY_LIST = [];
		/** Stable empty target used until a Session has assembled Trajectory records. */
		const EMPTY_TRAJECTORY_SNAPSHOT = {
			eventNodes: EMPTY_LIST,
			eventLocations: /* @__PURE__ */ new Map(),
			requests: EMPTY_LIST,
			callSchemas: /* @__PURE__ */ new Map(),
			partial: null,
			runningCalls: EMPTY_LIST
		};
		function stepKey(turn, step) {
			return `${turn}\u0000${step}`;
		}
		function headerStepKey(header) {
			const location = header.location;
			return location.kind === "step" ? stepKey(location.turn.turn, location.step.step) : void 0;
		}
		function headerFor(request, headersByStep, previous) {
			return headersByStep.get(stepKey(request.turn, request.step)) ?? (previous !== void 0 && previous.seq < request.startSeq ? {
				latest: previous,
				...previous.change === void 0 ? {} : { change: previous.change }
			} : void 0);
		}
		function applyHeader(request, header, includeChange) {
			return header === void 0 ? request : {
				...request,
				prompt: header.latest.prompt,
				requestConfig: header.latest.prompt.config,
				...includeChange && header.change !== void 0 ? { promptChange: header.change } : {}
			};
		}
		function withRequestConfig(node, prompt) {
			return prompt === void 0 ? node : {
				...node,
				requestConfig: prompt.config
			};
		}
		function captureSchemas(block, toolsByName, output) {
			const name = "kind" in block ? block.call?.name : block.name;
			const schema = name === void 0 ? void 0 : toolsByName.get(name);
			if (schema !== void 0) output.set(block.callId, schema);
			for (const child of block.subCalls) captureSchemas(child, toolsByName, output);
		}
		function indexTools(tools) {
			return new Map(tools.map((tool) => [tool.name, tool]));
		}
		function interruptCompactions(requests, boundaries) {
			let nextRequest = 0;
			const runningCompactions = [];
			for (const boundary of boundaries) {
				while (nextRequest < requests.length) {
					const request = requests[nextRequest];
					if (request === void 0 || request.startSeq >= boundary.seq) break;
					if (request.purpose === "compaction" && request.status === "running") runningCompactions.push(nextRequest);
					nextRequest++;
				}
				let index = runningCompactions.pop();
				while (index !== void 0 && requests[index]?.status !== "running") index = runningCompactions.pop();
				if (index === void 0) continue;
				const request = requests[index];
				if (request?.purpose !== "compaction") continue;
				requests[index] = {
					...request,
					completedAt: boundary.time,
					status: "error",
					error: COMPACTION_INTERRUPTED_ERROR
				};
			}
		}
		function applyTurnErrors(requests, endings) {
			const lastAssistantByTurn = /* @__PURE__ */ new Map();
			for (const [index, request] of requests.entries()) if (request.purpose === "assistant") lastAssistantByTurn.set(request.turn, index);
			for (const ending of endings) {
				if (ending.error === void 0) continue;
				const index = lastAssistantByTurn.get(ending.turn);
				if (index === void 0) continue;
				const request = requests[index];
				if (request?.purpose !== "assistant") continue;
				requests[index] = {
					...request,
					completedAt: request.completedAt ?? ending.time,
					status: "error",
					error: ending.error,
					...ending.errorCode === void 0 ? {} : { errorCode: ending.errorCode }
				};
			}
		}
		/** Simple keyed adapter retaining the old Trajectory snapshot and stage layout. */
		var TrajectorySnapshotBuilder = class {
			nodes = /* @__PURE__ */ new Map();
			positions = /* @__PURE__ */ new Map();
			contributions = [];
			empty = EMPTY_TRAJECTORY_SNAPSHOT;
			replace(input) {
				this.nodes.clear();
				for (const node of input.nodes) this.nodes.set(node.key, node);
				this.rebuildContributions();
				return this.snapshot();
			}
			apply(input) {
				let structural = false;
				for (const node of input.upserts) {
					const previous = this.nodes.get(node.key);
					this.nodes.set(node.key, node);
					if (previous === void 0 || previous.anchorSeq !== node.anchorSeq) {
						structural = true;
						continue;
					}
					const position = this.positions.get(node.key);
					if (position === void 0) structural = true;
					else this.contributions[position] = node;
				}
				if (structural) this.rebuildContributions();
				return this.snapshot();
			}
			snapshot() {
				const headersByStep = /* @__PURE__ */ new Map();
				for (const contribution of this.contributions) {
					if (contribution.data.kind !== "request-header") continue;
					const key = headerStepKey(contribution.data.header);
					if (key === void 0) continue;
					const previous = headersByStep.get(key);
					headersByStep.set(key, {
						latest: contribution.data.header,
						...contribution.data.header.change !== void 0 ? { change: contribution.data.header.change } : previous?.change === void 0 ? {} : { change: previous.change }
					});
				}
				const representedPrompts = new Set(this.contributions.flatMap((node) => node.data.kind === "request-header" && node.data.header.change !== void 0 ? [node.data.header.change.seq] : []));
				const systemPrompts = [];
				const finalized = [];
				const eventLocations = /* @__PURE__ */ new Map();
				const requests = [];
				const boundaries = [];
				const turnEndings = [];
				const callSchemas = /* @__PURE__ */ new Map();
				const consumedPromptChanges = /* @__PURE__ */ new Set();
				let previousHeader;
				let previousTools = /* @__PURE__ */ new Map();
				let partial = null;
				const runningCalls = [];
				for (const contribution of this.contributions) {
					const data = contribution.data;
					if (data.kind === "system-prompt") {
						if (!representedPrompts.has(data.prompt.seq)) systemPrompts.push(data.prompt);
						continue;
					}
					if (data.kind === "request-header") {
						previousHeader = data.header;
						previousTools = indexTools(data.header.prompt.tools);
						continue;
					}
					if (data.kind === "node") {
						finalized.push(data.node);
						eventLocations.set(data.node.seq, contribution.location);
						continue;
					}
					if (data.kind === "assistant") {
						const header = data.request === void 0 ? void 0 : headerFor(data.request, headersByStep, previousHeader);
						if (data.node !== void 0) finalized.push(withRequestConfig(data.node, header?.latest.prompt));
						if (data.partial !== null) partial = data.partial;
						if (data.request !== void 0) {
							const change = header?.change;
							const includeChange = change !== void 0 && !consumedPromptChanges.has(change.seq);
							requests.push(applyHeader(data.request, header, includeChange));
							if (includeChange) consumedPromptChanges.add(change.seq);
						}
						continue;
					}
					if (data.kind === "tool") {
						if ("kind" in data.root) finalized.push(data.root);
						else runningCalls.push(data.root);
						if (previousHeader !== void 0 && previousHeader.seq < contribution.anchorSeq) captureSchemas(data.root, previousTools, callSchemas);
						continue;
					}
					if (data.kind === "compaction") {
						requests.push(data.request);
						continue;
					}
					if (data.kind === "session-end") {
						boundaries.push({
							seq: data.seq,
							time: data.time
						});
						continue;
					}
					turnEndings.push({
						turn: data.turn,
						time: data.time,
						...data.error === void 0 ? {} : { error: data.error },
						...data.errorCode === void 0 ? {} : { errorCode: data.errorCode }
					});
				}
				requests.sort((left, right) => left.startSeq - right.startSeq);
				interruptCompactions(requests, boundaries);
				applyTurnErrors(requests, turnEndings);
				finalized.sort((left, right) => left.seq - right.seq);
				return {
					eventNodes: finalized,
					...systemPrompts.length > 0 ? { systemPrompts } : {},
					eventLocations,
					requests,
					callSchemas,
					partial,
					runningCalls
				};
			}
			rebuildContributions() {
				this.contributions = [...this.nodes.values()].sort((left, right) => left.anchorSeq - right.anchorSeq || left.key.localeCompare(right.key));
				this.positions.clear();
				for (const [index, contribution] of this.contributions.entries()) this.positions.set(contribution.key, index);
			}
		};
		/** Trajectory target factory preserving the existing stage-oriented view model. */
		const trajectoryViewDefinition = {
			target: "trajectory",
			toolCallFocus: (callId) => callId,
			create: () => new TrajectorySnapshotBuilder()
		};
		/**
		* Register the stage-oriented Trajectory target builder.
		*
		* @param ctx - Plugin context receiving the view Definition.
		*/
		function registerTrajectoryConversationView(ctx) {
			ctx.uiConversation.views.register(trajectoryViewDefinition);
		}
