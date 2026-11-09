// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/MessageIconActions.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Copy / branch (/ clock) IconActions row shared by user and assistant chrome.
		* @param props - Copy text, event time, clock side, branch callback, className.
		* @returns The actions row element.
		*/
		function MessageIconActions({ text, time, clock, onBranch, branchUnavailable = false, className, extraActions, usageAction, t }) {
			const day = useCalendarDay();
			const reasonId = (0, react.useId)();
			const { copied, onCopy } = (0, _deepseek_ai_dsh_client_ui_primitives.useClipboardCopy)(text);
			const clockEl = time === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
				className: clock === "start" ? MessageIconActions_module_css_default.timeStart : MessageIconActions_module_css_default.timeEnd,
				children: formatMessageClock(time, t, day)
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: className === void 0 ? MessageIconActions_module_css_default.actions : `${MessageIconActions_module_css_default.actions} ${className}`,
				"data-clock": clock,
				children: [
					clock === "start" ? clockEl : null,
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
						label: copied ? t("copied") : t("copy"),
						side: "bottom",
						children: (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: MessageIconActions_module_css_default.action,
							"aria-label": copied ? t("copied") : t("copy"),
							onClick: onCopy,
							children: copied ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCopyOutlineRegular, {})
						})
					}),
					extraActions,
					onBranch !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
						label: branchUnavailable ? t("message.branchUnavailable") : t("message.branch"),
						side: "bottom",
						openOnClick: branchUnavailable,
						children: (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: MessageIconActions_module_css_default.action,
							"aria-label": t("message.branch"),
							"aria-disabled": branchUnavailable || void 0,
							"aria-describedby": branchUnavailable ? reasonId : void 0,
							"data-unavailable": branchUnavailable || void 0,
							onClick: branchUnavailable ? void 0 : onBranch,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBranchOutlineRegular, {})
						})
					}),
					onBranch !== void 0 && branchUnavailable && (0, react_jsx_runtime.jsx)("span", {
						id: reasonId,
						className: MessageIconActions_module_css_default.visuallyHidden,
						children: t("message.branchUnavailable")
					}),
					clock === "end" ? (0, react_jsx_runtime.jsxs)("span", {
						className: MessageIconActions_module_css_default.endInfo,
						children: [usageAction, clockEl]
					}) : usageAction
				]
			});
		}
