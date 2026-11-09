// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/OnboardingConfirmation.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Credit and setup confirmations with contained keyboard focus. */
/** @param props - confirmation action, localized copy and navigation callbacks. @returns a focus-contained dialog. */
function OnboardingConfirmation({ kind, t, busy, canRecharge, onClose, onContinueSetup, onContinue, onRecharge, onSkip }) {
	const credit = kind !== "skip";
	const title = t(credit ? "onboardingNoCreditTitle" : "onboardingSkipTitle");
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
		open: true,
		headless: true,
		backdropBlur: false,
		title,
		onClose,
		children: (0, react_jsx_runtime.jsxs)("div", {
			className: DesktopOnboarding_module_css_default.confirmation,
			children: [
				(0, react_jsx_runtime.jsxs)("div", {
					className: DesktopOnboarding_module_css_default.confirmationHeading,
					children: [(0, react_jsx_runtime.jsx)("h2", { children: title }), (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: DesktopOnboarding_module_css_default.confirmationClose,
						"aria-label": t("close"),
						onClick: onClose,
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 14 })
					})]
				}),
				(0, react_jsx_runtime.jsx)("p", { children: t(credit ? "onboardingNoCreditDescription" : "onboardingSkipDescription") }),
				(0, react_jsx_runtime.jsxs)("div", {
					className: DesktopOnboarding_module_css_default.confirmationActions,
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						className: DesktopOnboarding_module_css_default.dialogButton,
						variant: "outline",
						disabled: busy,
						onClick: kind === "credit-skip" ? onSkip : kind === "credit" ? onContinue : onContinueSetup,
						children: t(credit ? "onboardingUnderstood" : "onboardingKeepSetting")
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						className: DesktopOnboarding_module_css_default.dialogButton,
						variant: "primary",
						disabled: busy || credit && !canRecharge,
						onClick: credit ? onRecharge : onSkip,
						children: t(credit ? "onboardingGoTopUp" : "onboardingEnter")
					})]
				})
			]
		})
	});
}
