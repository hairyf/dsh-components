// Extracted from @deepseek-ai/dsh-client-ui-sidebar-right (lib/client.js); region lib/types/client/shell/SidebarRight.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The Sidebar's seat in the frame, and the panel it draws.
		*
		* The frame owns the right column's geometry; this package owns one content
		* tree at the column width or spanning the viewport. A shown wide panel
		* retains its track in fullscreen, preserving the conversation width. Below
		* 768px fullscreen is derived from viewport width, without changing manual mode.
		*
		* Docked content stays mounted while collapsed, translated off the frame's right
		* edge, so opening and closing are one gesture in both presentations: a slide
		* from and to that edge. An item mounted by the opening, such as the first tab
		* of an empty column, starts at that edge, so it joins the slide. Normal
		* presentation moves the frame's tracks with the panel. A fullscreen opening
		* reserves its underlying track only after the panel covers the frame, without
		* animating those hidden columns.
		*
		* The panel has no header of its own: its two controls — presentation switch
		* and collapse — ride the docking kit's chrome seat at the end of the top-right
		* pane's tab strip, so the strip is the panel's whole top edge. The way back in
		* while collapsed is not here either: it is one button in the conversation
		* header (`ExpandButton.tsx`), because it exists only while this panel is
		* hidden. Floating panels remain in the same content tree; untransformed
		* ancestors let their fixed-position frames cross the column and conversation.
		*
		* Tab bodies do not live here. Each one is a registration under its type's kind,
		* dispatched through the keyed `sidebar.right.pane.tab` seat (and a live chip
		* title through `sidebar.right.pane.tab.title`), so a new tab type needs no edit
		* to this file. What a body receives beyond the record — navigation, lifetime
		* signal, actions — is read through the slot-owned useTabInfo hook. The Tab
		* domain follows each session's store commits, including sessions off screen.
		*/
		/** The guide tab one pane holds, if any: a pane holds at most one. */
		function guideIn(layout, paneId) {
			return (0, _deepseek_ai_dsh_client_ui_dockkit.findPaneContentTab)(layout, paneId, pageAddress(GUIDE_KIND), GUIDE_KIND);
		}
		/**
		* Build the kit's intent face for one session out of the store's actions.
		* @param sessionId - the session the seat draws; every action is bound to it.
		* @param actions - the seat's bound store actions.
		* @param openTab - the navigation face's `openTab`, which the strip's add control asks for a guide through.
		* @returns the intents the kit reports gestures to.
		*/
		function intentsFor(sessionId, actions, openTab, closeTab, splitPane) {
			return {
				focusTab: (tabId) => {
					actions.focusTab(sessionId, tabId);
				},
				focusPane: (paneId) => {
					actions.focusPane(sessionId, paneId);
				},
				splitPane: splitPane ?? ((paneId) => {
					actions.splitPane(sessionId, paneId);
				}),
				addTab: (paneId) => {
					openTab(GUIDE_KIND, {
						paneId,
						revealIfOpened: false
					});
				},
				closeTab: closeTab ?? ((tabId) => {
					actions.closeTab(sessionId, tabId);
				}),
				duplicateTab: (tabId) => {
					actions.duplicateTab(sessionId, tabId);
				},
				floatTab: (tabId, rect) => {
					actions.floatTab(sessionId, tabId, rect);
				},
				unfloatPane: (paneId) => {
					actions.unfloatPane(sessionId, paneId);
				},
				placeTab: (tabId, toPaneId, index) => {
					actions.placeTab(sessionId, tabId, toPaneId, index);
				},
				dropTab: (tabId, paneId, zone) => {
					actions.dropTab(sessionId, tabId, paneId, zone);
				},
				moveFloat: (paneId, x, y) => {
					actions.moveFloat(sessionId, paneId, x, y);
				},
				resizeFloat: (paneId, rect) => {
					actions.resizeFloat(sessionId, paneId, rect);
				},
				resizeSplit: (splitId, sizes) => {
					actions.resizeSplit(sessionId, splitId, sizes);
				}
			};
		}
		/**
		* Dispatch one tab's body or title with stable framework hooks and record lifetime.
		*/
		function TabSlot({ renderSlot, occurrence, useTabTypes, useTabNavigation, useStore, fullscreen, shortcuts, active, retainTab, tab, seat, fallback }) {
			const { id, signal, tabActions } = occurrence(tab);
			const definition = useTabTypes((types) => types.find((definition) => definition.kind === tab.kind));
			const retained = seat === "sidebar.right.pane.tab" && definition?.keepMounted === true;
			(0, react.useLayoutEffect)(() => retained ? retainTab(tab.id, signal) : void 0, [
				retained,
				retainTab,
				tab.id,
				signal
			]);
			const hookContext = (0, react.useMemo)(() => ({
				tabId: tab.id,
				shortcuts,
				title: seat === "sidebar.right.pane.tab.title",
				fullscreen,
				active,
				signal,
				actions: tabActions,
				useStore,
				useTabNavigation
			}), [
				tab.id,
				seat,
				fullscreen,
				active,
				signal,
				tabActions,
				useStore,
				useTabNavigation,
				shortcuts
			]);
			const content = renderSlot(seat, {}, {
				entryKey: definition?.id ?? tab.kind,
				fallback,
				hookContext
			});
			return seat === "sidebar.right.pane.tab.title" ? (0, react_jsx_runtime.jsx)("span", {
				className: SidebarRight_module_css_default.tabTitle,
				"data-sidebar-right-tab": tab.id,
				"data-sidebar-right-occurrence": id,
				children: content
			}, id) : (0, react_jsx_runtime.jsx)("div", {
				className: SidebarRight_module_css_default.tabBody,
				"data-sidebar-right-tab": tab.id,
				"data-sidebar-right-occurrence": id,
				children: content
			}, id);
		}
		/**
		* Dispatch a tab's body to its registered type.
		*
		* A kind with no registrant is a real state, not a defect: a session log can
		* carry a tab whose type shipped in a plugin that is no longer mounted. Saying so
		* is better than an empty pane.
		*/
		function bodiesFor(panel) {
			const { t, ...rest } = panel;
			return (tab) => (0, react_jsx_runtime.jsx)(TabSlot, {
				...rest,
				tab,
				seat: "sidebar.right.pane.tab",
				fallback: (0, react_jsx_runtime.jsx)("p", {
					className: SidebarRight_module_css_default.unavailable,
					"data-sidebar-right-unavailable": true,
					children: t("tab.unavailable")
				})
			}, tab.id);
		}
		/** Dispatch a tab's title to its registered type; without one the chip shows the title captured at open time. */
		function titlesFor(panel) {
			return (tab) => (0, react_jsx_runtime.jsx)(TabSlot, {
				...panel,
				tab,
				seat: "sidebar.right.pane.tab.title",
				fallback: tab.title
			}, tab.id);
		}
		/** Expand-to-viewport glyph from the shared product artwork. */
		function FullscreenGlyph() {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: "16",
				height: "16",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", {
					d: "M2.33203 10.4054V13.1681C2.33229 13.444 2.55605 13.6681 2.83203 13.6681H5.49512V14.6681H2.83203C2.00376 14.6681 1.33229 13.9963 1.33203 13.1681V10.4054H2.33203ZM14.6689 13.1681C14.6687 13.996 13.9968 14.6676 13.1689 14.6681H10.4951V13.6681H13.1689C13.4445 13.6676 13.6687 13.4437 13.6689 13.1681V10.4054H14.6689V13.1681ZM13.1689 1.33118C13.9969 1.33163 14.6688 2.00315 14.6689 2.83118V5.4054H13.6689V2.83118C13.6688 2.55544 13.4446 2.33162 13.1689 2.33118H10.4951V1.33118H13.1689ZM5.49512 2.33118H2.83203C2.55598 2.33118 2.33218 2.55516 2.33203 2.83118V5.4054H1.33203V2.83118C1.33218 2.00288 2.00369 1.33118 2.83203 1.33118H5.49512V2.33118Z",
					fill: "currentColor"
				})
			});
		}
		/** Restore-from-fullscreen glyph from the shared product artwork. */
		function ExitFullscreenGlyph() {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: "16",
				height: "16",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: [(0, react_jsx_runtime.jsx)("path", {
					d: "M9 2.5V6C9 6.26522 9.10536 6.51957 9.29289 6.70711C9.48043 6.89464 9.73478 7 10 7H13.5",
					stroke: "currentColor"
				}), (0, react_jsx_runtime.jsx)("path", {
					d: "M7 13.5V10C7 9.73478 6.89464 9.48043 6.70711 9.29289C6.51957 9.10536 6.26522 9 6 9H2.5",
					stroke: "currentColor"
				})]
			});
		}
		/** The panel's two controls, placed by the kit at the top-right pane's strip end. */
		function PanelChrome({ sessionId, fullscreen, actions, t, shortcuts, toggleFullscreen }) {
			const next = fullscreen ? "push" : "fullscreen";
			const modeLabel = fullscreen ? t("chrome.exitFullscreen") : t("chrome.toFullscreen");
			const mode = shortcuts.find((entry) => entry.id === "pane.fullscreen.toggle");
			const toggle = shortcuts.find((entry) => entry.id === "sidebar.right.toggle");
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: modeLabel,
				shortcutKeys: mode?.keys,
				side: "bottom",
				delayMs: 500,
				children: (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: SidebarRight_module_css_default.iconButton,
					"aria-label": modeLabel,
					"aria-keyshortcuts": mode?.aria,
					"data-sidebar-right-mode": next,
					onClick: toggleFullscreen,
					children: fullscreen ? (0, react_jsx_runtime.jsx)(ExitFullscreenGlyph, {}) : (0, react_jsx_runtime.jsx)(FullscreenGlyph, {})
				})
			}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: t("chrome.collapse"),
				shortcutKeys: toggle?.keys,
				side: "bottom",
				delayMs: 500,
				children: (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: SidebarRight_module_css_default.iconButton,
					"aria-label": t("chrome.collapseAria"),
					"aria-keyshortcuts": toggle?.aria,
					"data-sidebar-right-toggle": true,
					onClick: () => {
						actions.toggleExpanded(sessionId);
					},
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPanelLeftOutlineRegular, { className: SidebarRight_module_css_default.collapseGlyph })
				})
			})] });
		}
		/**
		* The panel: the docked surface with the two controls in its top-right strip,
		* anchored to the frame's right edge and slid off it while collapsed.
		*/
		function SidebarPanel(panel) {
			const { sessionId, surface, actions, t, openTab, width, reportRoom, fullscreen, panelRef } = panel;
			const { expanded } = surface.layout;
			const types = panel.useTabTypes((value) => value);
			const flash = panel.useFlash((value) => value);
			const played = (0, react.useRef)(flash?.serial);
			(0, react.useLayoutEffect)(() => {
				if (flash === void 0 || flash.serial === played.current) return void 0;
				played.current = flash.serial;
				return panel.active ? flashPane(panelRef.current, flash) : void 0;
			}, [
				flash,
				panel.active,
				panelRef
			]);
			const [opened, setOpened] = (0, react.useState)(expanded);
			const [opening, setOpening] = (0, react.useState)(false);
			if (opened !== expanded) {
				setOpened(expanded);
				setOpening(expanded && panel.active);
			} else if (opening && !panel.active) setOpening(false);
			return (0, react_jsx_runtime.jsx)("div", {
				ref: panelRef,
				className: SidebarRight_module_css_default.panel,
				style: {
					width: fullscreen ? "100vw" : width,
					"--dsh-sidebar-width": fullscreen ? "100vw" : `${width}px`
				},
				"data-sidebar-right-session": sessionId,
				"data-sidebar-right-panel": fullscreen ? "fullscreen" : "push",
				"data-sidebar-right-open": expanded || void 0,
				"data-sidebar-right-opening": opening || void 0,
				onTransitionEnd: opening ? () => {
					setOpening(false);
				} : void 0,
				"aria-hidden": !expanded && surface.layout.floats.length === 0 || void 0,
				children: (0, react_jsx_runtime.jsx)("div", {
					className: SidebarRight_module_css_default.panelBody,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_dockkit.DockLayout, {
						state: surface.layout,
						canSplit: (0, _deepseek_ai_dsh_client_ui_dockkit.canSplit)(surface.layout) && (0, _deepseek_ai_dsh_client_ui_dockkit.dockPaneIds)(surface.layout).length < 2,
						dropZones: "horizontal",
						minPaneFraction: .2,
						canAddTab: (paneId) => guideIn(surface.layout, paneId) === void 0,
						canCloseTab: (tabId) => canCloseTab(surface, tabId),
						intents: intentsFor(sessionId, actions, openTab, panel.closeTab, panel.splitPane),
						labels: dockLabels(t, panel.shortcuts.find((entry) => entry.id === "pane.split"), panel.shortcuts.find((entry) => entry.id === "page.close")),
						renderTab: bodiesFor(panel),
						renderTabTitle: titlesFor(panel),
						active: panel.active,
						keepMounted: (tab) => types.find((type) => type.kind === tab.kind)?.keepMounted === true,
						getTabTriggerProps: panel.getTabTriggerProps,
						tabMenuOpen: panel.tabMenuOpen,
						chrome: (0, react_jsx_runtime.jsx)(PanelChrome, {
							sessionId,
							fullscreen,
							actions,
							t,
							shortcuts: panel.shortcuts,
							toggleFullscreen: panel.toggleFullscreen
						}),
						onRoom: reportRoom
					})
				})
			});
		}
		/**
		* The right column's occupant: stable tab containers, docked or floating.
		* It is also where the frame learns the panel's presentation, because this is
		* the seat that knows it. `ctx.sidebarRight` names the on-screen Session
		* itself; this seat reports only what it renders with: the room its kit
		* measured and the automatic fullscreen rule of its frame width.
		*/
		function RightbarSeat({ sessionId, width, viewportWidth, canShow, useStore, actions, t, renderSlot, syncPresentation, measureRoom, reportAutoFullscreen, openTab, closeTab, useContextMenu, useContextMenuTarget, useTabTypes, useTabNavigation, occurrence, retainTab, active, useShortcuts, splitPane, toggleFullscreen, useFlash }) {
			const { getTriggerProps } = useContextMenu();
			const getTabTriggerProps = (tab, paneId, handlers) => getTriggerProps({
				kind: "tab",
				value: {
					sessionId,
					tab,
					paneId
				}
			}, handlers);
			const tabMenuOpen = useContextMenuTarget((target) => target?.kind === "tab" && target.value.sessionId === sessionId);
			const shortcuts = useShortcuts((entries) => entries);
			const surface = useStore((state) => state.bySession[sessionId]);
			const shown = active && surface !== void 0 && surface.layout.expanded;
			const autoFullscreen = viewportWidth < 768;
			const fullscreen = autoFullscreen || surface?.layout.mode === "fullscreen";
			const panelRef = (0, react.useRef)(null);
			const reportRoom = (0, react.useCallback)((fits) => {
				measureRoom((paneId) => fits.get(paneId)?.row !== false);
			}, [measureRoom]);
			const track = shown && !autoFullscreen;
			(0, react.useEffect)(() => {
				if (active && surface === void 0) actions.open(sessionId);
			}, [
				actions,
				sessionId,
				surface,
				active
			]);
			(0, react.useLayoutEffect)(() => {
				if (shown && !fullscreen && !canShow) actions.setExpanded(sessionId, false);
			}, [
				actions,
				sessionId,
				shown,
				fullscreen,
				canShow
			]);
			(0, react.useLayoutEffect)(() => {
				reportAutoFullscreen(autoFullscreen);
			}, [reportAutoFullscreen, autoFullscreen]);
			(0, react.useLayoutEffect)(() => {
				if (!active) return;
				let disposed = false;
				const reportWhenCovered = () => {
					if (disposed) return;
					const entering = shown && fullscreen ? panelRef.current.getAnimations({ subtree: true }).filter((animation) => "transitionProperty" in animation && animation.transitionProperty === "transform" && animation.playState !== "finished" && animation.playState !== "idle") : [];
					if (entering.length === 0) {
						syncPresentation({
							shown,
							track,
							fullscreen
						});
						return;
					}
					Promise.allSettled(entering.map((animation) => animation.finished)).then(reportWhenCovered);
				};
				reportWhenCovered();
				return () => {
					disposed = true;
				};
			}, [
				sessionId,
				shown,
				track,
				fullscreen,
				syncPresentation,
				active
			]);
			(0, react.useLayoutEffect)(() => active ? () => {
				syncPresentation({
					shown: false,
					track: false,
					fullscreen: false
				});
			} : void 0, [syncPresentation, active]);
			if (surface === void 0) return null;
			return (0, react_jsx_runtime.jsx)(SidebarPanel, {
				sessionId,
				actions,
				t,
				renderSlot,
				surface,
				openTab,
				closeTab,
				getTabTriggerProps,
				tabMenuOpen,
				useTabTypes,
				useTabNavigation,
				useStore,
				useFlash,
				occurrence,
				fullscreen,
				autoFullscreen,
				reportRoom,
				active,
				retainTab,
				shortcuts,
				splitPane,
				toggleFullscreen,
				width,
				panelRef
			});
		}
