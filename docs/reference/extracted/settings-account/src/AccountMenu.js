// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/AccountMenu.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Sidebar account launcher and locally authoritative sign-out action. */
/** The signed-in label stays empty while the profile loads.
* @param props - sidebar geometry, settings navigation and account operations.
* @returns account menu launcher.
*/
function AccountMenu({ subscribeSessionExpired, subscribeModelSignInRequired, wide, settingsShortcut, openSettings, openOnboarding, settingsOpen, useAccount, useTheme, signOut, hasRunningAccountTasks, refreshAccount, bonusNoticeShown, bonusNoticeDismissed, contactUs, showLogin, start, cancel, avatarFailed, t }) {
	const anchor = (0, react.useRef)(null);
	const settingsWasOpen = (0, react.useRef)(false);
	(0, react.useEffect)(() => {
		if (settingsOpen && !settingsWasOpen.current) refreshAccount();
		settingsWasOpen.current = settingsOpen;
	}, [refreshAccount, settingsOpen]);
	const account = useAccount((state) => state);
	const colorScheme = useTheme((snapshot) => snapshot.active.colorScheme);
	const signedIn = account.view?.status === "credential-stored";
	const [signInNotice, setSignInNotice] = (0, react.useState)(0);
	(0, react.useEffect)(() => subscribeModelSignInRequired?.(() => {
		setSignInNotice((value) => value + 1);
	}), [subscribeModelSignInRequired]);
	const [expiryNotice, setExpiryNotice] = (0, react.useState)(false);
	(0, react.useEffect)(() => subscribeSessionExpired?.(() => {
		setExpiryNotice(true);
	}), [subscribeSessionExpired]);
	const profile = account.details?.profile;
	const label = profile === void 0 ? null : profile.status === "ready" ? profile.value.name ?? profile.value.contact ?? t("signedIn") : t("signedIn");
	const [open, setOpen] = (0, react.useState)(false);
	const trigger = (0, react.useRef)(null);
	const [busy, setBusy] = (0, react.useState)(false);
	const [signOutImpact, setSignOutImpact] = (0, react.useState)();
	const requestSignOut = async () => {
		setBusy(true);
		try {
			setSignOutImpact(await hasRunningAccountTasks());
			setOpen(false);
		} catch (_error) {
			setSignOutImpact("unknown");
			setOpen(false);
		} finally {
			setBusy(false);
		}
	};
	const beginSignIn = () => {
		setOpen(false);
		start().catch(() => void 0);
	};
	return (0, react_jsx_runtime.jsxs)("div", {
		ref: anchor,
		className: AccountMenu_module_css_default.root,
		"data-inset": signedIn && wide,
		children: [
			signInNotice > 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
				text: t("modelSignInRequired"),
				onDone: () => {
					setSignInNotice(0);
				}
			}, signInNotice),
			expiryNotice && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
				text: t("sessionExpired"),
				onDone: () => {
					setExpiryNotice(false);
				}
			}),
			signedIn && !account.desktopOnboardingVisible && !account.onboarding && account.notices && (0, react_jsx_runtime.jsx)(AccountNoticeStack, {
				notices: account.notices,
				anchor,
				title: t("bonusNoticeTitle"),
				closeLabel: t("close"),
				onShown: bonusNoticeShown,
				onDismiss: bonusNoticeDismissed
			}),
			(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
				open,
				side: "top",
				portal: true,
				autoFocus: true,
				className: AccountMenu_module_css_default.anchor,
				listClassName: signedIn ? void 0 : AccountMenu_module_css_default.signedOutMenu,
				anchor: (0, react_jsx_runtime.jsxs)("button", {
					ref: trigger,
					type: "button",
					className: AccountMenu_module_css_default.trigger,
					"data-collapsed": !wide,
					"data-signed-out": !signedIn,
					"aria-label": t("menu"),
					"aria-haspopup": "menu",
					"aria-expanded": open,
					onClick: () => {
						setOpen((value) => !value);
					},
					children: [signedIn ? (0, react_jsx_runtime.jsx)("span", {
						className: AccountMenu_module_css_default.avatar,
						"data-avatar-status": account.avatar?.status,
						children: (0, react_jsx_runtime.jsx)(AccountAvatar, {
							avatar: account.avatar,
							avatarFailed
						})
					}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEllipsisOutlineMedium, { size: 14 }), wide && (0, react_jsx_runtime.jsx)("span", {
						className: AccountMenu_module_css_default.label,
						children: signedIn ? label : t("more")
					})]
				}),
				items: [
					{
						id: "settings",
						label: t("settings"),
						icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSettingsOutlineMedium, { size: 16 }),
						...settingsShortcut === void 0 ? {} : { shortcut: settingsShortcut }
					},
					{
						id: "contact",
						label: t("contactUs"),
						icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPaperPlaneOutlineMedium, { size: 16 })
					},
					...signedIn ? [{
						id: "signout",
						label: t("signOut"),
						icon: (0, react_jsx_runtime.jsx)(LogoutIcon, {}),
						disabled: busy
					}] : [{
						id: "signin",
						label: t("signIn"),
						icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconUserOutlineMedium, { size: 16 })
					}]
				],
				onClose: () => {
					setOpen(false);
				},
				onSelect: (id) => {
					if (id === "settings") {
						setOpen(false);
						trigger.current?.focus();
						openSettings();
					} else if (id === "contact") {
						setOpen(false);
						contactUs();
					} else if (id === "signin") beginSignIn();
					else requestSignOut();
				}
			}),
			account.loginVisible && !account.onboarding && (0, react_jsx_runtime.jsx)(SignInDialog, {
				account,
				colorScheme,
				start,
				cancel,
				t,
				close: () => {
					showLogin(false);
				},
				useApiKey: () => {
					showLogin(false);
					openOnboarding("deepseek-official");
				}
			}),
			signedIn && signOutImpact !== void 0 && (0, react_jsx_runtime.jsx)(SignOutDialog, {
				running: signOutImpact,
				signOut,
				close: () => {
					setSignOutImpact(void 0);
				},
				t
			})
		]
	});
}
