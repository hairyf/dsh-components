// Extracted from @deepseek-ai/dsh-client-ui-sidebar-right (lib/client.js); region lib/types/client/service.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* `ctx.sidebarRight`: what other plugins may ask of this column.
		*
		* The surface is per session and its state lives in that session's store
		* instance, which the slot runtime mints per session and a root service cannot
		* reach on its own. The plugin adopts each session's store instance as the
		* runtime mints it, so the controller reaches any session's store by id and
		* syncs the Tab domain from that store's commits, on screen or not.
		*
		* The plugin also names the Session on screen — the selected Session while the
		* Conversation fills the main column — from the selection and the main panel,
		* before React renders either change, and publishes it as `mounted`. Every
		* command on the public face acts on that Session through its adopted store; a
		* command with no Session on screen, or with one whose store the runtime has not
		* minted, has nothing to act on and fails loudly rather than writing into a
		* surface nobody is drawing. The seats never publish which Session they draw:
		* they report only what they render with, the room their docking kit measured
		* and the automatic fullscreen rule of their frame width.
		*
		* A tab's own actions (`tabActions`) aim at the session the tab is in, not at
		* the on-screen one: they run through that session's adopted store, so a callback
		* fired after the user switched sessions still lands where its tab is, and they
		* do nothing for a session whose store was never minted.
		*
		* `openResource` and `openTab` are the navigation controller, and every way
		* into the column is a call to one of them: the conversation's file links, a
		* tool row's line reference, the strip's add control, a guide entry box, a file
		* tree's rows. A resource is claimed through the registry by address; a page is
		* named by kind and recorded at the address this package composes for it. Both
		* hand the store one settled intent and record the navigation in the Tab
		* domain. Placement is the caller's option, never a type's property.
		*
		* The registration adopts Session stores, names the on-screen Session, and
		* forwards the seats' reports; callers use the service's navigation methods.
		*/
		/**
		* Create the public controller and the plugin-private Session callbacks.
		* Adoption reconciles restored records before any seat renders, then follows commits.
		* @param tabs - registered tab types.
		* @param pin - resource retention for an occurrence's lifetime.
		* @param host - the viewport rule and focus continuity the commands use.
		* @returns the controller; store adoption and scope removal; naming the on-screen Session; and recording a seat's room rule.
		*/
		function createSidebarRightController(tabs, pin, host) {
			const adopted = /* @__PURE__ */ new Map();
			const rooms = /* @__PURE__ */ new Map();
			const onScreen = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(void 0);
			const inventory = new SidebarTabInventory();
			const flashes = /* @__PURE__ */ new Map();
			const controller = new SidebarRightController(tabs, pin, host, {
				adopted,
				rooms,
				onScreen,
				openTabs: inventory.source,
				flashes
			});
			return {
				controller,
				forget: (sessionId) => {
					inventory.remove(sessionId);
					rooms.delete(sessionId);
					flashes.delete(sessionId);
				},
				show: (sessionId) => {
					if (onScreen.getSnapshot() !== sessionId) onScreen.set(sessionId);
				},
				measure: (sessionId, canSplitPane) => {
					rooms.set(sessionId, canSplitPane);
				},
				adopt(sessionId, store) {
					adopted.get(sessionId)?.unsubscribe();
					const sync = () => {
						const surface = store.getSnapshot().bySession[sessionId];
						inventory.update(sessionId, Object.values(surface?.layout.tabs ?? {}));
						if (surface !== void 0) controller.tabDomain.sync(sessionId, surface.layout);
					};
					const adoption = {
						store,
						unsubscribe: store.subscribe(sync)
					};
					adopted.set(sessionId, adoption);
					sync();
					return () => {
						adoption.unsubscribe();
						if (adopted.get(sessionId) === adoption) adopted.delete(sessionId);
					};
				}
			};
		}
		/** The scheme every resource address carries; anything else is not a resource this face opens. */
		const RESOURCE_SCHEME = "dsh-resource://";
		/** Cross-plugin right-Sidebar face (ctx.sidebarRight). */
		var SidebarRightController = class {
			tabs;
			host;
			/** Open tab metadata across saved and adopted Sessions, independent of visible seats. */
			openTabs;
			/** The on-screen Session; see {@link ISidebarRight.mounted}. */
			mounted;
			adopted;
			rooms;
			closeHandlers = /* @__PURE__ */ new Map();
			flashes;
			/**
			* Register resource cleanup before explicit removal. Failure preserves the tab.
			* @param kind - tab kind owned by the registering plugin.
			* @param handler - saves any background cleanup before returning and allowing removal.
			* @returns an effect-scoped unregister callback.
			*/
			registerCloseHandler(kind, handler) {
				if (this.closeHandlers.has(kind)) throw new Error(`sidebarRight: close handler already registered for ${kind}`);
				this.closeHandlers.set(kind, handler);
				return () => {
					if (this.closeHandlers.get(kind) === handler) this.closeHandlers.delete(kind);
				};
			}
			/**
			* The Tab domain this controller navigates into; synced from each adopted
			* store's commits, read by the seat for each body's owner share.
			*/
			tabDomain;
			/**
			* @param tabs - the tab-type registry consulted to claim an address.
			* @param pin - `ctx.resources.pin`, which the Tab domain holds addresses with.
			* @param host - the viewport rule and focus continuity the commands use.
			* @param sessions - plugin-owned adopted stores, room rules, on-screen Session, and open tab metadata.
			*/
			constructor(tabs, pin, host, sessions) {
				this.tabs = tabs;
				this.host = host;
				this.adopted = sessions.adopted;
				this.rooms = sessions.rooms;
				this.mounted = sessions.onScreen;
				this.openTabs = sessions.openTabs;
				this.flashes = sessions.flashes;
				this.tabDomain = new TabDomain(this, pin);
			}
			/**
			* Read closeable tabs from the clicked pane.
			* @param sessionId - owning Session.
			* @param paneId - clicked pane.
			* @param tabId - anchor tab.
			* @returns closeable ids in display order, or empty sets after the anchor moves or closes.
			*/
			menuTabs(sessionId, paneId, tabId) {
				const surface = this.adopted.get(sessionId)?.store.getSnapshot().bySession[sessionId];
				const pane = surface?.layout.nodes[paneId];
				if (surface === void 0 || pane?.kind !== "pane" || !pane.tabs.includes(tabId)) return {
					all: [],
					right: [],
					close: false
				};
				const index = pane.tabs.indexOf(tabId);
				const closeable = (id) => canCloseTab(surface, id);
				return {
					close: closeable(tabId),
					all: pane.tabs.filter((id) => id !== tabId && closeable(id)),
					right: pane.tabs.slice(index + 1).filter(closeable)
				};
			}
			/**
			* Read the committed tabs of a Session so providers can restore their content.
			* @param sessionId - Session whose layout has been adopted.
			* @returns its open records, or an empty list before adoption.
			*/
			tabsIn(sessionId) {
				return Object.values(this.adopted.get(sessionId)?.store.getSnapshot().bySession[sessionId]?.layout.tabs ?? {});
			}
			/**
			* Open a resource: claim it, place it, reveal the column, record the navigation.
			* @param address - a `dsh-resource://<type>/…` address.
			* @param options - placement, the opening type, and navigation parameters.
			*/
			openResource(address, options = {}) {
				const { sessionId, actions } = this.require();
				this.placeResource(sessionId, actions, address, options);
			}
			/**
			* Open a page type by kind at the address this package records pages under.
			* @param kind - the page type's kind.
			* @param options - placement and that kind's navigation parameters.
			*/
			openTab(kind, options = {}) {
				const { sessionId, actions } = this.require();
				this.placeTab(sessionId, actions, kind, options);
			}
			/**
			* Open a resource in one session, for a tab's own action; nothing happens
			* for a session whose store was never adopted or whose adoption was released.
			* Not part of `ISidebarRight`: the Tab domain's path.
			* @param sessionId - the session the acting tab is in.
			* @param address - a `dsh-resource://<type>/…` address.
			* @param options - placement, the opening type, and navigation parameters.
			*/
			openResourceIn(sessionId, address, options = {}) {
				const actions = this.actionsFor(sessionId);
				if (actions !== void 0) this.placeResource(sessionId, actions, address, options);
			}
			/**
			* Open a page type in one session, for a tab's own action; nothing happens
			* for a session whose store was never adopted or whose adoption was released.
			* Not part of `ISidebarRight`: the Tab domain's path.
			* @param sessionId - the session the acting tab is in.
			* @param kind - the page type's kind.
			* @param options - placement and that kind's navigation parameters.
			*/
			openTabIn(sessionId, kind, options = {}) {
				const actions = this.actionsFor(sessionId);
				if (actions !== void 0) this.placeTab(sessionId, actions, kind, options);
			}
			/**
			* Close a tab of one session, preserving the sole docked guide; nothing happens
			* for a session whose store was never adopted or whose adoption was released.
			* Not part of `ISidebarRight`: the Tab domain's path.
			* @param sessionId - the session the tab is in.
			* @param tabId - the tab to close.
			*/
			closeIn(sessionId, tabId) {
				const actions = this.actionsFor(sessionId);
				const surface = this.adopted.get(sessionId)?.store.getSnapshot().bySession[sessionId];
				if (actions === void 0 || surface === void 0) return;
				const tab = surface.layout.tabs[tabId];
				if (tab === void 0 || !canCloseTab(surface, tabId)) return;
				this.removeAfterCleanup(sessionId, tab, () => {
					actions.closeTab(sessionId, tabId);
				});
			}
			removeAfterCleanup(sessionId, tab, commit) {
				this.closeHandlers.get(tab.kind)?.(sessionId, tab);
				commit();
			}
			/** Claim a resource and place it in one session; an address outside the scheme or one no type claims throws. */
			placeResource(sessionId, actions, address, options) {
				if (!address.startsWith(RESOURCE_SCHEME)) throw new Error(`sidebarRight: no registered tab type claims "${address}"`);
				const claim = this.tabs.claim(address, options.kind);
				if (options.destination === void 0) this.place(sessionId, actions, claim, address, options, options.params);
				else this.placeIn(sessionId, actions, claim, address, options.destination, options.params);
			}
			/** Settle a claimed resource in an explicit host: one store intent, no close handler, and a flash only for a reveal. */
			placeIn(sessionId, actions, claim, address, destination, params) {
				const layout = this.adopted.get(sessionId)?.store.getSnapshot().bySession[sessionId]?.layout;
				const revealed = layout === void 0 ? void 0 : findHostContentTab(layout, destination, claim.contentId, claim.kind);
				actions.openContent(sessionId, {
					kind: claim.kind,
					contentId: claim.contentId,
					title: claim.title,
					destination
				}, (tabId) => {
					this.tabDomain.navigate(sessionId, tabId, {
						address,
						params
					});
				});
				if (layout !== void 0 && revealed !== void 0) this.flashShowing(sessionId, layout, revealed);
			}
			/** Place a page type in one session at the address pages are recorded under; an unregistered kind throws. */
			placeTab(sessionId, actions, kind, options) {
				const definition = this.tabs.get(kind);
				if (definition === void 0) throw new Error(`sidebarRight: no tab type is registered as "${kind}"`);
				const address = definition.multiple === true ? `${pageAddress(kind)}/${randomUUID()}` : pageAddress(kind);
				this.place(sessionId, actions, {
					kind,
					contentId: address,
					title: definition.title(address)
				}, address, options, options.params);
			}
			/** The steps both opens share: one store intent, and the navigation record for the tab it settles on. */
			place(sessionId, actions, claim, address, placement, params) {
				const layout = (this.adopted.get(sessionId)?.store.getSnapshot().bySession[sessionId])?.layout;
				const replaced = placement.replaceTab === void 0 ? void 0 : layout?.tabs[placement.replaceTab];
				const targetPane = layout === void 0 ? void 0 : placement.paneId ?? (0, _deepseek_ai_dsh_client_ui_dockkit.activeDockPaneId)(layout);
				const target = targetPane === void 0 ? void 0 : layout?.nodes[targetPane];
				const preferNewPane = placement.preferNewPane === true && replaced === void 0 && layout !== void 0 && target?.kind === "pane" && target.host === "dock" && target.tabs.length > 0 && (0, _deepseek_ai_dsh_client_ui_dockkit.canSplit)(layout) && (0, _deepseek_ai_dsh_client_ui_dockkit.dockPaneIds)(layout).length < 2 && this.mounted.getSnapshot() === sessionId && this.canSplitPane(sessionId, target.id);
				const commit = () => {
					actions.openContent(sessionId, {
						kind: claim.kind,
						contentId: claim.contentId,
						title: claim.title,
						...placement.paneId === void 0 ? {} : { paneId: placement.paneId },
						...preferNewPane ? { preferNewPane: true } : {},
						...replaced === void 0 ? {} : { replaceTab: replaced.id },
						...placement.revealIfOpened === void 0 ? {} : { revealIfOpened: placement.revealIfOpened }
					}, (tabId) => {
						this.tabDomain.navigate(sessionId, tabId, {
							address,
							params
						});
					});
				};
				const pagePane = layout === void 0 ? void 0 : replaced === void 0 ? targetPane : (0, _deepseek_ai_dsh_client_ui_dockkit.findTabPane)(layout, replaced.id).id;
				const revealed = layout === void 0 || pagePane === void 0 ? void 0 : claim.contentId === pageAddress(claim.kind) ? (0, _deepseek_ai_dsh_client_ui_dockkit.findPaneContentTab)(layout, pagePane, claim.contentId, claim.kind) : placement.revealIfOpened === false ? void 0 : (0, _deepseek_ai_dsh_client_ui_dockkit.findContentTab)(layout, claim.contentId, claim.kind);
				if (replaced === void 0 || revealed !== void 0) commit();
				else this.removeAfterCleanup(sessionId, replaced, commit);
				if (layout !== void 0 && revealed !== void 0) this.flashShowing(sessionId, layout, revealed);
			}
			/**
			* The flash requests of one Session's seat: each open that reveals an
			* existing tab names the pane holding it, with a serial that changes on
			* every request.
			* @param sessionId - the Session whose seat draws the highlight.
			* @returns the Session's stable source.
			*/
			flashOf(sessionId) {
				return this.flashSource(sessionId);
			}
			flashSource(sessionId) {
				let source = this.flashes.get(sessionId);
				if (source === void 0) {
					source = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(void 0);
					this.flashes.set(sessionId, source);
				}
				return source;
			}
			/**
			* Flash the pane holding a revealed tab only when that tab was already on screen; a reveal that switches
			* tabs or expands the column is its own visible change.
			*/
			flashShowing(sessionId, layout, tabId) {
				const pane = (0, _deepseek_ai_dsh_client_ui_dockkit.findTabPane)(layout, tabId);
				if (pane.activeTabId === tabId && (pane.host === "float" || layout.expanded)) this.flash(sessionId, pane.id);
			}
			/** Ask a Session's seat to highlight the pane holding a revealed tab. */
			flash(sessionId, paneId) {
				const source = this.flashSource(sessionId);
				source.set({
					paneId,
					serial: (source.getSnapshot()?.serial ?? 0) + 1
				});
			}
			/**
			* Close one tab of the on-screen Session; the sole docked guide remains open.
			* @param tabId - the tab to close.
			*/
			close(tabId) {
				this.closeIn(this.require().sessionId, tabId);
			}
			/**
			* Hide a tab: close its floating occurrence, or collapse its docked column.
			* @param tabId - the tab to hide; missing tabs are unchanged.
			*/
			hide(tabId) {
				const layout = this.mountedSurface()?.layout;
				if (layout?.tabs[tabId] === void 0) return;
				if ((0, _deepseek_ai_dsh_client_ui_dockkit.findTabPane)(layout, tabId).host === "float") this.close(tabId);
				else if (layout.expanded) this.toggleExpanded();
			}
			/**
			* The active tab of the active pane.
			* @returns the record, or `undefined` without an on-screen surface.
			*/
			active() {
				const layout = this.mountedSurface()?.layout;
				if (layout === void 0) return void 0;
				const { activeTabId } = (0, _deepseek_ai_dsh_client_ui_dockkit.getPane)(layout, layout.activePaneId);
				return Object.values(layout.tabs).find((tab) => tab.id === activeTabId);
			}
			/**
			* Whether the column is currently showing its panel.
			* @returns `true` while expanded; `false` while collapsed or without an on-screen surface.
			*/
			isExpanded() {
				return this.mountedSurface()?.layout.expanded ?? false;
			}
			/** Collapse the column, or expand it and focus its active dock pane after rendering. */
			toggleExpanded() {
				const { sessionId, actions } = this.require();
				this.host.openWithFocus(sessionId, () => {
					actions.toggleExpanded(sessionId);
					const layout = this.mountedSurface()?.layout;
					return layout?.expanded ? (0, _deepseek_ai_dsh_client_ui_dockkit.activeDockPaneId)(layout) : void 0;
				});
			}
			/**
			* Focus a tab and the pane holding it; a missing tab is left alone.
			* @param tabId - the tab to focus.
			*/
			focus(tabId) {
				const { sessionId, actions } = this.require();
				if (this.mountedSurface()?.layout.tabs[tabId] === void 0) return;
				actions.focusTab(sessionId, tabId);
			}
			/**
			* Capture the page owning current DOM focus; outside focus never uses layout history.
			* @param element - explicit input target, including an embedding iframe; defaults to live document focus.
			* @returns current focused page identity, or undefined outside a visible sidebar page.
			*/
			focusedTarget(element = document.activeElement) {
				const screen = this.screen();
				return screen === void 0 ? void 0 : sidebarTargetFromElement(element, screen.sessionId, screen.surface.layout, (tabId) => this.tabDomain.occurrence(screen.sessionId, { id: tabId }));
			}
			/**
			* Choose a focused sidebar pane, or the on-screen Session's active dock pane for an outside open.
			* @param element - live command input target; stale sidebar markup never falls back to another pane.
			* @returns captured target, or undefined without an on-screen surface.
			*/
			commandTarget(element = document.activeElement) {
				const focused = this.focusedTarget(element);
				if (focused !== void 0 || element?.closest("[data-sidebar-right-session]")) return focused;
				const screen = this.screen();
				if (screen === void 0) return void 0;
				const { sessionId, surface: { layout } } = screen;
				const pane = (0, _deepseek_ai_dsh_client_ui_dockkit.getPane)(layout, (0, _deepseek_ai_dsh_client_ui_dockkit.activeDockPaneId)(layout));
				const tabId = pane.activeTabId;
				const held = tabId === void 0 ? void 0 : this.tabDomain.occurrence(sessionId, { id: tabId });
				return {
					sessionId,
					paneId: pane.id,
					host: pane.host,
					tabId,
					occurrence: held,
					navigationRevision: held?.navigation.getSnapshot().revision
				};
			}
			/**
			* Open from a captured pane using the guide's replacement and floating placement rules.
			* @param kind - registered page kind.
			* @param target - captured live pane and optional page.
			*/
			openTabFromTarget(kind, target) {
				if (!this.isTargetCurrent(target)) return;
				const { sessionId, actions } = this.require();
				this.host.openWithFocus(sessionId, () => {
					const tab = target.tabId === void 0 ? void 0 : this.mountedSurface()?.layout.tabs[target.tabId];
					if (target.host === "float" && tab?.kind === kind && this.tabs.get(kind)?.multiple !== true) {
						actions.setExpanded(sessionId, true);
						this.focus(tab.id);
						this.flash(sessionId, target.paneId);
					} else {
						const guide = tab?.kind === "guide" ? tab : void 0;
						this.openTab(kind, {
							...target.host === "dock" ? { paneId: target.paneId } : {},
							...guide === void 0 ? {} : { replaceTab: guide.id }
						});
						if (guide !== void 0) this.closeIn(sessionId, guide.id);
					}
					return this.mountedSurface()?.layout.activePaneId;
				});
			}
			/**
			* Test explicit close eligibility without using the last selected page.
			* @param target - captured focused page.
			* @returns whether this current page can be removed or its sole guide pane collapsed.
			*/
			canCloseTarget(target) {
				return this.isTargetCurrent(target) && target.tabId !== void 0;
			}
			/**
			* Remove a captured page through its resource cleanup handler, or collapse the sole docked guide.
			* Cleanup errors propagate and preserve the page.
			* @param target - page captured while resolving the command.
			* @returns closed after removal or collapse, unavailable without a page, or stale after identity changes.
			*/
			closeTarget(target) {
				if (!this.isTargetCurrent(target)) return "stale";
				const surface = this.mountedSurface();
				if (surface === void 0 || target.tabId === void 0) return "unavailable";
				const tabId = target.tabId;
				const { sessionId, actions } = this.require();
				this.host.closeWithFocus(sessionId, target.paneId, () => {
					if (canCloseTab(surface, tabId)) this.close(tabId);
					else actions.setExpanded(sessionId, false);
				});
				return "closed";
			}
			/**
			* Check a captured target before acting, including reopened records and intervening navigation.
			* @param target - identity captured while resolving the input.
			* @returns whether the on-screen Session, pane, tab lifetime and navigation still match.
			*/
			isTargetCurrent(target) {
				if (this.mounted.getSnapshot() !== target.sessionId) return false;
				const layout = this.mountedSurface()?.layout;
				const pane = layout?.nodes[target.paneId];
				if (pane?.kind !== "pane" || pane.host !== target.host) return false;
				if (target.tabId === void 0) return pane.activeTabId === void 0;
				if (!pane.tabs.includes(target.tabId) || layout?.tabs[target.tabId] === void 0) return false;
				const held = this.tabDomain.occurrence(target.sessionId, { id: target.tabId });
				return held === target.occurrence && !held.signal.aborted && held.navigation.getSnapshot().revision === target.navigationRevision;
			}
			/**
			* Explain the same geometry and pane-budget rule used by the split control.
			* @param target - captured command or button target.
			* @returns a localizable block discriminator, or undefined when splitting is available.
			*/
			splitBlock(target) {
				const surface = this.mountedSurface();
				if (surface === void 0 || !this.isTargetCurrent(target)) return "stale";
				const { layout } = surface;
				if (target.host === "float") return "float";
				if (!layout.expanded) return "collapsed";
				if ((0, _deepseek_ai_dsh_client_ui_dockkit.getPane)(layout, target.paneId).tabs.length === 0) return "empty";
				if (!(0, _deepseek_ai_dsh_client_ui_dockkit.canSplit)(layout) || (0, _deepseek_ai_dsh_client_ui_dockkit.dockPaneIds)(layout).length >= 2) return "budget";
				if (!this.canSplitPane(target.sessionId, target.paneId)) return "width";
			}
			/**
			* Toggle the right panel's display mode through the same action as its chrome button.
			* @param target - captured dock pane; floating and stale targets are unchanged.
			*/
			toggleFullscreen(target) {
				if (!this.isTargetCurrent(target) || target.host === "float" || !this.isExpanded()) return;
				const { sessionId, actions } = this.require();
				const autoFullscreen = this.host.autoFullscreen();
				const fullscreen = autoFullscreen || this.mountedSurface()?.layout.mode === "fullscreen";
				if (fullscreen && autoFullscreen) actions.setExpanded(sessionId, false);
				actions.setMode(sessionId, fullscreen ? "push" : "fullscreen");
			}
			/**
			* Split a docked pane to its right when the budget and the room rule allow.
			* @param paneId - the pane to split; defaults to the active docked pane.
			* @returns the new pane's id, or `undefined` when nothing was split.
			*/
			split(paneId) {
				const { sessionId, actions } = this.require();
				const layout = this.mountedSurface()?.layout;
				if (layout === void 0) return void 0;
				const target = paneId ?? (0, _deepseek_ai_dsh_client_ui_dockkit.activeDockPaneId)(layout);
				const node = layout.nodes[target];
				if (node === void 0 || node.kind !== "pane" || node.host !== "dock") return void 0;
				if (!(0, _deepseek_ai_dsh_client_ui_dockkit.canSplit)(layout) || (0, _deepseek_ai_dsh_client_ui_dockkit.dockPaneIds)(layout).length >= 2 || !this.canSplitPane(sessionId, target)) return void 0;
				let created;
				this.host.openWithFocus(sessionId, () => {
					actions.splitPane(sessionId, target, (id) => {
						created = id;
					});
					return created;
				});
				return created;
			}
			/**
			* Take a docked tab out into a floating panel; a missing or floating tab is left alone.
			* @param tabId - the tab to float.
			* @param rect - the panel's rectangle; defaults to the cascade from the last panel.
			*/
			float(tabId, rect) {
				const { sessionId, actions } = this.require();
				const layout = this.mountedSurface()?.layout;
				if (layout === void 0 || layout.tabs[tabId] === void 0) return;
				if ((0, _deepseek_ai_dsh_client_ui_dockkit.findTabPane)(layout, tabId).host !== "dock") return;
				actions.floatTab(sessionId, tabId, rect);
			}
			/**
			* Return a floating panel's tab to the active docked pane and expand the column; a missing or docked pane is left alone.
			* @param paneId - the floating pane.
			*/
			dock(paneId) {
				const { sessionId, actions } = this.require();
				const node = this.mountedSurface()?.layout.nodes[paneId];
				if (node === void 0 || node.kind !== "pane" || node.host !== "float") return;
				actions.unfloatPane(sessionId, paneId);
			}
			/**
			* Step the on-screen Session's surface back one intent.
			*
			* @internal Not part of the product: the sequence is an architectural fact
			* with no user-facing control yet. Kept reachable for tests.
			*/
			_undo() {
				const { sessionId, actions } = this.require();
				actions.undo(sessionId);
			}
			/**
			* Step the on-screen Session's surface forward one intent.
			*
			* @internal See `_undo`.
			*/
			_redo() {
				const { sessionId, actions } = this.require();
				actions.redo(sessionId);
			}
			/**
			* The on-screen Session and its committed surface; `undefined` with no Session
			* on screen, before the runtime mints its store, or before its first open.
			*/
			screen() {
				const sessionId = this.mounted.getSnapshot();
				if (sessionId === void 0) return void 0;
				const surface = this.adopted.get(sessionId)?.store.getSnapshot().bySession[sessionId];
				return surface === void 0 ? void 0 : {
					sessionId,
					surface
				};
			}
			/** The on-screen Session's surface; see {@link SidebarRightController.screen}. */
			mountedSurface() {
				return this.screen()?.surface;
			}
			/** Whether a Session's docked pane has room for two working halves, as its seat last measured; unmeasured panes do. */
			canSplitPane(sessionId, paneId) {
				return this.rooms.get(sessionId)?.(paneId) ?? true;
			}
			/**
			* The store actions a tab's own action on `sessionId` runs through: that
			* session's adopted store. `undefined` — nothing to act on — for a session
			* whose store was never minted or whose adoption was released.
			*/
			actionsFor(sessionId) {
				return this.adopted.get(sessionId)?.store.actions;
			}
			require() {
				const sessionId = this.mounted.getSnapshot();
				const actions = sessionId === void 0 ? void 0 : this.actionsFor(sessionId);
				if (sessionId === void 0 || actions === void 0) throw new Error("sidebarRight: no session surface is mounted");
				return {
					sessionId,
					actions
				};
			}
		};
