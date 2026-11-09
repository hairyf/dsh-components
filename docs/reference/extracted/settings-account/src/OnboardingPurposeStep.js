// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/OnboardingPurposeStep.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Work-purpose selection with controlled, independently selectable cards. */
		/** @param props - selected purposes, localized copy and persistence callbacks. @returns the purpose step. */
		function OnboardingPurposeStep({ t, heading, busy, purpose, onSelect, onContinue }) {
			const selected = (value) => purpose === value || purpose === "both";
			const toggle = (value) => {
				if (busy) return;
				const office = value === "office" ? !selected("office") : selected("office");
				const development = value === "development" ? !selected("development") : selected("development");
				onSelect(office && development ? "both" : office ? "office" : development ? "development" : null);
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: `${DesktopOnboarding_module_css_default.content} ${DesktopOnboarding_module_css_default.purpose}`,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: DesktopOnboarding_module_css_default.copy,
						children: [(0, react_jsx_runtime.jsxs)("h1", {
							id: "desktop-onboarding-title",
							ref: heading,
							tabIndex: -1,
							children: [
								t("onboardingPurposePrefix"),
								" ",
								(0, react_jsx_runtime.jsx)("em", {
									className: DesktopOnboarding_module_css_default.brand,
									children: t("onboardingBrand")
								}),
								" ",
								t("onboardingPurposeSuffix")
							]
						}), (0, react_jsx_runtime.jsx)("p", {
							className: DesktopOnboarding_module_css_default.subtitle,
							children: t("onboardingPurposeDescription")
						})]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: DesktopOnboarding_module_css_default.purposeCards,
						children: ["office", "development"].map((value) => (0, react_jsx_runtime.jsx)(PurposeCard, {
							purpose: value,
							checked: selected(value),
							t,
							onToggle: () => {
								toggle(value);
							}
						}, value))
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: DesktopOnboarding_module_css_default.primaryAction,
						children: purpose !== null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							className: DesktopOnboarding_module_css_default.action,
							variant: "primary",
							"aria-disabled": busy,
							onClick: () => {
								if (!busy) onContinue();
							},
							children: t("onboardingContinue")
						})
					})
				]
			});
		}
		function PurposeCard({ purpose, checked, t, onToggle }) {
			const previous = (0, react.useRef)(checked);
			const [entering, setEntering] = (0, react.useState)(false);
			(0, react.useLayoutEffect)(() => {
				setEntering(checked && !previous.current);
				previous.current = checked;
			}, [checked]);
			const titleKey = purpose === "office" ? "onboardingOffice" : "onboardingDevelopment";
			return (0, react_jsx_runtime.jsxs)("div", {
				className: `${DesktopOnboarding_module_css_default.card} ${checked ? DesktopOnboarding_module_css_default.selected : ""} ${purpose === "office" ? DesktopOnboarding_module_css_default.officeCard : ""}`,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: DesktopOnboarding_module_css_default.cardTop,
						children: [checked ? (0, react_jsx_runtime.jsx)("span", {
							className: `${DesktopOnboarding_module_css_default.fileIcons} ${entering ? DesktopOnboarding_module_css_default.iconsEntering : ""}`,
							"aria-hidden": "true",
							children: (purpose === "office" ? [
								"word",
								"ppt",
								"excel",
								"pdf",
								"image"
							] : [
								"typescript",
								"javascript",
								"sql",
								"python",
								"cpp"
							]).map((kind) => (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
								kind,
								size: 28
							}, kind))
						}) : (0, react_jsx_runtime.jsx)("img", {
							src: purpose === "office" ? onboarding_office_default : onboarding_code_default,
							width: 40,
							height: 40,
							alt: ""
						}), (0, react_jsx_runtime.jsxs)("label", {
							className: DesktopOnboarding_module_css_default.cardCheckbox,
							children: [(0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								"aria-label": t(titleKey),
								checked,
								onChange: onToggle
							}), (0, react_jsx_runtime.jsx)("span", {
								className: DesktopOnboarding_module_css_default.indicator,
								"aria-hidden": "true",
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, {})
							})]
						})]
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: DesktopOnboarding_module_css_default.cardTitle,
						children: t(titleKey)
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: DesktopOnboarding_module_css_default.cardDescription,
						children: t(purpose === "office" ? "onboardingOfficeDescription" : "onboardingDevelopmentDescription")
					})
				]
			});
		}
