// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/QuotaNoticeHost.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The frame-wide `shell.overlay` host for quota notices. It holds the one live
		* notice for the whole app, so leaving the Chat panel does not drop it. A
		* `shell.quota-notice` entry may replace the generic Toast for codes it claims.
		*/
		/**
		* @param props - the live notice, its dismissal, the chain outlet, and the locale seat.
		* @returns the notice on display, or null while none is live.
		*/
		function QuotaNoticeHost({ useNotice, dismissNotice, keepNoticeOpen, renderSlotChain, t }) {
			const notice = useNotice((current) => current);
			if (notice === null) return null;
			const owner = {
				code: notice.code,
				message: t("message.failure.quota"),
				dismiss: dismissNotice,
				keepOpen: keepNoticeOpen
			};
			return (0, react_jsx_runtime.jsx)(react.Fragment, { children: renderSlotChain("shell.quota-notice", owner, { fallback: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
				text: owner.message,
				icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, { size: 18 }),
				onDone: dismissNotice
			}) }) }, `quota-notice-${String(notice.seq)}`);
		}
