// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/OnboardingIllustration.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Paired artwork follows the page's light and dark theme selectors. */
		/** @param props - artwork URLs and feature-owned geometry. @returns decorative theme variants. */
		function OnboardingIllustration({ className = "", src, darkSrc }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: `${DesktopOnboarding_module_css_default.illustration} ${className}`,
				"aria-hidden": "true",
				children: [(0, react_jsx_runtime.jsx)("img", {
					className: DesktopOnboarding_module_css_default.lightIllustration,
					src,
					alt: ""
				}), (0, react_jsx_runtime.jsx)("img", {
					className: DesktopOnboarding_module_css_default.darkIllustration,
					src: darkSrc,
					alt: ""
				})]
			});
		}
