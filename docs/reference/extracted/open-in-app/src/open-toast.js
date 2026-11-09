// Extracted from @deepseek-ai/dsh-client-ui-open-in-app (lib/client.js); region lib/types/client/open-toast.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Create the one outcome store the overlay entry shows.
		* @returns the observable notice with its report and dismiss actions.
		*/
		function createOpenInAppToastSource() {
			const store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(null);
			let seq = 0;
			return {
				hooks: { toast: store },
				report: (outcome) => {
					if (outcome.kind === "skipped") return;
					if (outcome.kind !== "failed" && !(0, _deepseek_ai_dsh_client_ui_primitives.isMobileDevice)()) return;
					seq += 1;
					store.set({
						...outcome,
						seq
					});
				},
				dismiss: () => {
					store.set(null);
				}
			};
		}
		/**
		* Render a mobile handoff confirmation or a native-open failure.
		* @param props - the notice hook, its dismissal, and the locale seat.
		* @returns the banner on display, or null.
		*/
		function OpenInAppToast({ useToast, dismiss, t }) {
			const toast = useToast((current) => current);
			if (toast === null) return null;
			const key = `open-in-app-${String(toast.seq)}`;
			if (toast.kind === "failed") return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
				text: t(toast.failure === "revealError" ? "path.revealError" : "path.openError"),
				icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
				onDone: dismiss
			}, key);
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
				text: t(toast.kind === "opened" ? "path.opened" : "path.revealed"),
				tone: "success",
				onDone: dismiss
			}, key);
		}
