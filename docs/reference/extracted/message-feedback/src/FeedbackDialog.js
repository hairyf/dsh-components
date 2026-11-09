// Extracted from @deepseek-ai/dsh-client-ui-message-feedback (lib/client.js); region lib/types/client/FeedbackDialog.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The feedback dialog and its acknowledgement and failure toasts, rendered as one entry
		* of `conversation.input.overlay` so each Session owns exactly one of each.
		* The Modal and the Toast both portal to `document.body`; the overlay slot
		* only supplies the per-session controller and the composer card the toast
		* centers over.
		* @module @deepseek-ai/dsh-client-ui-message-feedback/client/FeedbackDialog
		*/
		const CATEGORIES = Object.keys({
			"task-result": true,
			"instruction-following": true,
			"product-interaction": true,
			"service-stability": true,
			"resource-cost": true,
			"security-privacy-permission": true,
			"other": true
		});
		/** Failure codes with their own copy; every other code reads the generic line. */
		const FAILURE_COPY = {
			"version-conflict": "error.conflict",
			"note-too-large": "error.noteTooLarge"
		};
		/**
		* Render one Session's feedback dialog and toast.
		* @param props - the dialog hook, the draft verbs, and the locale seat.
		* @returns the modal while a target is open and either toast while it is showing.
		*/
		function FeedbackDialog({ useDialog, edit, submit, dismiss, dismissFailure, dismissToast, t }) {
			const state = useDialog((s) => s);
			const probeRef = (0, react.useRef)(null);
			const [card, setCard] = (0, react.useState)(null);
			(0, react.useLayoutEffect)(() => {
				setCard(probeRef.current?.closest("[data-composer-card]") ?? null);
			}, []);
			const toast = state.toast;
			const onToastDone = (0, react.useCallback)(() => {
				dismissToast(toast);
			}, [dismissToast, toast]);
			(0, react.useEffect)(() => () => {
				dismissToast(toast);
			}, [dismissToast, toast]);
			const failureCode = state.failure;
			const failure = failureCode === null ? null : t(FAILURE_COPY[failureCode] ?? "error.generic");
			const onFailureDone = (0, react.useCallback)(() => {
				dismissFailure();
			}, [dismissFailure]);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsx)("span", {
					ref: probeRef,
					hidden: true
				}),
				toast > 0 && failure === null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
					text: t("toast.recorded"),
					tone: "success",
					anchor: card,
					onDone: onToastDone
				}, toast),
				failure !== null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
					text: failure,
					icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
					anchor: card,
					holdMs: 6e3,
					onDone: onFailureDone
				}, `failure-${failureCode}`),
				(0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
					open: state.target !== null,
					title: t("dialog.title"),
					closeLabel: t("close"),
					onClose: dismiss,
					className: FeedbackDialog_module_css_default.dialog,
					footer: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						className: FeedbackDialog_module_css_default.submit,
						disabled: state.submitting,
						onClick: () => {
							submit();
						},
						children: state.submitting ? t("submitting") : t("submit")
					}),
					children: [(0, react_jsx_runtime.jsx)("div", {
						className: FeedbackDialog_module_css_default.categories,
						role: "group",
						"aria-label": t("dialog.categories"),
						children: CATEGORIES.map((category) => (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: state.category === category ? `${FeedbackDialog_module_css_default.chip} ${FeedbackDialog_module_css_default.chipActive}` : FeedbackDialog_module_css_default.chip,
							"aria-pressed": state.category === category,
							disabled: state.submitting,
							onClick: () => {
								edit({ category: state.category === category ? null : category });
							},
							children: t(`category.${category}`)
						}, category))
					}), (0, react_jsx_runtime.jsx)("textarea", {
						className: FeedbackDialog_module_css_default.detail,
						"aria-label": t("dialog.detail"),
						placeholder: t("dialog.hint"),
						value: state.text,
						readOnly: state.submitting,
						onChange: (event) => {
							edit({ text: event.target.value });
						}
					})]
				})
			] });
		}
