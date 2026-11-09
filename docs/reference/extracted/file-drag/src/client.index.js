// Extracted from @deepseek-ai/dsh-client-ui-file-drag (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Registry and locale used by the independent feedback overlay. */
const inject = ["slots", "locale"];
/** @param ctx - client plugin context carrying slots and locale. */
function apply(ctx) {
	const bridge = globalThis.dshDesktop;
	const desktop = bridge?.protocolVersion === 1 ? bridge.fileDrag : void 0;
	const failure = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(null);
	const t = ctx.locale.bind("fileDrag");
	ctx.effect(() => ctx.locale.register("fileDrag", {
		zh,
		en,
		ja,
		es,
		fr,
		de,
		ru,
		pt
	}));
	let sequence = 0;
	const reportFailure = () => {
		failure.set({
			text: t("failed"),
			sequence: ++sequence
		});
	};
	const transfers = new FileTransfers(desktop, reportFailure);
	const dismiss = () => {
		failure.set(null);
	};
	ctx.provide("fileDrag", {
		actions: {
			prepare: (source, signal) => transfers.prepare(source, signal),
			reportFailure
		},
		read: (transfer) => transfers.read(transfer)
	});
	ctx.effect(() => () => {
		transfers.dispose();
		dismiss();
	});
	ctx.slots.inject("shell.overlay", () => ctx.slots.register({
		name: "shell.overlay",
		id: "file-drag.feedback",
		inject: () => ({
			hooks: { failure },
			dismiss
		})
	}, FileDragFeedback));
}
