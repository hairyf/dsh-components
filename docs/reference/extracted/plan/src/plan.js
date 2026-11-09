// Extracted from @deepseek-ai/dsh-client-ui-plan (lib/client.js); region lib/types/client/plan.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		function record(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		/**
		* Read a complete plan from untrusted logged arguments.
		* @param event - Native call or PTC dispatch event from Session history.
		* @returns the submitted plan, or undefined for unrelated or malformed data.
		*/
		function submittedPlan(event) {
			if (event.type !== "tool/call" && event.type !== "tool/ptc-dispatch-start" && event.type !== "tool/ptc-dispatch") return void 0;
			const data = event.data;
			if (!record(data) || data.name !== "exit_plan_mode") return void 0;
			const callId = event.type === "tool/call" ? data.callId : data.subCallId;
			if (typeof callId !== "string" || callId === "") return void 0;
			let args = data.arguments;
			if (event.type === "tool/call") {
				if (typeof args !== "string") return void 0;
				try {
					args = JSON.parse(args);
				} catch (_error) {
					return;
				}
			}
			if (!record(args) || typeof args.plan !== "string") return void 0;
			const markdown = args.plan;
			const title = /^#\s+(\S[^\r\n]*)/.exec(markdown.trim())?.[1];
			return title === void 0 ? void 0 : {
				callId,
				markdown,
				title
			};
		}
		/**
		* Encode the durable identity of a plan without retaining its text in layout storage.
		* @param target - Session and tool-call identity.
		* @returns the plan resource address.
		*/
		function planAddress(target) {
			const { session, callId } = target;
			return `dsh-resource://plan/${(session.kind === "session" ? [session.sessionId, callId] : [
				"subagent",
				session.parentSessionId,
				session.childSessionId,
				session.mode,
				callId
			]).map(encodeURIComponent).join("/")}`;
		}
		/**
		* Validate a saved or caller-supplied plan resource address.
		* @param address - Address submitted to the sidebar or resource provider.
		* @returns the decoded identity, or undefined for an unsupported address.
		*/
		function parsePlanAddress(address) {
			const match = /^dsh-resource:\/\/plan\/([^?#]+)$/.exec(address);
			if (match === null) return void 0;
			try {
				const parts = match[1].split("/").map(decodeURIComponent);
				if (parts.some((part) => part === "")) return void 0;
				if (parts.length === 2) return {
					session: {
						kind: "session",
						sessionId: parts[0]
					},
					callId: parts[1]
				};
				if (parts.length === 5 && parts[0] === "subagent" && (parts[3] === "one-shot" || parts[3] === "continuable" || parts[3] === "unknown")) return {
					session: {
						kind: "subagent",
						parentSessionId: parts[1],
						childSessionId: parts[2],
						mode: parts[3]
					},
					callId: parts[4]
				};
				return;
			} catch (_error) {
				return;
			}
		}
