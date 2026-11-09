// Extracted from @deepseek-ai/dsh-client-ui-sidebar (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Dictionary namespace owned by this plugin. */
const NS = "sidebar";
/** Services required by the sidebar plugin. */
const inject = [
	"slots",
	"layout",
	"uiWorkspace",
	"locale",
	"shortcuts"
];
/** Registers the sidebar shell and its service callbacks.
* @param ctx - Client root context.
*/
function apply(ctx) {
	const workspaceNavigation = ctx.get("uiWorkspace");
	ctx.effect(() => ctx.locale.register(NS, {
		zh,
		en,
		ja,
		es,
		fr,
		de,
		ru,
		pt
	}), "ui-sidebar: dictionaries");
	const panels = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)([]);
	const syncPanels = () => {
		const next = ctx.slots.entriesOfSlot("sidebar.panellist").map(({ options }) => {
			const id = options.id;
			return {
				id,
				order: options.order ?? 0,
				label: (0, _deepseek_ai_dsh_client_ui_slots.resolveSlotLabel)(options.label) ?? id
			};
		}).sort((a, b) => a.order - b.order);
		const previous = panels.getSnapshot();
		if (previous.length === next.length && previous.every((panel, index) => {
			const candidate = next[index];
			return panel.id === candidate.id && panel.order === candidate.order && panel.label === candidate.label;
		})) return;
		panels.set(next);
	};
	ctx.effect(() => ctx.slots.subscribe("sidebar.panellist", syncPanels), "ui-sidebar: panel entries");
	ctx.effect(() => ctx.locale.subscribe(syncPanels), "ui-sidebar: panel labels");
	const panelPins = createPanelPins();
	const entryActions = {
		getSnapshot: () => ctx.slots.entriesOfSlot("sidebar.panellist.actions").length > 0,
		subscribe: (listener) => ctx.slots.subscribe("sidebar.panellist.actions", listener)
	};
	const injectProps = () => ({
		startSession: (workspaceId) => {
			workspaceNavigation.startSession(workspaceId);
		},
		toggleSidebar: () => {
			ctx.layout.toggleSidebar();
		},
		selectPanel: (id) => {
			ctx.layout.selectPanel(id);
		},
		setPinned: panelPins.setPinned,
		trackEntryClick: (attributes) => {
			ctx.get("productAnalytics")?.track("sidebar_menu_click", attributes);
		},
		hooks: {
			panels,
			shortcuts: ctx.shortcuts.catalog,
			entryPins: panelPins.unpinned,
			entryActions
		}
	});
	ctx.slots.inject("sidebar", () => ctx.slots.register({
		name: "sidebar",
		locale: NS,
		children: {
			"sidebar.brand.mark": {
				kind: "single",
				scope: "root"
			},
			"sidebar.brand.name": {
				kind: "single",
				scope: "root"
			},
			"sidebar.toggle.badge": {
				kind: "single",
				scope: "root"
			},
			"sidebar.panellist": {
				kind: "list",
				scope: "root"
			},
			"sidebar.panellist.actions": {
				kind: "list",
				scope: "root"
			},
			"sidebar.workspaces": {
				kind: "single",
				scope: "root"
			},
			"sidebar.settings": {
				kind: "single",
				scope: "root"
			},
			"sidebar.footer.action": {
				kind: "list",
				scope: "root"
			}
		},
		inject: injectProps
	}, SidebarRoot));
	ctx.slots.inject("shell.leading", () => ctx.slots.register({
		name: "shell.leading",
		locale: NS,
		inject: injectProps
	}, HeaderLeadingControls));
	syncPanels();
}
