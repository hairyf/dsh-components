// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/input/submission-analytics.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Map a preset id to its fixed analytics category; custom ids never leave the Client.
		* @param id - Agent preset id the Session records.
		* @returns the built-in category, or other.
		*/
		function analyticsPreset(id) {
			switch (id) {
				case "cordis": return "creator";
				case "ptc": return "ptc";
				case "minimal": return "minimal";
				case "standard": return "standard";
				default: return "other";
			}
		}
		/**
		* Report the original message occurrence without reading newer Session facts.
		* @param ctx - client context.
		* @param submission - original occurrence and Session snapshot.
		*/
		function reportMessageSubmission(ctx, submission) {
			const { state, timestamp, mode } = submission;
			if (state === void 0) return;
			const model = state.model;
			ctx.get("productAnalytics")?.track("send_button_click", {
				...state.sessionId === void 0 ? {} : { session_id: state.sessionId },
				...model === void 0 ? {} : {
					model_name: `${model.provider}/${model.name}`,
					...model.effort === void 0 ? {} : { thinking_effort: model.effort }
				},
				run_mode: state.runMode,
				msg_type: state.running ? mode : "default",
				is_new_session: state.newSession,
				...state.agentPreset === void 0 ? {} : { agent_preset: analyticsPreset(state.agentPreset) }
			}, timestamp);
		}
