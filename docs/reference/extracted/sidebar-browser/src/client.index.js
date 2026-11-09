// Extracted from @deepseek-ai/dsh-client-ui-sidebar-browser (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Required Browser services. */
const inject = [
	"slots",
	"locale",
	"sidebarRight",
	"sidebarRightTabs"
];
/** Register the Browser type, localized guide entry, body, and title. */
function apply(ctx) {
	const namespace = "sidebarBrowser";
	const t = ctx.locale.bind(namespace);
	ctx.inject(["shortcuts"], (ctx) => {
		ctx.effect(() => ctx.shortcuts.register({
			id: "browser.new",
			label: () => t("guide.title"),
			aliases: ["browser", "new browser tab"],
			defaults: {
				"desktop:macos": {
					code: "KeyT",
					modifiers: ["primary"]
				},
				"desktop:windows": {
					code: "KeyT",
					modifiers: ["primary"]
				},
				"desktop:linux": {
					code: "KeyT",
					modifiers: ["primary"]
				},
				"web:macos": {
					code: "KeyT",
					modifiers: ["primary", "alt"]
				},
				"web:windows": {
					code: "KeyT",
					modifiers: ["primary", "alt"]
				}
			},
			regions: [
				"page",
				"editable",
				"terminal"
			],
			modals: [],
			resolve: ({ target: element }) => {
				const target = ctx.sidebarRight.commandTarget(element);
				if (target === void 0) return {
					status: "blocked",
					reason: t("shortcut.noSession")
				};
				return {
					status: "handled",
					run: () => {
						ctx.sidebarRight.openTabFromTarget("browser", target);
					}
				};
			}
		}), "ui-sidebar-browser: shortcut");
	});
	const store = createBrowserStore();
	const openTabs = ctx.sidebarRight.openTabs;
	const carrier = globalThis.dshDesktop;
	const desktop = carrier?.protocolVersion === 1 ? carrier.browser : void 0;
	ctx.effect(() => ctx.locale.register(namespace, {
		zh,
		en,
		ja,
		es,
		fr,
		de,
		ru,
		pt
	}), "ui-sidebar-browser.copy");
	ctx.effect(() => ctx.sidebarRightTabs.register({
		...browserDefinition(t),
		keepMounted: desktop !== void 0
	}), "ui-sidebar-browser.type");
	const installFrames = (scope, factory) => {
		const controllers = /* @__PURE__ */ new Map();
		scope.effect(() => async () => {
			const pending = [...controllers.values()].map((controller) => controller.dispose());
			controllers.clear();
			await Promise.all(pending);
		}, "ui-sidebar-browser.frames");
		scope.effect(() => scope.slots.inject("sidebar.right.pane.tab", () => scope.slots.register({
			name: "sidebar.right.pane.tab",
			key: BROWSER_ID,
			locale: namespace,
			store,
			inject: (sessionId, actions) => {
				const existing = controllers.get(sessionId);
				if (existing !== void 0) {
					existing.rebind(actions);
					return existing;
				}
				const controller = createBrowserControllers(actions, factory(sessionId), (tabId) => openTabs.getSnapshot().some((tab) => tab.sessionId === sessionId && tab.tabId === tabId));
				controllers.set(sessionId, controller);
				return controller;
			}
		}, BrowserBody)), "ui-sidebar-browser.body");
	};
	if (desktop === void 0) installFrames(ctx, () => createIframePage);
	else ctx.inject(["workspaces"], (scope) => {
		installFrames(scope, (sessionId) => (options) => createElectronPage(options, desktop, (signal) => browserWorkspace(scope.workspaces.list, sessionId, signal)));
	});
	ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab.title", () => ctx.slots.register({
		name: "sidebar.right.pane.tab.title",
		key: BROWSER_ID,
		store
	}, BrowserTitle)), "ui-sidebar-browser.title");
}
