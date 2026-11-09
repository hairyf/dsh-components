// Extracted from @deepseek-ai/dsh-client-ui-sidebar-right (lib/client.js); region lib/types/client/stores.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The store shell over the docking kit: one surface per session, held as plain
		* data so the kit's pure functions are the only thing that ever computes a
		* layout.
		*
		* Every action follows the same steps — mint the ids the intent needs, ask the
		* kit's planner what operations carry it out, let the settle planner keep every
		* pane populated, record it all as one history entry — and then assigns the
		* session's whole surface back in one go. Nothing here reaches into a draft to
		* edit a layout in place, which is what keeps the kit testable without a store
		* and keeps snapshot identity honest.
		*
		* The settle step is this product's rule, not the kit's: an intent never leaves
		* an expanded column with an empty pane — emptied side panes merge away, and an
		* empty root pane seeds the default page. A collapsed column may stand empty;
		* the seed waits for the expansion that would otherwise show nothing.
		*
		* A focus that changes nothing — a tab already active in its already-active
		* pane, a pane already active — plans nothing and records nothing, whoever
		* asks: the kit's chip click and `ctx.sidebarRight.focus` alike.
		*
		* So is page uniqueness: a pane holds at most one tab of each page kind (a tab
		* whose content is the kind's own page address — the guide, the explorer).
		* Opening a page into a pane that shows it focuses that tab, in that pane and
		* nowhere else, and a page dragged, dropped, or docked into such a pane merges
		* into the pane's own — the arriving tab closes and the pane's own is focused.
		* The kit plans none of this; it is decided here before its planners run.
		*/
		/**
		* Decide whether an explicit close may remove a tab.
		* @param surface - current surface.
		* @param tabId - tab requested for closing.
		* @returns false for a missing tab or the guide standing as the only docked tab.
		*/
		function canCloseTab(surface, tabId) {
			const tab = surface.layout.tabs[tabId];
			return tab !== void 0 && !(tab.kind === "guide" && soleDockedTab(surface.layout, tabId));
		}
		/** Build the currently selected default tab. */
		function seedRecord(id, seed) {
			const initial = seed();
			return {
				id,
				kind: initial.kind,
				title: initial.title,
				contentId: pageAddress(initial.kind)
			};
		}
		/**
		* First tab showing (kind, contentId) in one host: docked panes in visual
		* order, or floating panels from the bottom of the stack.
		* @param state - current layout.
		* @param destination - the host searched.
		* @param contentId - the content identity.
		* @param kind - the claimed kind.
		* @returns the tab, or `undefined` when that host shows no such content.
		*/
		function findHostContentTab(state, destination, contentId, kind) {
			const panes = destination === "sidebar" ? (0, _deepseek_ai_dsh_client_ui_dockkit.dockPaneIds)(state) : state.floats;
			for (const paneId of panes) {
				const found = (0, _deepseek_ai_dsh_client_ui_dockkit.findPaneContentTab)(state, paneId, contentId, kind);
				if (found !== void 0) return found;
			}
		}
		/**
		* Plan an open into an explicit host: reveal the copy already there, else move
		* one copy from the other host, else open a new tab there. A move keeps the
		* tab record, so its occurrence survives the commit.
		* @param state - current layout.
		* @param mint - id source for a new tab or floating pane.
		* @param intent - the claimed content and its host.
		* @param destination - the host.
		* @returns the operations plus the tab they settle on.
		*/
		function planOpenIn(state, mint, intent, destination) {
			const { kind, contentId, title } = intent;
			const other = destination === "sidebar" ? "float" : "sidebar";
			const here = findHostContentTab(state, destination, contentId, kind);
			const there = here === void 0 ? findHostContentTab(state, other, contentId, kind) : void 0;
			if (destination === "sidebar") {
				const expand = (0, _deepseek_ai_dsh_client_ui_dockkit.planSetExpanded)(state, true);
				if (here !== void 0) return {
					ops: [...expand, {
						type: "focusTab",
						tabId: here
					}],
					tabId: here
				};
				const paneId = (0, _deepseek_ai_dsh_client_ui_dockkit.activeDockPaneId)(state);
				if (there !== void 0) return {
					ops: [...expand, ...(0, _deepseek_ai_dsh_client_ui_dockkit.planUnfloatPane)(state, (0, _deepseek_ai_dsh_client_ui_dockkit.findTabPane)(state, there).id, paneId)],
					tabId: there
				};
				const opened = (0, _deepseek_ai_dsh_client_ui_dockkit.planOpenContent)(state, mint, {
					kind,
					contentId,
					title,
					paneId,
					revealIfOpened: false
				});
				return {
					ops: [...expand, ...opened.ops],
					tabId: opened.tabId
				};
			}
			if (here !== void 0) return {
				ops: [{
					type: "focusTab",
					tabId: here
				}],
				tabId: here
			};
			if (there !== void 0) return {
				ops: (0, _deepseek_ai_dsh_client_ui_dockkit.planFloatTab)(state, mint, there).ops,
				tabId: there
			};
			const paneId = (0, _deepseek_ai_dsh_client_ui_dockkit.activeDockPaneId)(state);
			const pane = (0, _deepseek_ai_dsh_client_ui_dockkit.getPane)(state, paneId);
			const opened = (0, _deepseek_ai_dsh_client_ui_dockkit.planOpenContent)(state, mint, {
				kind,
				contentId,
				title,
				paneId,
				index: pane.activeTabId === void 0 ? 0 : pane.tabs.indexOf(pane.activeTabId) + 1,
				revealIfOpened: false
			});
			return {
				ops: [...opened.ops, ...(0, _deepseek_ai_dsh_client_ui_dockkit.planFloatTab)(state, mint, opened.tabId).ops],
				tabId: opened.tabId
			};
		}
		/** A mint that counts, so the surface can carry its position forward. */
		function counting(from) {
			let counter = from;
			const mint = ((prefix) => {
				counter += 1;
				return `${prefix}${counter}`;
			});
			return {
				mint,
				used: () => counter
			};
		}
		/**
		* The surface a session starts with: collapsed, one pane, no tabs. The default
		* page is not seeded here — the settle rule seeds it when the column first
		* expands still empty, so a collapsed column never holds a page nobody asked
		* for, and an open into a fresh surface shows only what it opened.
		* @returns the initial surface.
		*/
		function createSurface() {
			const counter = counting(0);
			return {
				layout: (0, _deepseek_ai_dsh_client_ui_dockkit.createInitialState)({ next: counter.mint }),
				history: _deepseek_ai_dsh_client_ui_dockkit.EMPTY_HISTORY,
				minted: counter.used()
			};
		}
		/** The tab showing `kind`'s page in a pane, if any. */
		function panePage(state, paneId, kind) {
			return (0, _deepseek_ai_dsh_client_ui_dockkit.findPaneContentTab)(state, paneId, pageAddress(kind), kind);
		}
		/**
		* The kind whose page a tab shows, or `undefined` for a resource tab. A pane
		* holds at most one page of each kind, so a page tab is never copied.
		*/
		function pageKind(state, tabId) {
			const tab = state.tabs[tabId];
			return tab !== void 0 && tab.contentId === pageAddress(tab.kind) ? tab.kind : void 0;
		}
		/**
		* Whether a tab stands alone on the docked surface: its pane is the sole docked
		* pane and holds nothing else. Floating panels do not count — they render
		* whether or not the column is expanded.
		* @param state - current layout.
		* @param tabId - the tab asked about.
		* @returns `true` for the docked surface's only tab.
		*/
		function soleDockedTab(state, tabId) {
			const pane = (0, _deepseek_ai_dsh_client_ui_dockkit.findTabPane)(state, tabId);
			return pane.host === "dock" && pane.tabs.length === 1 && (0, _deepseek_ai_dsh_client_ui_dockkit.dockPaneIds)(state).length === 1;
		}
		/** Focus a tab: nothing to plan while it is its pane's active tab and its pane is the active one. */
		function planFocusTab(state, tabId) {
			const pane = (0, _deepseek_ai_dsh_client_ui_dockkit.findTabPane)(state, tabId);
			return pane.activeTabId === tabId && state.activePaneId === pane.id ? [] : [{
				type: "focusTab",
				tabId
			}];
		}
		/** Focus a pane: nothing to plan while it is the active one. */
		function planFocusPane(state, paneId) {
			return state.activePaneId === paneId ? [] : [{
				type: "focusPane",
				paneId
			}];
		}
		/**
		* Plan a tab's arrival in a docked pane: a page arriving where its kind's page
		* already shows merges into it, anything else plans as the kit does.
		* @param state - current layout.
		* @param tabId - the arriving tab.
		* @param toPaneId - the pane it arrives in.
		* @param otherwise - the kit's plan for the move.
		* @returns the operations.
		*/
		function arriving(state, tabId, toPaneId, otherwise) {
			const kind = pageKind(state, tabId);
			if (kind === void 0) return otherwise();
			const existing = panePage(state, toPaneId, kind);
			if (existing === void 0 || existing === tabId) return otherwise();
			return [{
				type: "closeTab",
				tabId
			}, {
				type: "focusTab",
				tabId: existing
			}];
		}
		/**
		* Run one planner against a surface, settle what it left behind, and record the
		* whole intent as one history entry.
		* @param surface - the session's current surface.
		* @param plan - the kit planner to consult.
		* @param seed - the registered default page for an empty docked pane.
		* @returns the next surface, or the same one when the intent changes nothing.
		*/
		function advance(surface, plan, seed) {
			const counter = counting(surface.minted);
			const makeTab = (id) => seedRecord(id, seed);
			const planned = plan(surface.layout, counter.mint, makeTab);
			if (planned.length === 0) return surface;
			const after = (0, _deepseek_ai_dsh_client_ui_dockkit.replay)(surface.layout, planned);
			const settled = (0, _deepseek_ai_dsh_client_ui_dockkit.planSettle)(after, counter.mint, after.expanded ? makeTab : void 0);
			const stepped = (0, _deepseek_ai_dsh_client_ui_dockkit.record)(surface.history, surface.layout, [...planned, ...settled]);
			return {
				layout: stepped.state,
				history: stepped.history,
				minted: counter.used()
			};
		}
		/**
		* Replace one session's surface, leaving every other session by reference.
		*
		* A session with no surface yet gets its initial one even when the intent
		* changes nothing: materializing is itself the change.
		*/
		function seat(state, sessionId, next) {
			const existing = state.bySession[sessionId];
			const updated = next(existing ?? createSurface());
			return updated === existing ? state.bySession : {
				...state.bySession,
				[sessionId]: updated
			};
		}
		/** Step a surface through the history in one direction. */
		function stepped(surface, step) {
			const moved = step(surface.history, surface.layout);
			return moved === void 0 ? surface : {
				...surface,
				layout: moved.state,
				history: moved.history
			};
		}
		/**
		* Create the Sidebar store handle with per-Session JSON persistence in localStorage.
		*
		* The default page arrives as a thunk: a pane is seeded when a split or an
		* expansion of an empty column needs one, which can be long after the store was
		* built and in a language the user has since changed to.
		* @param seed - the registered default page, read at each mint.
		* @returns the handle (spec, type, identity, and factory in one).
		*/
		function createSidebarRightStore(seed) {
			const handle = (0, _deepseek_ai_dsh_client_store.defineStore)({
				init: () => ({ bySession: {} }),
				actions: {
					open: (d, sessionId) => {
						d.bySession = seat(d, sessionId, (surface) => surface);
					},
					setExpanded: (d, sessionId, expanded) => {
						d.bySession = seat(d, sessionId, (s) => advance(s, (state) => (0, _deepseek_ai_dsh_client_ui_dockkit.planSetExpanded)(state, expanded), seed));
					},
					toggleExpanded: (d, sessionId) => {
						d.bySession = seat(d, sessionId, (s) => advance(s, (state) => (0, _deepseek_ai_dsh_client_ui_dockkit.planSetExpanded)(state, !state.expanded), seed));
					},
					setMode: (d, sessionId, mode) => {
						d.bySession = seat(d, sessionId, (s) => advance(s, (state) => (0, _deepseek_ai_dsh_client_ui_dockkit.planSetMode)(state, mode), seed));
					},
					splitPane: (d, sessionId, paneId, settled) => {
						d.bySession = seat(d, sessionId, (s) => {
							const next = advance(s, (state, mint, makeTab) => (0, _deepseek_ai_dsh_client_ui_dockkit.dockPaneIds)(state).length >= 2 || (0, _deepseek_ai_dsh_client_ui_dockkit.getPane)(state, paneId ?? (0, _deepseek_ai_dsh_client_ui_dockkit.activeDockPaneId)(state)).tabs.length === 0 ? [] : (0, _deepseek_ai_dsh_client_ui_dockkit.planSplitPane)(state, mint, paneId, makeTab), seed);
							if (settled !== void 0 && next !== s) {
								const before = new Set((0, _deepseek_ai_dsh_client_ui_dockkit.dockPaneIds)(s.layout));
								for (const id of (0, _deepseek_ai_dsh_client_ui_dockkit.dockPaneIds)(next.layout)) if (!before.has(id)) settled(id);
							}
							return next;
						});
					},
					openContent: (d, sessionId, intent, settled) => {
						d.bySession = seat(d, sessionId, (s) => advance(s, (state, mint) => {
							if (intent.destination !== void 0) {
								const planned = planOpenIn(state, mint, intent, intent.destination);
								settled(planned.tabId);
								return planned.ops;
							}
							const { kind, contentId, title } = intent;
							const replace = intent.replaceTab !== void 0 && state.tabs[intent.replaceTab] !== void 0 ? intent.replaceTab : void 0;
							const replaced = replace === void 0 ? void 0 : (0, _deepseek_ai_dsh_client_ui_dockkit.findTabPane)(state, replace);
							const lent = replaced?.host === "dock" ? replaced : void 0;
							const paneId = lent?.id ?? intent.paneId;
							const index = lent === void 0 || replace === void 0 ? void 0 : lent.tabs.indexOf(replace);
							const page = contentId === pageAddress(kind);
							const held = page ? panePage(state, replaced?.id ?? paneId ?? (0, _deepseek_ai_dsh_client_ui_dockkit.activeDockPaneId)(state), kind) : void 0;
							const revealed = page ? held : intent.revealIfOpened === false ? void 0 : (0, _deepseek_ai_dsh_client_ui_dockkit.findContentTab)(state, contentId, kind);
							if (replace !== void 0 && revealed === void 0 && replaced?.host === "float") {
								const tab = {
									id: mint("tab"),
									kind,
									contentId,
									title
								};
								settled(tab.id);
								return [
									{
										type: "closeTab",
										tabId: replace
									},
									{
										type: "insertPane",
										pane: {
											...replaced,
											tabs: [tab.id],
											activeTabId: tab.id
										},
										tabs: [tab],
										attach: {
											mode: "float",
											index: state.floats.indexOf(replaced.id)
										}
									},
									{
										type: "focusTab",
										tabId: tab.id
									}
								];
							}
							const ops = revealed !== void 0 && (0, _deepseek_ai_dsh_client_ui_dockkit.findTabPane)(state, revealed).host === "float" ? [] : [...(0, _deepseek_ai_dsh_client_ui_dockkit.planSetExpanded)(state, true)];
							let openedInNewPane;
							const split = intent.preferNewPane === true && replace === void 0 && revealed === void 0 ? (0, _deepseek_ai_dsh_client_ui_dockkit.planSplitPane)(state, mint, paneId, (id) => {
								openedInNewPane = id;
								return {
									id,
									kind,
									contentId,
									title
								};
							}) : [];
							const planned = revealed !== void 0 ? {
								ops: [{
									type: "focusTab",
									tabId: revealed
								}],
								tabId: revealed
							} : openedInNewPane !== void 0 ? {
								ops: split,
								tabId: openedInNewPane
							} : (0, _deepseek_ai_dsh_client_ui_dockkit.planOpenContent)(state, mint, {
								kind,
								contentId,
								title,
								...paneId === void 0 ? {} : { paneId },
								...index === void 0 ? {} : { index },
								...page ? { revealIfOpened: false } : intent.revealIfOpened === void 0 ? {} : { revealIfOpened: intent.revealIfOpened }
							});
							ops.push(...planned.ops);
							if (replace !== void 0 && revealed === void 0) ops.push({
								type: "closeTab",
								tabId: replace
							});
							settled(planned.tabId);
							return ops;
						}, seed));
					},
					duplicateTab: (d, sessionId, tabId) => {
						d.bySession = seat(d, sessionId, (s) => advance(s, (state, mint) => pageKind(state, tabId) !== void 0 ? [] : (0, _deepseek_ai_dsh_client_ui_dockkit.planDuplicateTab)(state, mint, tabId).ops, seed));
					},
					closeTab: (d, sessionId, tabId) => {
						d.bySession = seat(d, sessionId, (s) => advance(s, (state) => {
							if (!canCloseTab(s, tabId)) return [];
							if (!soleDockedTab(state, tabId)) return [{
								type: "closeTab",
								tabId
							}];
							return [
								{
									type: "closeTab",
									tabId
								},
								...(0, _deepseek_ai_dsh_client_ui_dockkit.planSetMode)(state, "push"),
								...(0, _deepseek_ai_dsh_client_ui_dockkit.planSetExpanded)(state, false)
							];
						}, seed));
					},
					focusTab: (d, sessionId, tabId) => {
						d.bySession = seat(d, sessionId, (s) => advance(s, (state) => planFocusTab(state, tabId), seed));
					},
					focusPane: (d, sessionId, paneId) => {
						d.bySession = seat(d, sessionId, (s) => advance(s, (state) => planFocusPane(state, paneId), seed));
					},
					placeTab: (d, sessionId, tabId, toPaneId, index) => {
						d.bySession = seat(d, sessionId, (s) => advance(s, (state) => arriving(state, tabId, toPaneId, () => (0, _deepseek_ai_dsh_client_ui_dockkit.planPlaceTab)(state, tabId, toPaneId, index)), seed));
					},
					dropTab: (d, sessionId, tabId, paneId, zone) => {
						d.bySession = seat(d, sessionId, (s) => advance(s, (state, mint, makeTab) => {
							if (zone === "top" || zone === "bottom") return [];
							if (zone !== "center" && (0, _deepseek_ai_dsh_client_ui_dockkit.dockPaneIds)(state).length >= 2) return [];
							const plan = () => (0, _deepseek_ai_dsh_client_ui_dockkit.planDropTab)(state, mint, tabId, paneId, zone, makeTab);
							return zone === "center" ? arriving(state, tabId, paneId, plan) : plan();
						}, seed));
					},
					floatTab: (d, sessionId, tabId, rect) => {
						d.bySession = seat(d, sessionId, (s) => advance(s, (state, mint) => (0, _deepseek_ai_dsh_client_ui_dockkit.planFloatTab)(state, mint, tabId, rect).ops, seed));
					},
					unfloatPane: (d, sessionId, paneId) => {
						d.bySession = seat(d, sessionId, (s) => advance(s, (state) => {
							const floated = (0, _deepseek_ai_dsh_client_ui_dockkit.getPane)(state, paneId).tabs[0];
							const plan = () => (0, _deepseek_ai_dsh_client_ui_dockkit.planUnfloatPane)(state, paneId);
							/* v8 ignore next -- a floating pane holds exactly one tab. */
							const ops = floated === void 0 ? plan() : arriving(state, floated, (0, _deepseek_ai_dsh_client_ui_dockkit.activeDockPaneId)(state), plan);
							return [...(0, _deepseek_ai_dsh_client_ui_dockkit.planSetExpanded)(state, true), ...ops];
						}, seed));
					},
					moveFloat: (d, sessionId, paneId, x, y) => {
						d.bySession = seat(d, sessionId, (s) => advance(s, () => [{
							type: "moveFloat",
							paneId,
							x,
							y
						}], seed));
					},
					resizeFloat: (d, sessionId, paneId, rect) => {
						d.bySession = seat(d, sessionId, (s) => advance(s, () => [{
							type: "resizeFloat",
							paneId,
							rect
						}], seed));
					},
					resizeSplit: (d, sessionId, splitId, sizes) => {
						d.bySession = seat(d, sessionId, (s) => advance(s, () => (0, _deepseek_ai_dsh_client_ui_dockkit.planResizeSplit)(splitId, sizes, .2), seed));
					},
					undo: (d, sessionId) => {
						d.bySession = seat(d, sessionId, (s) => stepped(s, _deepseek_ai_dsh_client_ui_dockkit.stepBack));
					},
					redo: (d, sessionId) => {
						d.bySession = seat(d, sessionId, (s) => stepped(s, _deepseek_ai_dsh_client_ui_dockkit.stepForward));
					}
				}
			});
			return {
				...handle,
				create(scopeKey) {
					const instance = handle.create(scopeKey);
					if (scopeKey === void 0) return instance;
					const saved = readSidebarLayout(scopeKey);
					if (saved !== void 0) instance.store.set({ bySession: { [scopeKey]: saved } });
					instance.subscribe(() => {
						const surface = instance.getSnapshot().bySession[scopeKey];
						if (surface !== void 0) writeSidebarLayout(scopeKey, surface);
					});
					return {
						...instance,
						clearPersisted: () => {
							clearSidebarLayout(scopeKey);
						}
					};
				}
			};
		}
