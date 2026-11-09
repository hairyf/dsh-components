// Extracted from @deepseek-ai/dsh-client-ui-jobs (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Required services: the jobs rosters, observations, and kill, the slot registry, and dictionaries. */
const inject = [
	"jobs",
	"slots",
	"locale"
];
/**
* Client plugin body: register the dictionaries and the header action.
* @param ctx - client root context.
*/
function apply(ctx) {
	ctx.effect(() => ctx.locale.register("job", {
		zh,
		en,
		ja,
		es,
		fr,
		de,
		ru,
		pt
	}), "ui-jobs: dictionaries");
	ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
		name: "conversation.session.header.actions",
		id: "job-list",
		order: 20,
		locale: "job",
		inject: () => ({
			hooks: { jobs: ctx.jobs.state },
			watchRows: (sessionId) => ctx.jobs.watchRows(sessionId),
			observe: (sessionId, id) => ctx.jobs.observe(sessionId, id),
			killJob: async (sessionId, jobId) => (await ctx.jobs.kill(sessionId, jobId)).ok
		})
	}, JobListAction));
}
