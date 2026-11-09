// Extracted from @deepseek-ai/dsh-client-ui-agent-preset (lib/client.js); region lib/types/client/AgentPresetSeat.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The agent-preset chip on the new-session screen, beside the workspace
		* picker.
		*
		* It lives here rather than in the composer because the choice is only
		* available before a conversation starts: once a turn has run, the session's
		* history was produced under that preset's tools and the host refuses to swap
		* them. A control that spends most of its life disabled belongs on the screen
		* where it still works.
		*
		* The menu opens on the staged choice, which starts as the deployment default.
		* Picking stages; the choice reaches a session when one becomes current.
		*/
		const INTRO_TEXT_DELAY_MS = 150;
		const INTRO_CHAR_STAGGER_MS = 40;
		const INTRO_TEXT_REVEAL_MS = 200;
		const INTRO_CHAR_FADE_MS = 400;
		/** Duration of a selection-refusal banner, including a revision becoming unavailable during a pick. */
		const REFUSAL_HOLD_MS = 8e3;
		/**
		* Per-character start offset for the introduce reveal.
		* @param count - character count of the shown preset name.
		* @returns milliseconds between successive character starts.
		*/
		function introStaggerMs(count) {
			if (count <= 1) return 0;
			return Math.min(INTRO_CHAR_STAGGER_MS, INTRO_TEXT_REVEAL_MS / (count - 1));
		}
		/**
		* Render the new-session agent-preset chip.
		* @param props - composed slot props.
		* @returns The chip and any pending selection refusal, or null outside the main view.
		*/
		function AgentPresetSeat({ sessionId, useSessionRetainInfo, load, select, dismissRefusal, introduced, useAgentPresetSeat, useDeveloperTools, t }) {
			const developerTools = useDeveloperTools((value) => value);
			const state = useAgentPresetSeat((snapshot) => snapshot);
			const main = useSessionRetainInfo((info) => sessionId === void 0 || (info?.retainedBy.mainView ?? 0) > 0);
			const [open, setOpen] = (0, react.useState)(false);
			const toastSeq = (0, react.useRef)(0);
			const [toast, setToast] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				if (state.error !== null && typeof state.error === "object") {
					toastSeq.current += 1;
					setToast({
						seq: toastSeq.current,
						error: state.error
					});
				} else setToast(null);
			}, [state.error]);
			(0, react.useEffect)(() => {
				load();
			}, [load]);
			const options = (0, react.useMemo)(() => state.options.filter((option) => developerTools || !requiresCodingTools(option)), [state.options, developerTools]);
			(0, react.useEffect)(() => {
				setOpen(false);
			}, [developerTools, options.length]);
			const chosen = state.options.find((option) => option.id === state.current);
			const label = (chosen === void 0 ? void 0 : presetDisplayText(chosen, t))?.name ?? state.current;
			const ready = state.options.length > 0 && state.current !== "";
			const [introducing, setIntroducing] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				if (!state.introduce || !ready) return;
				const characters = Array.from(label);
				if (characters.length === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
					introduced();
					return;
				}
				setIntroducing(true);
				const done = window.setTimeout(() => {
					setIntroducing(false);
					introduced();
				}, INTRO_TEXT_DELAY_MS + (characters.length - 1) * introStaggerMs(characters.length) + INTRO_CHAR_FADE_MS);
				return () => {
					window.clearTimeout(done);
				};
			}, [
				state.introduce,
				ready,
				label,
				introduced
			]);
			if (!main) return null;
			const characters = Array.from(label);
			const stagger = introStaggerMs(characters.length);
			const shownLabel = introducing ? (0, react_jsx_runtime.jsx)("span", {
				className: AgentPresetSeat_module_css_default.introText,
				children: characters.map((character, index) => (0, react_jsx_runtime.jsx)("span", {
					className: AgentPresetSeat_module_css_default.introChar,
					style: { animationDelay: `${INTRO_TEXT_DELAY_MS + index * stagger}ms` },
					children: character
				}, index))
			}) : label;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [ready && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
				open: open && options.length > 0,
				onClose: () => {
					setOpen(false);
				},
				items: options.map((option) => {
					const text = presetDisplayText(option, t);
					return {
						id: option.id,
						label: (0, react_jsx_runtime.jsxs)("span", {
							className: AgentPresetSeat_module_css_default.item,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: AgentPresetSeat_module_css_default.itemName,
								children: text.name
							}), (0, react_jsx_runtime.jsx)("span", {
								className: AgentPresetSeat_module_css_default.itemDesc,
								children: text.description ?? t("noDescription")
							})]
						})
					};
				}),
				selectedId: state.current,
				onSelect: (id) => {
					setOpen(false);
					select(id);
				},
				align: "start",
				portal: true,
				className: AgentPresetSeat_module_css_default.menuAnchor,
				anchor: (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: AgentPresetSeat_module_css_default.seat,
					"aria-haspopup": "menu",
					"aria-expanded": open && options.length > 0,
					title: (typeof state.error === "object" ? state.error?.reason : state.error) ?? t("seatHint"),
					disabled: state.busy || options.length === 0,
					onClick: () => {
						setOpen((value) => !value);
					},
					children: [
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconAgentPresetOutlineRegular, { className: introducing ? `${AgentPresetSeat_module_css_default.seatIcon} ${AgentPresetSeat_module_css_default.introIcon}` : AgentPresetSeat_module_css_default.seatIcon }),
						(0, react_jsx_runtime.jsx)("span", {
							className: AgentPresetSeat_module_css_default.seatLabel,
							children: shownLabel
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { className: AgentPresetSeat_module_css_default.chevron })
					]
				})
			}), toast !== null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
				text: t("switchRefused", {
					name: presetDisplayText(toast.error.preset, t).name,
					reason: toast.error.reason
				}),
				icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
				holdMs: REFUSAL_HOLD_MS,
				anchor: document.querySelector("[data-composer-card]"),
				onDone: () => {
					dismissRefusal(toast.error);
				}
			}, toast.seq)] });
		}
