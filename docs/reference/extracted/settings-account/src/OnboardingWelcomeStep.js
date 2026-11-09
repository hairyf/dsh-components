// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/OnboardingWelcomeStep.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** @param props - localized content, focus target and navigation. @returns the welcome step. */
		function OnboardingWelcomeStep({ t, locale, heading, busy, onStart }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: `${DesktopOnboarding_module_css_default.content} ${DesktopOnboarding_module_css_default.welcome}`,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: DesktopOnboarding_module_css_default.copy,
					children: [
						(0, react_jsx_runtime.jsxs)("h1", {
							id: "desktop-onboarding-title",
							ref: heading,
							tabIndex: -1,
							children: [
								t("onboardingWelcome"),
								" ",
								(0, react_jsx_runtime.jsx)("em", {
									className: DesktopOnboarding_module_css_default.brand,
									children: t("onboardingBrand")
								})
							]
						}),
						(0, react_jsx_runtime.jsx)("p", {
							className: DesktopOnboarding_module_css_default.heroDescription,
							children: t("onboardingIntroduction")
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							className: `${DesktopOnboarding_module_css_default.action} ${DesktopOnboarding_module_css_default.start}`,
							disabled: busy,
							onClick: onStart,
							children: t("onboardingStart")
						})
					]
				}), (0, react_jsx_runtime.jsx)("div", {
					className: DesktopOnboarding_module_css_default.welcomeIllustration,
					"aria-hidden": "true",
					children: (0, react_jsx_runtime.jsx)(OnboardingIllustration, {
						className: DesktopOnboarding_module_css_default.welcomeArtwork,
						src: locale === "zh" ? onboarding_welcome_zh_default : onboarding_welcome_default,
						darkSrc: locale === "zh" ? onboarding_welcome_zh_dark_default : onboarding_welcome_dark_default
					})
				})]
			});
		}
