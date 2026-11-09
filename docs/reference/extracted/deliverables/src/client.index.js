// Extracted from @deepseek-ai/dsh-client-ui-deliverables (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Required services for the tail-slot and tab-type registrations and their dictionaries. */
const inject = [
	"slots",
	"locale",
	"uiConversation",
	"remote",
	"remote.session",
	"sidebarRightTabs",
	"sidebarRight",
	"configForms"
];
/**
* Client plugin body: register the dictionaries, the turn-tail entry, and the comparison tab type.
* @param ctx - client root context.
*/
function apply(ctx) {
	const opener = new PresentedOpenController();
	const summaries = new ChangesSummaryStore();
	const diffs = new ChangesDiffStore();
	ctx.effect(() => () => Promise.all([
		opener.dispose(),
		summaries.dispose(),
		diffs.dispose()
	]));
	ctx.on("connection/reset", () => {
		opener.resetHost();
		summaries.reset();
		diffs.reset();
	});
	ctx.uiConversation.events.register(deliverablesDefinition);
	ctx.effect(() => ctx.locale.register(NS, {
		zh,
		en,
		ja,
		es,
		fr,
		de,
		ru,
		pt
	}), "ui-deliverables: dictionaries");
	ctx.slots.inject("conversation.chat.turnTail", () => ctx.slots.register({
		name: "conversation.chat.turnTail",
		id: "@deepseek-ai/dsh-client-ui-deliverables",
		locale: NS,
		children: { "deliverables.file.actions": {
			kind: "list",
			scope: "session"
		} },
		inject: () => ({
			hooks: {
				changesDiff: diffs.state,
				presentedOpen: opener.state,
				presentedHost: opener.host,
				changesSummary: summaries.state,
				showCodeDiff: ctx.configForms.developerTools.enabled
			},
			loadChangesDiff: (sessionId, seq, index) => diffs.load(sessionId, seq, index),
			reloadPresentedHost: () => opener.loadHost(),
			loadChangesSummary: (sessionId, seq) => summaries.load(sessionId, seq),
			openPresented: (sessionId, seq, index, action, application) => opener.open(sessionId, seq, index, action, application),
			openChanged: (sessionId, seq, index, action, application) => opener.openChanged(sessionId, seq, index, action, application),
			openChangesReview: (coordinates, index) => {
				ctx.sidebarRight.openResource(changesReviewAddress(coordinates), { params: { index } });
			}
		})
	}, DeliverablesTail));
	ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
		name: "tool.call.toolview",
		key: "present",
		locale: NS
	}, PresentRow));
	const t = ctx.locale.bind(NS);
	ctx.effect(() => ctx.sidebarRightTabs.register(changesReviewDefinition(t)), "ui-deliverables: changes-review type");
	ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
		name: "sidebar.right.pane.tab",
		key: CHANGES_REVIEW_ID,
		locale: NS,
		store: createReviewStore(),
		children: { "deliverables.review.file.actions": {
			kind: "list",
			scope: "session"
		} },
		inject: () => ({
			hooks: {
				changesSummary: summaries.state,
				changesDiff: diffs.state,
				presentedOpen: opener.state,
				presentedHost: opener.host
			},
			loadChangesSummary: (sessionId, seq) => summaries.load(sessionId, seq),
			loadChangesDiff: (sessionId, seq, index) => diffs.load(sessionId, seq, index),
			reloadPresentedHost: () => opener.loadHost(),
			openChanged: (sessionId, seq, index, action, application) => opener.openChanged(sessionId, seq, index, action, application)
		})
	}, ReviewTab)), "ui-deliverables: changes-review body");
	ctx.provide("chatFileMentions", { forClosing(owner, _sessionId, getFileTriggerProps) {
		const paths = selectProducedFiles(owner);
		const presented = presentedForClosing(owner);
		if (paths === null && presented.length === 0) return void 0;
		return producedFileMentions([...new Set([...paths ?? [], ...presented.map((file) => file.path)])], owner.openFile, (path) => t("presented.previewButton", { name: path }), owner.turn.data.get("deliverables")?.produced, getFileTriggerProps);
	} });
}
