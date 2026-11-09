// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/OnboardingProcessStep.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		const options = [
			{
				value: "compact",
				titleKey: "onboardingCompact",
				descriptionKey: "onboardingCompactDescription",
				icon: onboarding_compact_default,
				size: 40
			},
			{
				value: "standard",
				titleKey: "onboardingStandard",
				descriptionKey: "onboardingStandardDescription",
				icon: onboarding_standard_default,
				size: 36
			},
			{
				value: "detailed",
				titleKey: "onboardingDetailed",
				descriptionKey: "onboardingDetailedDescription",
				icon: onboarding_detailed_default,
				size: 36
			}
		];
		/** @param props - selected detail, localized copy and persistence callbacks. @returns the process step. */
		function OnboardingProcessStep({ t, heading, busy, process, onSelect, onComplete }) {
			const onKeyDown = (event, value) => {
				if (busy) return;
				const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
				if (direction === 0) return;
				event.preventDefault();
				const next = options[(options.findIndex((option) => option.value === value) + direction + options.length) % options.length];
				onSelect(next.value);
				event.currentTarget.parentElement?.querySelector(`[data-process="${next.value}"]`)?.focus();
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: `${DesktopOnboarding_module_css_default.content} ${DesktopOnboarding_module_css_default.process}`,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: DesktopOnboarding_module_css_default.copy,
						children: [(0, react_jsx_runtime.jsx)("h1", {
							id: "desktop-onboarding-title",
							ref: heading,
							tabIndex: -1,
							children: t("onboardingProcess")
						}), (0, react_jsx_runtime.jsx)("p", {
							className: DesktopOnboarding_module_css_default.subtitle,
							children: t("onboardingProcessDescription")
						})]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: DesktopOnboarding_module_css_default.processCards,
						role: "radiogroup",
						"aria-labelledby": "desktop-onboarding-title",
						children: options.map((option) => (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							role: "radio",
							"data-process": option.value,
							"aria-checked": process === option.value,
							tabIndex: process === option.value || process === null && option.value === "compact" ? 0 : -1,
							className: `${DesktopOnboarding_module_css_default.card} ${process === option.value ? DesktopOnboarding_module_css_default.selected : ""}`,
							"aria-disabled": busy,
							onClick: () => {
								if (!busy) onSelect(option.value);
							},
							onKeyDown: (event) => {
								onKeyDown(event, option.value);
							},
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: DesktopOnboarding_module_css_default.processIcon,
									children: (0, react_jsx_runtime.jsx)("img", {
										src: option.icon,
										width: option.size,
										height: option.size,
										alt: ""
									})
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: DesktopOnboarding_module_css_default.cardTitle,
									children: t(option.titleKey)
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: DesktopOnboarding_module_css_default.cardDescription,
									children: t(option.descriptionKey)
								})
							]
						}, option.value))
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: DesktopOnboarding_module_css_default.primaryAction,
						children: process !== null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							className: DesktopOnboarding_module_css_default.action,
							variant: "primary",
							"aria-disabled": busy,
							onClick: () => {
								if (!busy) onComplete();
							},
							children: t("onboardingEnter")
						})
					})
				]
			});
		}
