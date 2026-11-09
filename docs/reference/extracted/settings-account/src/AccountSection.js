// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/AccountSection.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Account settings renders safe Host state and explicit login actions. */
		/** @param props - localized actions, account subscription, and the shared Platform page channel. @returns account settings UI. */
		function AccountSection({ t, useAccount, useTheme, start, cancel, openPlatformPage, avatarFailed }) {
			const { view: state, details, avatar, failed: streamFailed } = useAccount((value) => value);
			const colorScheme = useTheme((snapshot) => snapshot.active.colorScheme);
			const releasePage = (0, react.useRef)(void 0);
			const [failed, setFailed] = (0, react.useState)(false);
			const [busy, setBusy] = (0, react.useState)(false);
			const profile = details?.profile?.status === "ready" ? details.profile.value : void 0;
			const wallets = details?.balance?.status === "ready" ? details.balance.value : void 0;
			const bonusWallets = details?.balance?.status === "ready" ? details.balance.bonusWallets.filter((wallet) => new Big(wallet.balance).gt(0)) : [];
			const showBonusRow = details?.balance?.status !== "ready" || bonusWallets.length > 0;
			const attempt = state?.attempt;
			const active = attempt !== null && attempt !== void 0 && [
				"initializing",
				"waiting-browser",
				"exchanging",
				"committing"
			].includes(attempt.phase);
			const signedIn = state?.status === "credential-stored";
			(0, react.useEffect)(() => () => {
				releasePage.current?.();
				releasePage.current = void 0;
			}, []);
			(0, react.useEffect)(() => {
				if (signedIn) return;
				releasePage.current?.();
				releasePage.current = void 0;
			}, [signedIn]);
			const showPage = (open, page) => {
				releasePage.current?.();
				releasePage.current = open(page, () => {
					releasePage.current = void 0;
				});
			};
			const run = async (action) => {
				setBusy(true);
				setFailed(false);
				try {
					await action();
				} catch {
					setFailed(true);
				} finally {
					setBusy(false);
				}
			};
			/**
			* @param event - click on a Platform destination link.
			* @returns nothing; on Desktop the embedded page replaces the pending navigation.
			*/
			const openUsage = (event) => {
				if (openPlatformPage !== void 0 && signedIn) {
					event.preventDefault();
					showPage(openPlatformPage, "usage");
				}
			};
			/**
			* The Platform entry the balance rows share with the Usage action: an embedded page on
			* Desktop, a new tab elsewhere. A wallet read that failed still reaches the same
			* destination, so the user can inspect the balance the Harness could not load; the
			* destination comes from the account links, not from the wallet response.
			* @param label - localized link copy.
			* @param className - link treatment for the row that renders it, absent when the sheet has no such rule.
			* @returns the Platform anchor.
			*/
			const platformLink = (label, className) => (0, react_jsx_runtime.jsx)("a", {
				className,
				href: state?.links.usageUrl,
				"aria-disabled": state === void 0,
				target: "_blank",
				rel: "noreferrer",
				onClick: openUsage,
				children: label
			});
			const status = failed || streamFailed || attempt?.phase === "failed" ? t("failed") : attempt?.phase === "expired" ? t("expired") : active ? t(attempt.phase === "initializing" ? "initializing" : attempt.phase === "waiting-browser" ? "waiting" : "completing") : signedIn ? profile?.contact ?? t(details?.profile === void 0 ? "loading" : "profileUnavailable") : t("signInDescription");
			if (!signedIn && !active) return (0, react_jsx_runtime.jsx)("section", {
				className: AccountSection_module_css_default.signedOut,
				"aria-label": t("nav"),
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: AccountSection_module_css_default.signedOutContent,
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: AccountSection_module_css_default.signedOutCopy,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: AccountSection_module_css_default.signedOutTitle,
							children: t("settingsSignedOutTitle")
						}), (0, react_jsx_runtime.jsx)("span", {
							className: AccountSection_module_css_default.signedOutDescription,
							role: "status",
							children: failed || streamFailed ? t("failed") : t("settingsSignedOutDescription")
						})]
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						className: AccountSection_module_css_default.signInButton,
						disabled: busy || state === void 0,
						onClick: () => {
							run(start);
						},
						children: t("signIn")
					})]
				})
			});
			return (0, react_jsx_runtime.jsxs)("section", {
				className: AccountSection_module_css_default.section,
				"aria-label": t("nav"),
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: AccountSection_module_css_default.card,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: AccountSection_module_css_default.identity,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: AccountSection_module_css_default.avatar,
								"data-avatar-status": signedIn ? avatar?.status : void 0,
								children: (0, react_jsx_runtime.jsx)(AccountAvatar, {
									avatar: signedIn ? avatar : void 0,
									avatarFailed
								})
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: AccountSection_module_css_default.identityCopy,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: AccountSection_module_css_default.name,
									children: signedIn ? profile?.name ?? t("signedIn") : t("signedOut")
								}), (0, react_jsx_runtime.jsx)("span", {
									className: AccountSection_module_css_default.status,
									role: "status",
									children: status
								})]
							})]
						}), signedIn && (0, react_jsx_runtime.jsxs)("a", {
							className: AccountSection_module_css_default.accountInfo,
							href: new URL("/", state.links.usageUrl).href,
							target: "_blank",
							rel: "noopener noreferrer",
							children: [t("accountInfo"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRightUpOutlineRegular, { size: 12 })]
						})]
					}),
					active && (0, react_jsx_runtime.jsxs)("div", {
						className: AccountSection_module_css_default.actions,
						children: [attempt.authorizeUrl && (0, react_jsx_runtime.jsx)("a", {
							className: AccountSection_module_css_default.linkButton,
							href: authorizeUrlWithTheme(attempt.authorizeUrl, colorScheme),
							target: "_blank",
							rel: "noreferrer",
							children: t("open")
						}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							disabled: busy || attempt.phase === "committing",
							onClick: () => {
								run(() => cancel(attempt.id));
							},
							children: t("cancel")
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: AccountSection_module_css_default.balanceCard,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: AccountSection_module_css_default.row,
								children: [(0, react_jsx_runtime.jsx)("span", { children: t("balance") }), signedIn && wallets !== void 0 && wallets.length > 0 ? (0, react_jsx_runtime.jsx)("span", {
									className: AccountSection_module_css_default.amount,
									children: wallets.map((wallet) => (0, react_jsx_runtime.jsx)("span", { children: formatBalance(wallet.balance, wallet.currency === "CNY" ? "¥" : "$") }, wallet.currency))
								}) : !signedIn || details?.balance === void 0 ? (0, react_jsx_runtime.jsx)("span", {
									className: AccountSection_module_css_default.unavailable,
									children: t(!signedIn ? "balanceSignedOut" : "loading")
								}) : platformLink(t("balanceUnavailable"), AccountSection_module_css_default.unavailableLink)]
							}),
							signedIn && showBonusRow && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("div", { className: AccountSection_module_css_default.divider }), (0, react_jsx_runtime.jsxs)("div", {
								className: AccountSection_module_css_default.row,
								children: [(0, react_jsx_runtime.jsx)("span", { children: t("bonusBalance") }), (0, react_jsx_runtime.jsx)("span", {
									className: AccountSection_module_css_default.bonusValue,
									children: bonusWallets.length > 0 ? (0, react_jsx_runtime.jsx)("span", {
										className: AccountSection_module_css_default.amount,
										children: bonusWallets.map((wallet) => (0, react_jsx_runtime.jsx)("span", { children: formatBalance(wallet.balance, wallet.currency === "CNY" ? "¥" : "$") }, wallet.currency))
									}) : details?.balance === void 0 ? (0, react_jsx_runtime.jsx)("span", {
										className: AccountSection_module_css_default.unavailable,
										children: t("loading")
									}) : platformLink(t("balanceUnavailable"), AccountSection_module_css_default.unavailableLink)
								})]
							})] }),
							(0, react_jsx_runtime.jsx)("div", { className: AccountSection_module_css_default.divider }),
							(0, react_jsx_runtime.jsxs)("div", {
								className: AccountSection_module_css_default.row,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: AccountSection_module_css_default.secondary,
									children: t("more")
								}), (0, react_jsx_runtime.jsxs)("div", {
									className: AccountSection_module_css_default.links,
									children: [platformLink(t("usage"), AccountSection_module_css_default.linkButton), (0, react_jsx_runtime.jsx)("a", {
										className: `${AccountSection_module_css_default.linkButton} ${AccountSection_module_css_default.primary}`,
										href: state?.links.topUpUrl,
										"aria-disabled": state === void 0,
										target: "_blank",
										rel: "noreferrer",
										onClick: (event) => {
											if (openPlatformPage !== void 0 && signedIn) {
												event.preventDefault();
												showPage(openPlatformPage, "top-up");
											}
										},
										children: t("topUp")
									})]
								})]
							})
						]
					})
				]
			});
		}
