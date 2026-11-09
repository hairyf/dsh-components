// Extracted from @deepseek-ai/dsh-client-ui-agent-preset (lib/client.js); region lib/types/client/PresetGuideDialog.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Read-only help stays local to Settings and never changes the selected preset. */
		const guides = new Map([
			["standard", {
				name: "presetStandardName",
				intro: "guideStandardIntro",
				explanation: "guideStandardExplanation",
				usage: "guideStandardUsage"
			}],
			["ptc", {
				name: "presetPtcName",
				intro: "guidePtcIntro",
				explanation: "guidePtcExplanation",
				usage: "guidePtcUsage"
			}],
			["minimal", {
				name: "presetMinimalName",
				intro: "guideMinimalIntro",
				explanation: "guideMinimalExplanation",
				usage: "guideMinimalUsage"
			}],
			["cordis", {
				name: "presetCordisName",
				intro: "guideCordisIntro",
				explanation: "guideCordisExplanation",
				usage: "guideCordisUsage"
			}]
		]);
		/**
		* Look up help only for known, shipped presets.
		* @param id - preset identifier from the roster.
		* @param trust - roster source; custom presets own their capability claims.
		* @returns the shipped guide, or undefined for unknown and custom presets.
		*/
		function presetGuide(id, trust) {
			return trust === "system" ? guides.get(id) : void 0;
		}
		/** Keep keyboard focus inside a preset reader while Tab moves through its controls.
		* @param event Keyboard event from the active reader.
		*/
		function trapPresetReaderTab(event) {
			if (event.key !== "Tab") return;
			const targets = Array.from(event.currentTarget.querySelectorAll("button:not([disabled]):not([tabindex=\"-1\"]), [tabindex=\"0\"]")).filter((element) => !element.closest("[hidden]"));
			const first = targets[0];
			const last = targets[targets.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last?.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first?.focus();
			}
		}
		/** Curated usage dictionaries contain only level-three example sections. */
		function GuideUsage({ text, t }) {
			const labels = {
				code: {
					copyLabel: t("guideCopy"),
					copiedLabel: t("guideCopied"),
					toolbarLabels: {
						codeLabel: t("codeBlock.title"),
						wrapLabel: t("codeBlock.wrap"),
						unwrapLabel: t("codeBlock.unwrap")
					}
				},
				footnotes: t("guideFootnotes")
			};
			return text.split(/(?=^### )/m).map((section) => {
				const headingEnd = section.indexOf("\n");
				const title = section.slice(4, headingEnd);
				return (0, react_jsx_runtime.jsxs)("section", {
					className: PresetGuideDialog_module_css_default.guideExample,
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: PresetGuideDialog_module_css_default.guideExampleHeader,
						children: [(0, react_jsx_runtime.jsx)("h3", { children: title }), (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
							tone: "neutral",
							className: PresetGuideDialog_module_css_default.guideExampleTag,
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconListPenOutlineRegular, { size: 12 }), t("guideExampleTask")]
						})]
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
						text: section.slice(headingEnd + 1),
						labels
					})]
				}, title);
			});
		}
		/**
		* Open read-only help without changing the selected preset.
		* @param props - localized guide, initial page, and close callback.
		* @returns the modal reader with independent scroll positions for each page.
		*/
		function PresetGuideDialog({ guide, initialPage, t, onClose }) {
			const [page, setPage] = (0, react.useState)(initialPage);
			const guideId = (0, react.useId)();
			const content = (0, react.useRef)(null);
			(0, react.useLayoutEffect)(() => {
				content.current?.querySelector("[role=\"tab\"][aria-selected=\"true\"]")?.focus();
			}, []);
			const onKeyDown = (event) => {
				if (event.key === "Escape") {
					event.preventDefault();
					event.stopPropagation();
					onClose();
				} else trapPresetReaderTab(event);
			};
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: true,
				headless: true,
				onClose,
				title: t(guide.name),
				className: PresetGuideDialog_module_css_default.guideDialog,
				children: (0, react_jsx_runtime.jsxs)("div", {
					ref: content,
					className: PresetGuideDialog_module_css_default.guideLayout,
					role: "presentation",
					onKeyDownCapture: onKeyDown,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: PresetGuideDialog_module_css_default.guideHeader,
							children: [(0, react_jsx_runtime.jsxs)("div", {
								className: PresetGuideDialog_module_css_default.guideTitleRow,
								children: [(0, react_jsx_runtime.jsx)("h2", {
									className: PresetGuideDialog_module_css_default.guideTitle,
									children: t(guide.name)
								}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "ghost",
									className: PresetGuideDialog_module_css_default.guideClose,
									"aria-label": t("close"),
									onClick: onClose,
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 18 })
								})]
							}), (0, react_jsx_runtime.jsx)("p", {
								className: PresetGuideDialog_module_css_default.guideIntro,
								children: t(guide.intro)
							})]
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SegmentedTabs, {
							className: PresetGuideDialog_module_css_default.guideTabs,
							label: t("guideSections"),
							value: page,
							onChange: setPage,
							items: [{
								value: "explanation",
								label: t("modeExplanation"),
								id: `${guideId}-explanation-tab`,
								panelId: `${guideId}-explanation-panel`
							}, {
								value: "usage",
								label: t("howToUse"),
								id: `${guideId}-usage-tab`,
								panelId: `${guideId}-usage-panel`
							}]
						}),
						["explanation", "usage"].map((section) => (0, react_jsx_runtime.jsx)("div", {
							id: `${guideId}-${section}-panel`,
							role: "tabpanel",
							"aria-labelledby": `${guideId}-${section}-tab`,
							className: PresetGuideDialog_module_css_default.guidePanel,
							"data-guide-page": section,
							hidden: page !== section,
							tabIndex: 0,
							children: section === "usage" ? (0, react_jsx_runtime.jsx)(GuideUsage, {
								text: t(guide.usage),
								t
							}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
								text: t(guide.explanation),
								labels: {
									code: {
										copyLabel: t("guideCopy"),
										copiedLabel: t("guideCopied"),
										toolbarLabels: {
											codeLabel: t("codeBlock.title"),
											wrapLabel: t("codeBlock.wrap"),
											unwrapLabel: t("codeBlock.unwrap")
										}
									},
									footnotes: t("guideFootnotes")
								}
							})
						}, section))
					]
				})
			});
		}
