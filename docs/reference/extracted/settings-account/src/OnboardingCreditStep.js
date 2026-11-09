// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/OnboardingCreditStep.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** @param props - credit facts, localized content and recharge/navigation actions. @returns the credit step. */
		function OnboardingCreditStep({ t, locale, heading, busy, funded, canRecharge, onContinue, onRecharge, onLater }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: `${DesktopOnboarding_module_css_default.content} ${DesktopOnboarding_module_css_default.credit}`,
				children: [(0, react_jsx_runtime.jsx)(OnboardingIllustration, {
					className: DesktopOnboarding_module_css_default.creditIllustration,
					src: locale === "zh" ? onboarding_recharge_zh_default : onboarding_recharge_default,
					darkSrc: locale === "zh" ? onboarding_recharge_zh_dark_default : onboarding_recharge_dark_default
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: DesktopOnboarding_module_css_default.copy,
					children: [
						(0, react_jsx_runtime.jsx)("h1", {
							id: "desktop-onboarding-title",
							ref: heading,
							tabIndex: -1,
							children: t("onboardingCredit")
						}),
						(0, react_jsx_runtime.jsx)("p", {
							className: DesktopOnboarding_module_css_default.heroDescription,
							children: t("onboardingCreditDescription")
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: DesktopOnboarding_module_css_default.creditActions,
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								className: DesktopOnboarding_module_css_default.action,
								variant: "primary",
								disabled: busy || !funded && !canRecharge,
								onClick: funded ? onContinue : onRecharge,
								children: t(funded ? "onboardingContinue" : "onboardingTopUp")
							}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								className: `${DesktopOnboarding_module_css_default.action} ${DesktopOnboarding_module_css_default.laterAction}`,
								disabled: busy || funded && !canRecharge,
								onClick: funded ? onRecharge : onLater,
								children: t(funded ? "onboardingFundedTopUp" : "onboardingLater")
							})]
						})
					]
				})]
			});
		}
