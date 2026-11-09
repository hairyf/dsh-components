// Extracted from @deepseek-ai/dsh-client-ui-plan (lib/client.js); region lib/types/client/plan-definition.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** One card per invocation; a later PTC settlement retains the original card position. */
const planDefinition = {
	kind: "submitted-plan",
	target: "chat",
	match: (event) => {
		const plan = submittedPlan(event);
		return plan === void 0 ? null : {
			id: plan.callId,
			role: event.type === "tool/ptc-dispatch" ? "update" : "start"
		};
	},
	start: (_context, match) => submittedPlan(match.event),
	update: (context) => context.state,
	buildViewNode: (context) => {
		const start = context.start ?? context.matches[0];
		const data = context.state ?? (start === void 0 ? void 0 : submittedPlan(start.event));
		if (data === void 0 || start === void 0) return null;
		return {
			key: context.key,
			kind: "submitted-plan",
			id: context.id,
			target: "chat",
			anchorSeq: start.event.seq,
			location: start.location,
			visibility: "hidden",
			data
		};
	}
};
