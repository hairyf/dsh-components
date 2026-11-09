// Extracted from @deepseek-ai/dsh-client-ui-schedule (lib/client.js); region lib/types/client/DeleteToast.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Create the one deletion-outcome store the overlay entry shows.
		* @returns the observable notice with its report and dismiss actions.
		*/
		function createDeleteToastSource() {
			let state = null;
			let seq = 0;
			const listeners = /* @__PURE__ */ new Set();
			const publish = (next) => {
				state = next;
				for (const listener of listeners) listener();
			};
			return {
				hooks: { toast: {
					getSnapshot: () => state,
					subscribe(listener) {
						listeners.add(listener);
						return () => {
							listeners.delete(listener);
						};
					}
				} },
				report: (outcome) => {
					if (outcome === "pending") return;
					publish({
						kind: outcome === "deleted" ? "deleted" : "deleteFailed",
						seq: ++seq
					});
				},
				reportClear: (outcome) => {
					publish(outcome.cleared ? {
						kind: "cleared",
						count: outcome.count,
						seq: ++seq
					} : {
						kind: "clearFailed",
						seq: ++seq
					});
				},
				dismiss: () => {
					publish(null);
				}
			};
		}
		/**
		* Render the current deletion notice: a success banner for a confirmed deletion
		* or settled bulk removal, a warning for one that could not be confirmed, or
		* nothing.
		* @param props - the notice hook, its dismissal, and the locale seat.
		* @returns the banner on display, or null.
		*/
		function ScheduleDeleteToast({ useToast, dismiss, t }) {
			const toast = useToast((current) => current);
			if (toast === null) return null;
			const key = `schedule-delete-${String(toast.seq)}`;
			switch (toast.kind) {
				case "deleted": return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
					text: t("toast.deleted"),
					tone: "success",
					onDone: dismiss
				}, key);
				case "deleteFailed": return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
					text: t("toast.deleteFailed"),
					icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
					onDone: dismiss
				}, key);
				case "cleared": return toast.count === 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
					text: t("toast.clearedNone"),
					onDone: dismiss
				}, key) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
					text: t(toast.count === 1 ? "toast.cleared.one" : "toast.cleared.other", { count: toast.count }),
					tone: "success",
					onDone: dismiss
				}, key);
				case "clearFailed": return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
					text: t("toast.clearFailed"),
					icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
					onDone: dismiss
				}, key);
				/* v8 ignore next -- the store publishes only the union's members, so the default holds no reachable statement. */
				default: return assertNever(toast);
			}
		}
