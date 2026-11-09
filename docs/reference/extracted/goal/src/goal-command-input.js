// Extracted from @deepseek-ai/dsh-client-ui-goal (lib/client.js); region lib/types/client/goal-command-input.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** The command name whose runs this projection owns. */
		const GOAL_COMMAND = "goal";
		/**
		* Derive the visible command line from its structured durable run.
		* @param event - `/goal` command run.
		* @returns command text with trailing parser whitespace removed.
		*/
		function goalCommandText(event) {
			return `/${event.data.name}${(event.data.args ?? "").trimEnd()}`;
		}
		/** Goal-owned command input projection; the generic command Definition retains the result row. */
		const goalCommandInputDefinition = {
			kind: "goal-command-input",
			target: "chat",
			match: (event) => event.type === "command/run" && event.data.name === "goal" ? {
				id: String(event.data.commandId),
				role: "start"
			} : null,
			start: (_context, match) => {
				if (match.event.type !== "command/run") throw new Error("goal-command-input start requires command/run");
				return {
					commandId: match.event.data.commandId,
					seq: match.event.seq,
					time: match.event.time,
					text: goalCommandText(match.event)
				};
			},
			update: (context) => context.state,
			buildViewNode: (context) => {
				if (context.state === void 0) return null;
				return {
					key: context.key,
					kind: "command-input",
					id: context.id,
					target: "chat",
					anchorSeq: context.state.seq - .1,
					location: context.start?.location ?? { kind: "unresolved" },
					visibility: "visible",
					data: {
						commandId: context.state.commandId,
						text: context.state.text,
						time: context.state.time
					}
				};
			}
		};
