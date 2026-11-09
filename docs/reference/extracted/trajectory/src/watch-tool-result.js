// Extracted from @deepseek-ai/dsh-client-ui-trajectory (lib/client.js); region lib/types/client/watch-tool-result.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Bind an ephemeral inspector stream to one Session.
* @param remote - Generated Remote transport and reconnecting stream owner.
* @param sessionId - Session inspected by this view.
* @param report - Diagnostic sink for unavailable transport and teardown failures.
* @returns Subscription factory; closing a subscription releases its selected value.
*/
function createToolResultWatcher(remote, sessionId, report) {
	return (seq, publish) => {
		const lifetime = { stopped: false };
		const clear = () => {
			if (!lifetime.stopped) publish(void 0);
		};
		const stream = remote.$stream({
			name: "live tool result",
			open: (signal) => remote.toolResults.watch({
				sessionId,
				seq
			}, signal),
			ended: () => /* @__PURE__ */ new Error("live tool result stream ended"),
			carrierFailed: clear
		});
		(async () => {
			try {
				for await (const frame of stream) {
					if (lifetime.stopped) return;
					frame.accept();
					publish(frame.value.available ? frame.value.value : void 0);
				}
			} catch (error) {
				if (!lifetime.stopped) {
					clear();
					report(error);
				}
			} finally {
				clear();
			}
		})();
		return () => {
			lifetime.stopped = true;
			stream.dispose().catch(report);
		};
	};
}
