// Extracted from @deepseek-ai/dsh-client-ui-settings-general (lib/client.js); region lib/types/client/SettingsRoot.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Settings shell root: the sidebar-foot trigger row plus the centered modal
* panel with the section nav rail. In browsers below 768px the panel fills
* the viewport and the rail turns into a horizontal strip; Windows and macOS
* desktop windows retain the rail
* (SettingsRoot.module.css). The shell is a pure composition face —
* slot-owned text (trigger label, panel title, close label, sections) arrives
* from registrants through slots; accessible names resolve from localized
* content (trigger: shell locale; dialog: aria-labelledby the title node;
* close: visually-hidden slot text). Modal open state and the active section
* id belong to the declared owner store; the onboarding coordinator mounts
* exactly one ordered registrant while the sessions-derived empty-Hero fact
* is active. Visible dialog chrome belongs to the step, so a
* mounted-but-deciding step paints nothing here.
*/
const RECOVERY_CONFIRMATION_MS = 2e3;
/** Minimum visible time for the connecting pill; shorter attempts read as flicker. */
const CONNECTING_MIN_VISIBLE_MS = 800;
/** Nav glyph by section id; unknown ids fall back to the settings gear. */
function navIcon(id) {
	if (id === "account") return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconUserOutlineMedium, { size: 16 });
	if (id === "models") return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutlineMedium, { size: 16 });
	if (id === "agent-presets") return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconAgentPresetOutlineMedium, { size: 16 });
	if (id === "plugins") return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPersonalizationOutlineMedium, { size: 16 });
	if (id === "archived-sessions") return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconArchiveOutlineMedium, { size: 16 });
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSettingsOutlineMedium, { size: 16 });
}
/**
* Body-portaled modal layer: full-viewport mask + centered panel. Close paths: the
* header button, a mask click, and document-level Escape (mounted only while
* open, so the listener lifetime is the panel's).
*/
function SettingsPanel({ rows, renderSlot, activeId, onSelect, onClose }) {
	const active = rows.find((r) => r.id === activeId)?.id ?? rows[0]?.id;
	const titleId = (0, react.useId)();
	const panel = (0, react.useRef)(null);
	(0, _deepseek_ai_dsh_client_ui_primitives.useModalLayer)(panel, true, onClose);
	return (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)("div", {
		className: SettingsRoot_module_css_default.overlay,
		role: "presentation",
		children: [(0, react_jsx_runtime.jsx)("div", {
			className: SettingsRoot_module_css_default.mask,
			"aria-hidden": "true",
			onClick: onClose
		}), (0, react_jsx_runtime.jsxs)("div", {
			ref: panel,
			tabIndex: -1,
			"data-shortcut-modal": "settings",
			className: SettingsRoot_module_css_default.panel,
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": titleId,
			children: [
				(0, react_jsx_runtime.jsx)("div", {
					className: SettingsRoot_module_css_default.navTitle,
					id: titleId,
					tabIndex: -1,
					"data-modal-autofocus": active === void 0 ? "" : void 0,
					children: renderSlot("settings.header", {})
				}),
				(0, react_jsx_runtime.jsx)("nav", {
					className: SettingsRoot_module_css_default.nav,
					children: (0, react_jsx_runtime.jsx)("div", {
						className: SettingsRoot_module_css_default.navList,
						children: rows.map((row) => (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: clsx(SettingsRoot_module_css_default.navCell, row.id === active && SettingsRoot_module_css_default.active),
							"aria-current": row.id === active ? "true" : void 0,
							"data-modal-autofocus": row.id === active ? "" : void 0,
							onFocus: (event) => {
								event.currentTarget.scrollIntoView({
									block: "nearest",
									inline: "nearest"
								});
							},
							onClick: () => {
								onSelect(row.id);
							},
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: SettingsRoot_module_css_default.navIcon,
								"aria-hidden": "true",
								children: renderSlot("settings.section.icon", {
									size: 16,
									active: row.id === active
								}, {
									only: row.id,
									fallback: navIcon(row.id)
								})
							}), (0, react_jsx_runtime.jsx)("span", {
								className: SettingsRoot_module_css_default.navLabel,
								children: row.label
							})]
						}, row.id))
					})
				}),
				(0, react_jsx_runtime.jsxs)("div", {
					className: SettingsRoot_module_css_default.header,
					children: [(0, react_jsx_runtime.jsx)("div", {
						className: SettingsRoot_module_css_default.actions,
						children: renderSlot("settings.action", {})
					}), (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: SettingsRoot_module_css_default.close,
						onClick: onClose,
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 14 }), (0, react_jsx_runtime.jsx)("span", {
							className: SettingsRoot_module_css_default.hiddenLabel,
							children: renderSlot("settings.close", {})
						})]
					})]
				}),
				(0, react_jsx_runtime.jsx)("div", {
					className: SettingsRoot_module_css_default.options,
					children: active !== void 0 && renderSlot("settings.section", { close: onClose }, { only: active })
				})
			]
		})]
	}), document.body);
}
/**
* Render the settings trigger and panel.
* @param props - composed slot props (contract/slots.ts).
* @returns the settings shell element tree.
*/
function SettingsRoot(props) {
	const { wide, reconnect, useConnectionState, useSections, useOnboardingSteps, useSessions, renderSlot, t, useDesktopUpdate, openDesktopUpdate, useStore, actions, useShortcuts } = props;
	const { open, activeId } = useStore((state) => state);
	const shortcut = useShortcuts((rows) => rows.find((row) => row.id === "settings.open"));
	const { close, openSection } = actions;
	const [requestedOnboarding, setRequestedOnboarding] = (0, react.useState)();
	const [completedOnboarding, setCompletedOnboarding] = (0, react.useState)(() => /* @__PURE__ */ new Set());
	const [showRecovery, setShowRecovery] = (0, react.useState)(false);
	const [holdConnecting, setHoldConnecting] = (0, react.useState)(false);
	const connectingShownAt = (0, react.useRef)(void 0);
	const rows = useSections((s) => s);
	const desktopUpdate = useDesktopUpdate((state) => state);
	const connectionState = useConnectionState((state) => state);
	const previousConnectionState = (0, react.useRef)(connectionState);
	const onboardingSteps = useOnboardingSteps((s) => s);
	const onboardingActive = useSessions((state) => {
		const main = Object.values(state.byId).find((session) => (session.retainedBy.mainView ?? 0) > 0);
		return state.phase === "ready" && (main === void 0 || main.blank);
	});
	const onboardingStep = requestedOnboarding !== void 0 ? onboardingSteps.find((step) => step.id === requestedOnboarding) : onboardingActive ? onboardingSteps.find((step) => !completedOnboarding.has(step.id)) : void 0;
	(0, react.useEffect)(() => {
		if (onboardingActive) return;
		setCompletedOnboarding(/* @__PURE__ */ new Set());
	}, [onboardingActive]);
	const onboardingStepSeen = (0, react.useRef)(onboardingStep);
	(0, react.useEffect)(() => {
		const appeared = onboardingStepSeen.current === void 0 && onboardingStep !== void 0;
		onboardingStepSeen.current = onboardingStep;
		if (appeared && open) close();
	}, [
		onboardingStep,
		open,
		close
	]);
	(0, react.useLayoutEffect)(() => {
		const previous = previousConnectionState.current;
		previousConnectionState.current = connectionState;
		if (connectionState !== "connected") {
			setShowRecovery(false);
			return;
		}
		if (previous !== "disconnected" && previous !== "connecting") return;
		setShowRecovery(true);
	}, [connectionState]);
	(0, react.useLayoutEffect)(() => {
		if (!showRecovery || holdConnecting) return;
		const timeout = window.setTimeout(() => {
			setShowRecovery(false);
		}, RECOVERY_CONFIRMATION_MS);
		return () => {
			window.clearTimeout(timeout);
		};
	}, [showRecovery, holdConnecting]);
	(0, react.useLayoutEffect)(() => {
		if (connectionState === "connecting") {
			connectingShownAt.current = Date.now();
			return;
		}
		const shownAt = connectingShownAt.current;
		if (shownAt === void 0) return;
		connectingShownAt.current = void 0;
		const remaining = CONNECTING_MIN_VISIBLE_MS - (Date.now() - shownAt);
		if (remaining <= 0) return;
		setHoldConnecting(true);
		const timeout = window.setTimeout(() => {
			setHoldConnecting(false);
		}, remaining);
		return () => {
			window.clearTimeout(timeout);
			setHoldConnecting(false);
		};
	}, [connectionState]);
	const completeOnboardingStep = (0, react.useCallback)((id) => {
		setRequestedOnboarding(void 0);
		setCompletedOnboarding((previous) => {
			if (previous.has(id)) return previous;
			return new Set([...previous, id]);
		});
	}, []);
	let connectionIndicator;
	if (connectionState === "connecting" || holdConnecting) connectionIndicator = "connecting";
	else if (connectionState === "disconnected") connectionIndicator = "disconnected";
	else if (showRecovery) connectionIndicator = "recovered";
	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		(0, react_jsx_runtime.jsxs)("div", {
			className: clsx(SettingsRoot_module_css_default.triggerRow, !wide && SettingsRoot_module_css_default.railRow),
			children: [
				renderSlot("settings.launcher", {
					wide,
					settingsOpen: open,
					openSettings: actions.open,
					...shortcut?.keys.length ? { settingsShortcut: {
						keys: shortcut.keys,
						aria: shortcut.aria
					} } : {},
					openOnboarding: (id) => {
						close();
						setRequestedOnboarding(id);
					}
				}, { fallback: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					disabled: open,
					label: t("trigger"),
					shortcutKeys: shortcut?.keys,
					children: (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: clsx(SettingsRoot_module_css_default.trigger, !wide && SettingsRoot_module_css_default.rail),
						"aria-label": t("trigger"),
						"aria-keyshortcuts": shortcut?.aria,
						"aria-haspopup": "dialog",
						"aria-expanded": open,
						onClick: () => {
							actions.open();
						},
						children: renderSlot("settings.trigger", { wide })
					})
				}) }),
				(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ConnectionIndicator, {
					state: wide && desktopUpdate.presentation?.phase !== "installing" ? connectionIndicator : void 0,
					disconnectedLabel: t("connection.error"),
					connectingLabel: t("connection.connecting"),
					recoveredLabel: t("connection.connected"),
					reconnectActionLabel: t("connection.reconnect"),
					restartActionLabel: t("connection.restart"),
					onReconnect: reconnect
				}),
				(0, react_jsx_runtime.jsx)(DesktopUpdateIndicator, {
					wide,
					hidden: connectionIndicator !== void 0 && desktopUpdate.presentation?.phase !== "installing",
					t,
					view: desktopUpdate,
					onOpen: openDesktopUpdate
				})
			]
		}),
		open && (0, react_jsx_runtime.jsx)(SettingsPanel, {
			rows,
			renderSlot,
			activeId,
			onSelect: actions.select,
			onClose: close
		}),
		onboardingStep !== void 0 && renderSlot("settings.onboarding", {
			stepId: onboardingStep.id,
			explicit: requestedOnboarding !== void 0,
			complete: () => {
				completeOnboardingStep(onboardingStep.id);
			},
			openSection
		}, { only: onboardingStep.id })
	] });
}
