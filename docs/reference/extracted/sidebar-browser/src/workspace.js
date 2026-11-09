// Extracted from @deepseek-ai/dsh-client-ui-sidebar-browser (lib/client.js); region lib/types/client/electron/workspace.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Use the Workspace's canonical CWD, not its record id; ungrouped Sessions remain isolated.
		* @param source - authoritative Workspace membership.
		* @param sessionId - owning DSH Session.
		* @param signal - guest initialization lifetime.
		* @returns the storage account for this occurrence.
		*/
		async function browserWorkspace(source, sessionId, signal) {
			signal.throwIfAborted();
			if (source.getSnapshot().phase !== "ready") await new Promise((resolve, reject) => {
				const abort = () => {
					stop();
					const reason = signal.reason;
					reject(reason);
				};
				const stop = source.subscribe(() => {
					if (source.getSnapshot().phase !== "ready") return;
					stop();
					signal.removeEventListener("abort", abort);
					resolve();
				});
				signal.addEventListener("abort", abort, { once: true });
			});
			signal.throwIfAborted();
			const workspace = source.getSnapshot().items.find((item) => item.sessionIds.some((id) => id === sessionId));
			return workspace === void 0 ? `session:${sessionId}` : `cwd:${workspace.path}`;
		}
