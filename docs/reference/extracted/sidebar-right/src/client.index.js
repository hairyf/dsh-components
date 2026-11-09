// Extracted from @deepseek-ai/dsh-client-ui-sidebar-right (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** This package's copy namespace. */
const NS = "sidebarRight";
/** Required browser services: the slot registry, the frame's panel actions, copy, and the resource model. */
const inject = [
	"contextMenus",
	"slots",
	"layout",
	"locale",
	"resources",
	"sessions",
	"uiSession",
	"shortcuts"
];
/**
* Client plugin body: provide the registry and the navigation face, register the
* panel seat and the rail seat over one store with their extension children, and
* register the guide type through the same public two-stage path any other type
* uses.
* @param ctx - client root context carrying the slot registry, the frame's face, and copy.
*/
function apply(ctx) {
	const t = ctx.locale.bind(NS);
	const tabs = new SidebarRightTabRegistry(ctx);
	const views = new SidebarSessionViews(ctx.sessions);
	ctx.effect(() => {
		const current = ctx.uiSession.adapter.current;
		const sync = () => {
			views.select(current.getSnapshot().key);
		};
		const unsubscribe = current.subscribe(sync);
		sync();
		return () => {
			unsubscribe();
			views.dispose();
		};
	}, "ui-sidebar-right: retained Session views");
	const layout = ctx.layout;
	let autoFullscreen = false;
	const { controller, adopt, forget, show, measure } = createSidebarRightController(tabs, (address, signal) => {
		ctx.resources.pin(address, signal);
	}, {
		autoFullscreen: () => autoFullscreen,
		openWithFocus: (sessionId, open) => {
			openWithPaneFocus(document, sessionId, open);
		},
		closeWithFocus: (sessionId, paneId, close) => {
			closeWithPaneFocus(document, sessionId, paneId, close);
		}
	});
	ctx.effect(() => ctx.slots.inject("contextMenu.icon", () => ctx.slots.register({
		name: "contextMenu.icon",
		key: "sidebar.close"
	}, _deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular)), "sidebar: menu icon");
	ctx.effect(() => ctx.contextMenus.register({
		id: "sidebar.close",
		target: "tab",
		order: 100,
		resolve: ({ sessionId, paneId, tab }) => {
			const tabId = tab.id;
			const tabs = controller.menuTabs(sessionId, paneId, tabId);
			if (!tabs.close && tabs.all.length === 0) return [];
			const closeMany = (ids) => {
				for (const id of ids) if (controller.menuTabs(sessionId, paneId, tabId).all.includes(id)) controller.closeIn(sessionId, id);
			};
			return [
				{
					id: "close",
					commandId: "page.close",
					icon: { key: "sidebar.close" },
					label: t("menu.close"),
					disabled: !tabs.close,
					run: () => {
						if (controller.menuTabs(sessionId, paneId, tabId).close) controller.closeIn(sessionId, tabId);
					}
				},
				{
					id: "others",
					label: t("menu.closeOthers"),
					disabled: tabs.all.length === 0,
					run: () => {
						closeMany(tabs.all);
					}
				},
				...tabs.right.length === 0 ? [] : [{
					id: "right",
					label: t("menu.closeRight"),
					run: () => {
						closeMany(tabs.right);
					}
				}]
			];
		}
	}), "sidebar: menu actions");
	ctx.effect(() => ctx.slots.inject("contextMenu.content", () => ctx.slots.register({
		name: "contextMenu.content",
		key: "tab",
		children: { "sidebar.right.tab.menu.item": {
			kind: "list",
			scope: "session"
		} },
		inject: () => ({ hooks: { views: views.source } })
	}, TabMenuContent)), "sidebar: menu extensions");
	ctx.effect(() => {
		const sync = () => {
			const selected = views.source.getSnapshot().find((view) => view.selected);
			show(layout.panelInfo.getSnapshot().activePanelId === null ? selected?.sessionId : void 0);
		};
		const unsubscribeViews = views.source.subscribe(sync);
		const unsubscribePanel = layout.panelInfo.subscribe(sync);
		sync();
		return () => {
			unsubscribeViews();
			unsubscribePanel();
			show(void 0);
		};
	}, "ui-sidebar-right: on-screen Session");
	const disposeRegistry = ctx.reflect.provide("sidebarRightTabs", tabs);
	const disposeService = ctx.reflect.provide("sidebarRight", controller);
	ctx.effect(() => () => {
		controller.tabDomain.dispose();
		disposeService();
		disposeRegistry();
	}, "ui-sidebar-right: service faces");
	ctx.effect(() => ctx.locale.register(NS, {
		zh,
		en,
		ja,
		es,
		fr,
		de,
		ru,
		pt
	}), "ui-sidebar-right: dictionaries");
	ctx.effect(() => registerSidebarShortcuts(ctx.shortcuts, controller, t, () => {
		ctx.shortcuts.closeWindow().catch((error) => {
			console.error("Window close failed", error);
		});
	}), "ui-sidebar-right: shortcuts");
	if (typeof document !== "undefined") ctx.effect(() => observeSidebarFocus(document), "ui-sidebar-right: focus");
	ctx.effect(() => {
		const handle = createSidebarRightStore(() => defaultSeed(tabs));
		const adoptions = /* @__PURE__ */ new Map();
		const store = {
			...handle,
			create: (scopeKey) => {
				const instance = handle.create(scopeKey);
				if (scopeKey !== void 0) {
					const sessionId = scopeKey;
					adoptions.get(sessionId)?.();
					adoptions.set(sessionId, adopt(sessionId, instance));
				}
				return {
					...instance,
					clearPersisted() {
						instance.clearPersisted();
						if (scopeKey !== void 0) forget(scopeKey);
					}
				};
			}
		};
		const injected = {
			syncPresentation({ shown, track, fullscreen }) {
				if (shown) layout.openRightbar(track, fullscreen);
				else layout.closeRightbar();
			},
			reportAutoFullscreen: (value) => {
				autoFullscreen = value;
			},
			splitPane: (paneId) => {
				controller.split(paneId);
			},
			toggleFullscreen: () => {
				const target = controller.commandTarget();
				if (target !== void 0) controller.toggleFullscreen(target);
			},
			openTab: (kind, options) => {
				controller.openTab(kind, options);
			}
		};
		const tabTypes = {
			subscribe: (listener) => tabs.subscribe(listener),
			getSnapshot: () => tabs.entries()
		};
		const disposeTypes = [tabs.register(guideDefinition(t))];
		const disposeSeat = ctx.slots.inject("rightbar", function* () {
			yield ctx.slots.register({
				name: "rightbar",
				children: { "rightbar.session": {
					kind: "single",
					scope: "session"
				} },
				inject: () => ({
					hooks: { views: views.source },
					mountView: (reference) => views.mount(reference)
				})
			}, RightbarRoot);
			yield ctx.slots.register({
				name: "rightbar.session",
				locale: NS,
				children: {
					"sidebar.right.pane.tab": {
						kind: "keyed",
						scope: "session",
						inject: { hooks: { tabInfo: tabInfoFactory } }
					},
					"sidebar.right.pane.tab.title": {
						kind: "keyed",
						scope: "session",
						inject: { hooks: { tabInfo: tabInfoFactory } }
					}
				},
				store,
				inject: (sessionId) => ({
					...injected,
					hooks: {
						contextMenuTarget: ctx.contextMenus.active,
						shortcuts: ctx.shortcuts.catalog,
						tabTypes,
						flash: controller.flashOf(sessionId)
					},
					measureRoom: (canSplitPane) => {
						measure(sessionId, canSplitPane);
					},
					closeTab: (tabId) => {
						try {
							controller.closeIn(sessionId, tabId);
						} catch (error) {
							console.error("Sidebar tab close failed:", error);
						}
					},
					keyedHooks: { tabNavigation: (key) => controller.tabDomain.occurrence(sessionId, { id: key }).navigation },
					occurrence: (tab) => controller.tabDomain.occurrence(sessionId, tab)
				})
			}, RightbarSeat);
		});
		const disposeExpand = ctx.slots.inject("conversation.session.header.corner", () => ctx.slots.register({
			name: "conversation.session.header.corner",
			locale: NS,
			store,
			inject: () => ({ hooks: { shortcuts: ctx.shortcuts.catalog } })
		}, ExpandButton));
		const guidePins = createGuidePins();
		const guideInjected = {
			hooks: {
				shortcuts: ctx.shortcuts.catalog,
				guideEntries: {
					subscribe: (listener) => tabs.subscribe(listener),
					getSnapshot: () => tabs.guide()
				},
				entryPins: guidePins.unpinned,
				entryActions: {
					getSnapshot: () => ctx.slots.entriesOfSlot("sidebar.right.tab.guide.actions").length > 0,
					subscribe: (listener) => ctx.slots.subscribe("sidebar.right.tab.guide.actions", listener)
				}
			},
			setPinned: guidePins.setPinned
		};
		const disposeGuide = ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
			name: "sidebar.right.pane.tab",
			key: GUIDE_ID,
			locale: NS,
			children: {
				"sidebar.right.tab.guide.actions": {
					kind: "list",
					scope: "root"
				},
				"sidebar.right.tab.guide.entry": {
					kind: "keyed",
					scope: "session",
					inject: { hooks: { tabInfo: guideTabInfoFactory } }
				},
				"sidebar.right.tab.guide": {
					kind: "chain",
					scope: "session",
					inject: { hooks: { tabInfo: guideTabInfoFactory } }
				}
			},
			inject: () => guideInjected
		}, GuideBody));
		const disposeGuideTitle = ctx.slots.inject("sidebar.right.pane.tab.title", () => ctx.slots.register({
			name: "sidebar.right.pane.tab.title",
			key: GUIDE_ID
		}, GuideTitle));
		return () => {
			disposeGuideTitle();
			disposeGuide();
			disposeExpand();
			disposeSeat();
			for (const dispose of disposeTypes.reverse()) dispose();
			for (const release of adoptions.values()) release();
			adoptions.clear();
		};
	}, "ui-sidebar-right: seats and shipped tab type");
}
