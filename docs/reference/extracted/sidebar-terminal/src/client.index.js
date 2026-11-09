// Extracted from @deepseek-ai/dsh-client-ui-sidebar-terminal (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Services needed by the terminal's two sidebar seats. */
const inject = [
	"slots",
	"locale",
	"sidebarRight",
	"sidebarRightTabs",
	"webTerminals",
	"theme",
	"shortcuts"
];
/**
* Register the terminal type, observable views and background process cleanup.
* @param ctx - Client root Context with sidebar and terminal services.
*/
function apply(ctx) {
	ctx.effect(() => {
		const sync = () => {
			ctx.webTerminals.retainTabs(ctx.sidebarRight.openTabs.getSnapshot().filter((tab) => tab.kind === "terminal"));
		};
		const unsubscribe = ctx.sidebarRight.openTabs.subscribe(sync);
		sync();
		return () => {
			unsubscribe();
			ctx.webTerminals.retainTabs([]);
		};
	}, "ui-sidebar-terminal.window-holds");
	const target = (sessionId, key) => ctx.sidebarRight.tabDomain.occurrence(sessionId, { id: key }).navigation.getSnapshot().params;
	const terminalId = (sessionId, key) => {
		const params = target(sessionId, key);
		return params !== void 0 && "terminalId" in params ? params.terminalId : void 0;
	};
	const view = (sessionId, key) => {
		const params = target(sessionId, key);
		const contentId = ctx.sidebarRight.tabDomain.occurrence(sessionId, { id: key }).navigation.getSnapshot().address;
		return ctx.webTerminals.view(sessionId, key, contentId, terminalId(sessionId, key), params !== void 0 && "shellPath" in params ? params.shellPath : void 0);
	};
	const namespace = "sidebarTerminal";
	const id = "@deepseek-ai/dsh-client-ui-sidebar-terminal";
	const t = ctx.locale.bind(namespace);
	ctx.effect(() => ctx.shortcuts.register({
		id: "terminal.new",
		label: () => t("new"),
		aliases: ["new terminal", "shell"],
		defaults: {
			"desktop:macos": {
				code: "Backquote",
				modifiers: ["control"]
			},
			"desktop:windows": {
				code: "Backquote",
				modifiers: ["control"]
			},
			"desktop:linux": {
				code: "Backquote",
				modifiers: ["control"]
			},
			"web:macos": {
				code: "Backquote",
				modifiers: ["control"]
			},
			"web:windows": {
				code: "Backquote",
				modifiers: ["control"]
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
					ctx.sidebarRight.openTabFromTarget("terminal", target);
				}
			};
		}
	}), "ui-sidebar-terminal: shortcut");
	ctx.effect(() => ctx.locale.register(namespace, {
		zh,
		en,
		ja,
		es,
		fr,
		de,
		ru,
		pt
	}), "ui-sidebar-terminal.copy");
	ctx.effect(() => ctx.sidebarRightTabs.register({
		id,
		kind: "terminal",
		multiple: true,
		priority: "builtin",
		title: () => t("title"),
		guide: [{
			id: "new",
			order: 20,
			title: () => t("new"),
			description: () => t("description"),
			icon: _deepseek_ai_dsh_client_ui_primitives.PluginArtworkTerminal
		}]
	}), "ui-sidebar-terminal.type");
	ctx.effect(() => ctx.sidebarRight.registerCloseHandler("terminal", (sessionId, tab) => {
		ctx.webTerminals.close(sessionId, tab.id, tab.contentId, terminalId(sessionId, tab.id));
	}), "ui-sidebar-terminal.close");
	const inject = (sessionId) => ({
		view: (key) => view(sessionId, key),
		keyedHooks: { terminal: (key) => view(sessionId, key).state }
	});
	const theme = {
		getSnapshot: () => ctx.theme.getTheme(),
		subscribe: (listener) => ctx.on("theme/change", listener)
	};
	ctx.effect(() => ctx.slots.inject("sidebar.right.tab.guide.entry", () => ctx.slots.register({
		name: "sidebar.right.tab.guide.entry",
		key: id,
		locale: namespace,
		inject: (sessionId) => ({
			hooks: { shortcuts: ctx.shortcuts.catalog },
			loadShells: (signal) => ctx.webTerminals.launchShells(sessionId, signal),
			selectShell: (path) => {
				ctx.webTerminals.selectShell(path);
			}
		})
	}, TerminalGuide)), "ui-sidebar-terminal.guide");
	ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
		name: "sidebar.right.pane.tab",
		key: id,
		locale: namespace,
		inject: (sessionId) => ({
			...inject(sessionId),
			hooks: { theme }
		})
	}, LazyTerminalBody)), "ui-sidebar-terminal.body");
	ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab.title", () => ctx.slots.register({
		name: "sidebar.right.pane.tab.title",
		key: id,
		locale: namespace,
		inject
	}, TerminalTitle)), "ui-sidebar-terminal.title");
}
