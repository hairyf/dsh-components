// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/DesktopOnboarding.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		const onboardingPages = {
			welcome: "onboarding_welcome",
			credit: "onboarding_recharge",
			purpose: "onboarding_use_case",
			process: "onboarding_process",
			done: void 0
		};
		/**
		* @param props - durable choices, account state, localized copy and the shared recharge page channel.
		* @returns the active first-run page.
		*/
		function DesktopOnboarding({ state, account, openPlatformPage, update, complete, retry, t, locale, track, exiting = false }) {
			const [dialog, setDialog] = (0, react.useState)(null);
			const heading = (0, react.useRef)(null);
			const page = (0, react.useRef)(null);
			const releaseRecharge = (0, react.useRef)(void 0);
			(0, react.useEffect)(() => () => {
				releaseRecharge.current?.();
				releaseRecharge.current = void 0;
			}, []);
			const progress = state.progress;
			const targetStep = progress.step;
			const [step, setStep] = (0, react.useState)(targetStep);
			const busy = state.status === "loading" || state.status === "saving" || exiting || step !== targetStep;
			(0, react.useEffect)(() => {
				if (step === targetStep) return;
				const element = page.current;
				if (!state.visible || element?.animate === void 0 || matchMedia("(prefers-reduced-motion: reduce)").matches) {
					setStep(targetStep);
					return;
				}
				const animation = element.animate([{ opacity: 1 }, { opacity: 0 }], {
					duration: 40,
					fill: "forwards",
					easing: "ease-out"
				});
				animation.finished.then(() => {
					setStep(targetStep);
				}, (_error) => {});
				return () => {
					animation.cancel();
				};
			}, [
				targetStep,
				step,
				state.visible
			]);
			(0, react.useEffect)(() => {
				heading.current?.focus();
			}, [step]);
			const pageName = onboardingPages[step];
			const shownPage = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (!state.visible || pageName === void 0 || exiting) {
					shownPage.current = null;
					return;
				}
				if (state.status === "loading") return;
				if (shownPage.current === pageName) return;
				shownPage.current = pageName;
				track?.("onboarding_page_view", { page_name: pageName });
			}, [
				state.visible,
				state.status,
				step,
				pageName,
				exiting,
				track
			]);
			const shownPopup = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (dialog === null || !state.visible || state.status === "loading" || step === "done") {
					shownPopup.current = null;
					return;
				}
				if (shownPopup.current === dialog) return;
				shownPopup.current = dialog;
				track?.("onboarding_popup_view", { popup_name: dialog === "skip" ? "skip_setting" : "skip_charge" });
			}, [
				dialog,
				track,
				state.visible,
				state.status,
				step
			]);
			const popupClick = (button_name) => {
				track?.("onboarding_popup_click", {
					popup_name: dialog === "skip" ? "skip_setting" : "skip_charge",
					button_name
				});
			};
			if (state.visible && state.status === "loading") return (0, react_jsx_runtime.jsx)(OnboardingSurface, { children: (0, react_jsx_runtime.jsx)("div", {
				className: DesktopOnboarding_module_css_default.loading,
				role: "status",
				children: t("onboardingLoading")
			}) });
			if (!state.visible || pageName === void 0) return null;
			const click = (button_name) => {
				const selected_content = step === "purpose" && progress.purpose !== null ? {
					office: "office",
					development: "code",
					both: "code_office"
				}[progress.purpose] : step === "process" && progress.process !== null ? {
					compact: "focus_result",
					standard: "key_detail",
					detailed: "full_process"
				}[progress.process] : void 0;
				track?.("onboarding_page_click", {
					page_name: pageName,
					button_name,
					...selected_content === void 0 ? {} : { selected_content }
				});
			};
			const go = (next) => {
				update({ step: next });
			};
			const canRecharge = openPlatformPage !== void 0;
			const recharge = () => {
				setDialog(null);
				releaseRecharge.current?.();
				releaseRecharge.current = openPlatformPage?.("top-up", () => {
					releaseRecharge.current = void 0;
				});
			};
			const later = () => {
				const balance = account.details?.balance;
				if (balance?.status === "ready" && !hasOnboardingCredit(balance)) setDialog("credit");
				else go("purpose");
			};
			const purposeNext = () => {
				if (progress.purpose === "office") complete("completed");
				else go("process");
			};
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(OnboardingSurface, {
				exiting,
				children: (0, react_jsx_runtime.jsxs)("section", {
					ref: page,
					className: `${DesktopOnboarding_module_css_default.page} ${dialog !== null ? DesktopOnboarding_module_css_default.blurred : ""}`,
					"data-desktop-onboarding": step,
					lang: locale,
					"aria-labelledby": "desktop-onboarding-title",
					"aria-busy": busy,
					children: [
						step === "welcome" && (0, react_jsx_runtime.jsx)(OnboardingWelcomeStep, {
							t,
							locale,
							heading,
							busy,
							onStart: () => {
								click("next");
								go("credit");
							}
						}),
						step === "credit" && (0, react_jsx_runtime.jsx)(OnboardingCreditStep, {
							t,
							locale,
							heading,
							busy,
							funded: state.creditFunded,
							canRecharge,
							onContinue: () => {
								click("continue");
								go("purpose");
							},
							onRecharge: () => {
								click("charge");
								recharge();
							},
							onLater: () => {
								click("later");
								later();
							}
						}),
						step === "purpose" && (0, react_jsx_runtime.jsx)(OnboardingPurposeStep, {
							t,
							heading,
							busy,
							purpose: progress.purpose,
							onSelect: (purpose) => {
								update({ purpose });
							},
							onContinue: () => {
								click("next");
								purposeNext();
							}
						}),
						step === "process" && (0, react_jsx_runtime.jsx)(OnboardingProcessStep, {
							t,
							heading,
							busy,
							process: progress.process,
							onSelect: (process) => {
								update({ process });
							},
							onComplete: () => {
								click("next");
								complete("completed");
							}
						}),
						state.error !== null && (0, react_jsx_runtime.jsxs)("div", {
							className: DesktopOnboarding_module_css_default.status,
							role: "alert",
							children: [t("onboardingSaveFailed"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								disabled: busy,
								onClick: () => {
									retry();
								},
								children: t("onboardingRetry")
							})]
						}),
						step !== "welcome" && (0, react_jsx_runtime.jsxs)("footer", {
							className: DesktopOnboarding_module_css_default.navigation,
							children: [(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								disabled: busy,
								onClick: () => {
									click("back");
									go(step === "credit" ? "welcome" : step === "purpose" ? "credit" : "purpose");
								},
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: DesktopOnboarding_module_css_default.backIcon,
									style: { maskImage: `url(${onboarding_back_default})` },
									"aria-hidden": "true"
								}), t("onboardingBack")]
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: busy,
								onClick: () => {
									click("skip");
									setDialog(step === "credit" ? "credit-skip" : "skip");
								},
								children: t("onboardingSkip")
							})]
						})
					]
				}, step)
			}), dialog !== null && (0, react_jsx_runtime.jsx)(OnboardingConfirmation, {
				kind: dialog,
				t,
				busy,
				canRecharge,
				onClose: () => {
					popupClick("close");
					setDialog(null);
				},
				onContinueSetup: () => {
					popupClick("setting");
					setDialog(null);
				},
				onContinue: () => {
					popupClick("know");
					setDialog(null);
					go("purpose");
				},
				onRecharge: () => {
					popupClick("charge");
					recharge();
				},
				onSkip: () => {
					popupClick(dialog === "skip" ? "enter" : "know");
					complete("skipped").then(() => {
						setDialog(null);
					});
				}
			})] });
		}
