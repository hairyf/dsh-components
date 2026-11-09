// Extracted from @deepseek-ai/dsh-client-ui-layout (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Required services (cordis fiber inject — the loader passes all module exports as an object plugin). */
const inject = [
	"slots",
	"theme",
	"locale",
	"shortcuts"
];
/**
* Client plugin body: provide ctx.layout, then one register() call — AppFrame
* into 'root' with its child-slot declarations, the layout store seat,
* and the shared root instance supplying commands and the panel-info source.
* @param ctx - client root context.
*/
function apply(ctx) {
	ctx.effect(() => ctx.locale.register("shortcuts.layout", {
		zh,
		en,
		ja,
		es,
		fr,
		de,
		ru,
		pt
	}), "layout: command labels");
	const t = ctx.locale.bind("shortcuts.layout");
	ctx.effect(() => {
		const query = typeof matchMedia === "function" ? matchMedia("(device-posture: folded) and (orientation: landscape)") : void 0;
		const foldedLandscape = {
			getSnapshot: () => query?.matches ?? false,
			subscribe: (listener) => {
				query?.addEventListener("change", listener);
				return () => {
					query?.removeEventListener("change", listener);
				};
			}
		};
		const handle = createLayoutStore();
		const instance = handle.create();
		const store = {
			...handle,
			create: () => instance
		};
		const retainMainPanels = () => {
			instance.actions.retainMainPanels(ctx.slots.entries("main").flatMap((entry) => entry.options.key === void 0 ? [] : [entry.options.key]));
		};
		const layout = new LayoutController(instance.actions, (id) => ctx.slots.entries("main").some((entry) => entry.options.key === id), {
			getSnapshot: () => instance.getSnapshot().panelInfo,
			subscribe: (listener) => instance.subscribe(listener)
		});
		const disposePanelInfo = ctx.slots.provideRoot({ hooks: { panelInfo: layout.panelInfo } });
		const disposeService = ctx.reflect.provide("layout", layout);
		const disposeRegistration = ctx.slots.register({
			name: "root",
			locale: "common",
			children: {
				"sidebar": {
					kind: "single",
					scope: "root"
				},
				"main": {
					kind: "keyed",
					scope: "root"
				},
				"rightbar": {
					kind: "single",
					scope: "root"
				},
				"shell.bottom": {
					kind: "single",
					scope: "root"
				},
				"shell.overlay": {
					kind: "list",
					scope: "root"
				},
				"shell.leading": {
					kind: "single",
					scope: "root"
				}
			},
			store,
			inject: () => ({ hooks: { foldedLandscape } })
		}, AppFrame);
		const disposeShortcut = ctx.shortcuts.register({
			id: "sidebar.left.toggle",
			label: () => t("toggle"),
			aliases: ["sidebar", "toggle left sidebar"],
			defaults: {
				"desktop:macos": {
					code: "KeyB",
					modifiers: ["primary"]
				},
				"desktop:windows": {
					code: "KeyB",
					modifiers: ["primary"]
				},
				"desktop:linux": {
					code: "KeyB",
					modifiers: ["primary"]
				},
				"web:macos": {
					code: "KeyB",
					modifiers: ["primary", "alt"]
				},
				"web:windows": {
					code: "KeyB",
					modifiers: ["primary", "alt"]
				}
			},
			regions: ["page", "editable"],
			modals: ["sidebar"],
			resolve: ({ modal }) => modal !== null && modal !== "sidebar" ? { status: "pass" } : {
				status: "handled",
				run: () => {
					layout.toggleSidebar();
				}
			}
		});
		const disposePanels = ctx.slots.subscribe("main", retainMainPanels);
		retainMainPanels();
		return () => {
			disposeShortcut();
			layout.dispose();
			disposePanels();
			disposeRegistration();
			disposePanelInfo();
			disposeService();
		};
	}, "ui-layout: service + root registration");
	ctx.effect(() => {
		const presenter = new ThemePresenter();
		presenter.apply(ctx.theme.getTheme());
		const off = ctx.on("theme/change", (snapshot) => {
			presenter.apply(snapshot);
		});
		return () => {
			off();
			presenter.dispose();
		};
	}, "ui-layout: theme presenter");
}
