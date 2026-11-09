// Extracted from @deepseek-ai/dsh-client-ui-sidebar (lib/client.js); region lib/types/client/SidebarRoot.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Sidebar shell: column geometry and global panel navigation.
		* Collapse is a slide plus crossfade:
		* content freezes at its expanded width (inline style) and fades out in place
		* while the sliding column (AppFrame grid tracks) clips it — nothing reflows
		* mid-slide. At settle the wide-only content unmounts and the upper
		* controls enter the 56px rail from the same horizontal offset (one icon each,
		* same top-down order) on one fade that ends with the slide. The bottom-pinned
		* settings control only fades. The workspace/session browsing region between
		* global panel rows and the foot is the `sidebar.workspaces` registrant's,
		* and the foot holds `sidebar.settings` plus `sidebar.footer.action`; the shell
		* hands them the wide flag (plus an expand request callback for the browser).
		*
		* The column also owns whether the scroll regions nested in it draw a
		* scrollbar at all: the shell tracks the pointer and rebinds ui-theme's
		* scrollbar indirection away while it is elsewhere, so a list the user is not
		* pointing at carries no bar.
		*/
		/** Wide-content unmount delay; matches the 150ms wide-content fade-out. */
		const COLLAPSE_SETTLE_MS = 150;
		/**
		* How long the column's scrollbars stay drawn after the pointer leaves it.
		* The bar is a pointer affordance here, and hiding it on the leave event
		* itself makes it blink out while the pointer is only crossing the column's
		* edge — on the way to the conversation, or around a portalled menu.
		*/
		const SCROLLBAR_LINGER_MS = 2e3;
		/** Format complete-build metadata for the local brand badge. */
		function localBuildVersion() {
			return `0.2.2-rc.1-c59d10a` + ({}.DSH_CLIENT_GIT_DIRTY === "true" ? "-dirty" : "");
		}
		/** Analytics category of an official panel; other panels are never reported. */
		function officialEntry(id) {
			if (id === "plugins") return "plugin";
			return id === "schedules" ? "cron" : void 0;
		}
		/** Each panel row subscribes only to its own selection state. */
		function PanelRow({ id, label, wide, usePanelInfo, selectPanel, trackEntryClick, renderSlot }) {
			const active = usePanelInfo((info) => info.activePanelId === id);
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label,
				delayMs: 500,
				disabled: wide,
				children: (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: clsx(SidebarRoot_module_css_default.panelRow, active && SidebarRoot_module_css_default.panelActive),
					"aria-label": label,
					"aria-current": active ? "page" : void 0,
					onClick: () => {
						const entry = officialEntry(id);
						if (entry !== void 0) trackEntryClick({
							menu_name: entry,
							position: "sidebar"
						});
						selectPanel(id);
					},
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: SidebarRoot_module_css_default.panelGlyph,
						"aria-hidden": "true",
						children: renderSlot("sidebar.panellist", {
							size: wide ? 16 : 18,
							active
						}, { only: id })
					}), wide && (0, react_jsx_runtime.jsx)("span", {
						className: clsx(SidebarRoot_module_css_default.panelTitle, SidebarRoot_module_css_default.wide),
						children: label
					})]
				})
			});
		}
		/** The panel list's More launcher: a panel-row button whose menu rows come from `sidebar.panellist.actions`. */
		function PanelMoreMenu({ wide, label, entries, onOpen, onPinnedChange, trackEntryClick, renderSlot }) {
			const [open, setOpen] = (0, react.useState)(false);
			const onDismiss = () => {
				setOpen(false);
			};
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
				open,
				onClose: onDismiss,
				portal: true,
				autoFocus: true,
				className: SidebarRoot_module_css_default.moreAnchor,
				listClassName: SidebarRoot_module_css_default.moreMenu,
				anchor: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label,
					delayMs: 500,
					disabled: wide,
					children: (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: SidebarRoot_module_css_default.panelRow,
						"aria-label": label,
						"aria-haspopup": "menu",
						"aria-expanded": open,
						onClick: () => {
							trackEntryClick({
								menu_name: "more",
								position: "sidebar"
							});
							setOpen((value) => !value);
						},
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: SidebarRoot_module_css_default.panelGlyph,
							"aria-hidden": "true",
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconAppsAddOutlineRegular, { size: wide ? 16 : 18 })
						}), wide && (0, react_jsx_runtime.jsx)("span", {
							className: clsx(SidebarRoot_module_css_default.panelTitle, SidebarRoot_module_css_default.wide),
							children: label
						})]
					})
				}),
				children: renderSlot("sidebar.panellist.actions", {
					entries,
					onOpen,
					onPinnedChange,
					onDismiss
				})
			});
		}
		/**
		* Render the sidebar column shell.
		* @param props - composed slot props (runtime share + injected callbacks, contract/slots.ts).
		* @returns the sidebar element tree.
		*/
		function SidebarRoot({ collapsed, width, drawer, startSession, toggleSidebar, selectPanel, setPinned, trackEntryClick, useRemoteAccess, usePanels, useEntryPins, useEntryActions, useShortcuts, usePanelInfo, t, renderSlot }) {
			const panels = usePanels((snapshot) => snapshot);
			const unpinned = useEntryPins((ids) => ids);
			const activePanelId = usePanelInfo((info) => info.activePanelId);
			const hasEntryActions = useEntryActions((registered) => registered);
			const shortcut = useShortcuts((rows) => rows.find((row) => row.id === "sidebar.left.toggle"));
			const newShortcut = useShortcuts((rows) => rows.find((row) => row.id === "session.new"));
			const canStartSession = useRemoteAccess("session/create");
			const toggleLabel = collapsed ? t("toggle.open") : t("toggle.collapse");
			const [settled, setSettled] = (0, react.useState)(collapsed);
			(0, react.useEffect)(() => {
				if (drawer || !collapsed) {
					setSettled(collapsed);
					return;
				}
				const timer = window.setTimeout(() => {
					setSettled(true);
				}, COLLAPSE_SETTLE_MS);
				return () => {
					window.clearTimeout(timer);
				};
			}, [collapsed, drawer]);
			const windowsTitlebar = document.documentElement.hasAttribute("data-windows-titlebar");
			const wide = drawer || (windowsTitlebar ? !collapsed : !collapsed || !settled);
			const openNewSession = () => {
				trackEntryClick({
					menu_name: "new_session",
					position: windowsTitlebar && collapsed ? "titlebar" : "sidebar"
				});
				startSession();
			};
			const captionTooltipSide = windowsTitlebar ? "bottom" : "right";
			const lastWideWidth = (0, react.useRef)(width);
			if (drawer || !collapsed) lastWideWidth.current = width;
			const animateRail = (0, react.useRef)(!collapsed);
			if (drawer || !collapsed) animateRail.current = !collapsed;
			const column = (0, react.useRef)(null);
			const sidebarFocus = (0, react.useRef)(null);
			(0, _deepseek_ai_dsh_client_ui_primitives.useModalLayer)(column, drawer && !collapsed, toggleSidebar);
			(0, react.useLayoutEffect)(() => {
				if (!collapsed) return;
				const ownsMenuFocus = (sidebarFocus.current?.getAttribute("aria-controls")?.split(/\s+/) ?? []).some((id) => document.getElementById(id)?.contains(document.activeElement));
				if (sidebarFocus.current !== document.activeElement && !ownsMenuFocus) return;
				const opener = drawer ? column.current?.ownerDocument.querySelector("[data-sidebar-opener]") : column.current?.querySelector("[data-sidebar-toggle]");
				if (opener != null && !(0, _deepseek_ai_dsh_client_ui_primitives.isBehindModal)(opener)) (0, _deepseek_ai_dsh_client_ui_primitives.focusWithoutRing)(opener, { preventScroll: true });
			}, [drawer, collapsed]);
			const [pointerInside, setPointerInside] = (0, react.useState)(false);
			const lingerTimer = (0, react.useRef)(void 0);
			const armLinger = () => {
				if (lingerTimer.current !== void 0) return;
				lingerTimer.current = window.setTimeout(() => {
					lingerTimer.current = void 0;
					setPointerInside(false);
				}, SCROLLBAR_LINGER_MS);
			};
			const cancelLinger = () => {
				window.clearTimeout(lingerTimer.current);
				lingerTimer.current = void 0;
			};
			(0, react.useEffect)(() => {
				if (!pointerInside) return;
				const onMove = (event) => {
					const rect = column.current?.getBoundingClientRect();
					/* v8 ignore next -- the listener only exists while the column is mounted and revealed. */
					if (rect === void 0) return;
					if (event.clientX >= rect.left && event.clientX < rect.right && event.clientY >= rect.top && event.clientY < rect.bottom) cancelLinger();
					else armLinger();
				};
				document.addEventListener("pointermove", onMove);
				return () => {
					document.removeEventListener("pointermove", onMove);
					cancelLinger();
				};
			}, [pointerInside]);
			const buildVersion = localBuildVersion();
			const [copiedToast, setCopiedToast] = (0, react.useState)(null);
			const copyVersion = (version) => () => {
				(0, _deepseek_ai_dsh_client_ui_primitives.writeClipboard)(version).then((ok) => {
					if (ok) setCopiedToast((seq) => (seq ?? 0) + 1);
				});
			};
			const darwinDesktop = (0, _deepseek_ai_dsh_client_ui_primitives.isDarwinDesktop)();
			const toggle = (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: toggleLabel,
				shortcutKeys: shortcut?.keys,
				delayMs: 500,
				side: captionTooltipSide,
				portal: drawer,
				children: (0, react_jsx_runtime.jsxs)("button", {
					"data-sidebar-toggle": true,
					"data-modal-autofocus": drawer || void 0,
					type: "button",
					className: clsx(SidebarRoot_module_css_default.iconButton, SidebarRoot_module_css_default.toggle),
					"aria-label": toggleLabel,
					"aria-keyshortcuts": shortcut?.aria,
					onClick: () => {
						toggleSidebar();
					},
					children: [
						!wide && !windowsTitlebar && (0, react_jsx_runtime.jsx)("span", {
							className: SidebarRoot_module_css_default.railMark,
							"aria-hidden": "true",
							children: renderSlot("sidebar.brand.mark", { size: 24 }, { fallback: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FishLogo, { size: 24 }) })
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPanelLeftOutlineRegular, {
							className: SidebarRoot_module_css_default.panelIcon,
							size: wide || windowsTitlebar ? 16 : 18
						}),
						!wide && renderSlot("sidebar.toggle.badge", {})
					]
				})
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: column,
				onFocusCapture: (event) => {
					sidebarFocus.current = event.target;
				},
				role: drawer ? "dialog" : void 0,
				"data-shortcut-modal": drawer ? "sidebar" : void 0,
				"aria-modal": drawer && !collapsed ? true : void 0,
				"aria-label": drawer ? t("navigation.label") : void 0,
				tabIndex: drawer ? -1 : void 0,
				className: clsx(SidebarRoot_module_css_default.root, !wide && SidebarRoot_module_css_default.collapsed, !wide && animateRail.current && SidebarRoot_module_css_default.railIn, !drawer && collapsed && wide && SidebarRoot_module_css_default.fading, !pointerInside && SidebarRoot_module_css_default.quietBars),
				style: wide ? { width: !drawer && collapsed ? lastWideWidth.current : width } : void 0,
				onPointerEnter: () => {
					cancelLinger();
					setPointerInside(true);
				},
				onPointerLeave: () => {
					armLinger();
				},
				children: [
					darwinDesktop && (0, react_jsx_runtime.jsx)("div", {
						className: SidebarRoot_module_css_default.topStrip,
						"data-window-drag": true,
						children: toggle
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: SidebarRoot_module_css_default.logoRow,
						"data-window-drag": true,
						children: [wide && (() => {
							const identity = (0, react_jsx_runtime.jsxs)("span", {
								className: SidebarRoot_module_css_default.brandIdentity,
								"aria-hidden": "true",
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: SidebarRoot_module_css_default.brandMark,
									children: renderSlot("sidebar.brand.mark", { size: 24 }, { fallback: buildVersion === void 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FishLogo, { size: 24 }) : (0, react_jsx_runtime.jsx)("span", {
										className: SidebarRoot_module_css_default.copyVersion,
										"data-copy-version": true,
										onClick: copyVersion(buildVersion),
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FishLogo, { size: 24 })
									}) })
								}), (0, react_jsx_runtime.jsx)("span", {
									className: SidebarRoot_module_css_default.brandName,
									children: renderSlot("sidebar.brand.name", {}, { fallback: buildVersion === void 0 ? (0, react_jsx_runtime.jsx)("span", {
										className: SidebarRoot_module_css_default.fallbackBrandName,
										children: t("brand.localBuild")
									}) : (0, react_jsx_runtime.jsxs)("span", {
										className: clsx(SidebarRoot_module_css_default.localBuildBrand, SidebarRoot_module_css_default.copyVersion),
										"data-copy-version": true,
										onClick: copyVersion(buildVersion),
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: SidebarRoot_module_css_default.localBuildTitle,
											children: t("brand.localBuild")
										}), (0, react_jsx_runtime.jsx)("span", {
											className: SidebarRoot_module_css_default.buildVersion,
											children: buildVersion
										})]
									}) })
								})]
							});
							return darwinDesktop || !canStartSession ? (0, react_jsx_runtime.jsx)("span", {
								className: clsx(SidebarRoot_module_css_default.brand, SidebarRoot_module_css_default.wide),
								children: identity
							}) : (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: clsx(SidebarRoot_module_css_default.brand, SidebarRoot_module_css_default.wide),
								"aria-label": t("session.new.label"),
								"aria-keyshortcuts": newShortcut?.aria,
								onClick: (event) => {
									if (event.target.closest("[data-copy-version]") !== null) return;
									openNewSession();
								},
								children: identity
							});
						})(), !darwinDesktop && toggle]
					}),
					canStartSession && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
						label: t("session.new.label"),
						shortcutKeys: newShortcut?.keys,
						delayMs: 500,
						side: captionTooltipSide,
						disabled: wide,
						children: (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: SidebarRoot_module_css_default.newSession,
							"aria-label": t("session.new.label"),
							"aria-keyshortcuts": newShortcut?.aria,
							onClick: openNewSession,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: SidebarRoot_module_css_default.newSessionLabelMask,
								children: (0, react_jsx_runtime.jsxs)("span", {
									className: SidebarRoot_module_css_default.newSessionContent,
									children: [wide ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconNewChatOutlineMedium, { size: 14 }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconNewChatOutlineRegular, { size: windowsTitlebar ? 16 : 18 }), wide && (0, react_jsx_runtime.jsx)("span", {
										className: clsx(SidebarRoot_module_css_default.newSessionLabel, SidebarRoot_module_css_default.wide),
										children: t("session.new")
									})]
								})
							}), wide && newShortcut !== void 0 && newShortcut.keys.length > 0 && (0, react_jsx_runtime.jsx)("span", {
								className: SidebarRoot_module_css_default.newSessionShortcut,
								"aria-hidden": "true",
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ShortcutKeys, { keys: newShortcut.keys })
							})]
						})
					}),
					panels.length > 0 && (0, react_jsx_runtime.jsxs)("nav", {
						className: SidebarRoot_module_css_default.panelList,
						"aria-label": t("panels.label"),
						children: [panels.filter(({ id }) => id === "plugins" || !unpinned.includes(id)).map(({ id, label }) => (0, react_jsx_runtime.jsx)(PanelRow, {
							id,
							label,
							wide,
							usePanelInfo,
							selectPanel,
							trackEntryClick,
							renderSlot
						}, id)), hasEntryActions && (0, react_jsx_runtime.jsx)(PanelMoreMenu, {
							wide,
							label: t("panels.more"),
							entries: panels.filter(({ id }) => id !== "plugins").map(({ id, label }) => ({
								id,
								label,
								pinned: !unpinned.includes(id),
								active: id === activePanelId
							})),
							onOpen: (id) => {
								const entry = officialEntry(id);
								if (entry !== void 0) trackEntryClick({
									menu_name: entry,
									position: "sidebar_more"
								});
								const panel = panels.find((candidate) => candidate.id === id);
								if (panel !== void 0) selectPanel(panel.id);
							},
							onPinnedChange: setPinned,
							trackEntryClick,
							renderSlot
						})]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: SidebarRoot_module_css_default.regionArea,
						children: renderSlot("sidebar.workspaces", {
							wide,
							expandSidebar: () => {
								if (collapsed) toggleSidebar();
							}
						})
					}),
					copiedToast !== null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
						tone: "success",
						text: t("version.copied"),
						onDone: () => {
							setCopiedToast(null);
						}
					}, copiedToast),
					(0, react_jsx_runtime.jsxs)("div", {
						className: SidebarRoot_module_css_default.footArea,
						children: [(0, react_jsx_runtime.jsx)("div", {
							className: SidebarRoot_module_css_default.footerActions,
							children: renderSlot("sidebar.footer.action", { wide })
						}), (0, react_jsx_runtime.jsx)("div", {
							className: SidebarRoot_module_css_default.settingsArea,
							children: renderSlot("sidebar.settings", { wide })
						})]
					})
				]
			});
		}
