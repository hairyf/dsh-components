// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/conversation-nodes/turn-error.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		function lastStep$1(context) {
			const location = context.start?.location ?? context.matches[0]?.location;
			if (location?.kind !== "turn" && location?.kind !== "step") return 0;
			return location.turn.steps.at(-1)?.step ?? 0;
		}
		/**
		* Failure shown for a turn ending: a recorded error, a sign-out cancellation,
		* or a turn that restart recovery closed because the DSH process exited mid-turn.
		*/
		function endFailure(reason) {
			switch (reason.kind) {
				case "error": return reason.error;
				case "aborted": return reason.reason.kind === "hook" && reason.reason.reason === "deepseek-account/signed-out" ? {
					message: "Stopped because you signed out of DeepSeek.",
					code: "ACCOUNT_SIGNED_OUT"
				} : void 0;
				case "interrupted": return {
					message: "The DSH process exited before this turn finished.",
					code: "INTERRUPTED"
				};
				default: return;
			}
		}
		function failureFrom(match) {
			if (match.event.type !== "turn/end") return void 0;
			const failure = endFailure(match.event.data.reason);
			if (failure === void 0) return void 0;
			const display = displayFailure(failure);
			return {
				seq: match.event.seq,
				time: match.event.time,
				message: display.message,
				...display.code === void 0 ? {} : { code: display.code }
			};
		}
		function fallbackState$1(context) {
			const end = context.matches.find((match) => failureFrom(match) !== void 0);
			if (end?.event.type !== "turn/end") return void 0;
			const failure = failureFrom(end);
			if (failure === void 0) return void 0;
			return {
				turn: end.event.data.turn,
				failure
			};
		}
		/**
		* Terminal turn failure Definition. Retries run inside the failing turn, so the
		* turn's `llm/retry` history never suppresses this terminal row; the model-retry
		* node renders that history separately.
		*/
		const turnErrorDefinition = {
			kind: "turn-error",
			target: "chat",
			match: (event) => {
				if (event.type === "turn/start") return {
					id: String(event.data.turn),
					role: "start"
				};
				if (event.type === "turn/end" && endFailure(event.data.reason) !== void 0) return {
					id: String(event.data.turn),
					role: "update"
				};
				return null;
			},
			start: (_context, match) => {
				if (match.event.type !== "turn/start") throw new Error("turn-error start requires turn/start");
				return { turn: match.event.data.turn };
			},
			update: (context, match) => {
				const failure = failureFrom(match);
				return failure === void 0 ? context.state : {
					...context.state,
					failure
				};
			},
			buildViewNode: (context) => {
				const state = context.state ?? fallbackState$1(context);
				if (state?.failure === void 0) return null;
				const failure = state.failure;
				const node = {
					kind: "turn-error",
					seq: failure.seq,
					time: failure.time,
					turn: state.turn,
					step: lastStep$1(context),
					message: failure.message,
					...failure.code === void 0 ? {} : { code: failure.code }
				};
				return chatNode(context, "turn-error", node.seq, node, { groupTree: "turn" });
			}
		};
		/**
		* Register the terminal Turn-error business contribution.
		* @param ctx - owning UI Conversation context.
		*/
		function registerTurnErrorConversationNode(ctx) {
			ctx.uiConversation.events.register(turnErrorDefinition);
		}
