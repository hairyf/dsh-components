// Extracted from @deepseek-ai/dsh-client-ui-sidebar-files (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** This package's copy namespace. */
		const NS = "sidebarFiles";
		/**
		* Required browser services: the tab registry, the keyed seat, the Remote
		* carrier and its namespace, and copy.
		*/
		const inject = [
			"slots",
			"locale",
			"sidebarRightTabs",
			"sidebarRight",
			"remote",
			"remote.workspaceFiles"
		];
		/**
		* Client plugin body: register the type, its shortcut, its dictionaries, the
		* navigator and toggle Factories, the page body, and its
		* chip title.
		* @param ctx - client root context carrying the registry, the slots, and the Remote face.
		*/
		function apply(ctx) {
			const t = ctx.locale.bind(NS);
			const handle = createFilesStore();
			const face = filesFace(createList(ctx.remote), createWatch(ctx.remote), canOpenOf(ctx.sidebarRightTabs), (sessionId, tabId) => {
				const source = ctx.sidebarRight.tabDomain.occurrence(sessionId, { id: tabId }).navigation;
				return {
					getSnapshot: () => source.getSnapshot(),
					subscribe: (listener) => ctx.effect(() => {
						let active = true;
						const unsubscribe = source.subscribe(() => {
							queueMicrotask(() => {
								if (active) listener();
							});
						});
						return () => {
							active = false;
							unsubscribe();
						};
					}, "ui-sidebar-files: tab navigation")
				};
			});
			const faces = /* @__PURE__ */ new WeakMap();
			const beside = /* @__PURE__ */ new Map();
			const place = (sessionId) => (tabId, bound) => {
				const tabs = beside.get(sessionId) ?? /* @__PURE__ */ new Map();
				beside.set(sessionId, tabs);
				const held = tabs.get(tabId);
				const entry = held?.face === bound ? held : {
					face: bound,
					placed: 0
				};
				entry.placed += 1;
				tabs.set(tabId, entry);
				let placed = true;
				return () => {
					if (!placed) return;
					placed = false;
					entry.placed -= 1;
					if (entry.placed > 0 || tabs.get(tabId) !== entry) return;
					tabs.delete(tabId);
					if (tabs.size === 0) beside.delete(sessionId);
				};
			};
			const store = {
				...handle,
				create: (scopeKey) => {
					const instance = handle.create(scopeKey);
					if (scopeKey === void 0) return instance;
					const sessionId = scopeKey;
					faces.set(instance.actions, face(sessionId, instance, place(sessionId)));
					return instance;
				}
			};
			const injectFace = (sessionId, actions) => {
				const bound = faces.get(actions);
				if (bound === void 0) throw new Error(`ui-sidebar-files: Session "${sessionId}" has no files store instance`);
				return bound;
			};
			ctx.inject(["shortcuts"], (ctx) => {
				ctx.effect(() => ctx.shortcuts.register({
					id: "workspace.files",
					label: () => t("guide.title"),
					aliases: ["workspace files", "files"],
					defaults: {
						"desktop:macos": {
							code: "KeyP",
							modifiers: ["primary"]
						},
						"desktop:windows": {
							code: "KeyP",
							modifiers: ["primary"]
						},
						"desktop:linux": {
							code: "KeyP",
							modifiers: ["primary"]
						},
						"web:macos": {
							code: "KeyP",
							modifiers: ["primary", "alt"]
						},
						"web:windows": {
							code: "KeyP",
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
								const placed = target.tabId === void 0 ? void 0 : beside.get(target.sessionId)?.get(target.tabId);
								if (target.host === "dock" && placed !== void 0) {
									if (!ctx.sidebarRight.isExpanded()) ctx.sidebarRight.toggleExpanded();
									placed.face.focus(target.paneId);
									return;
								}
								ctx.sidebarRight.openTabFromTarget(FILES_KIND, target);
							}
						};
					}
				}), "ui-sidebar-files: shortcut");
			});
			ctx.effect(() => ctx.sidebarRightTabs.register(filesDefinition(t)), "ui-sidebar-files: files type");
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-sidebar-files: dictionaries");
			ctx.effect(() => ctx.slots.registerFactory({
				name: "sidebar.files.tree",
				scope: "root",
				locale: NS,
				slots: { accessory: { scope: "root" } }
			}, FileTree), "ui-sidebar-files: tree factory");
			ctx.effect(() => ctx.slots.registerFactory({
				name: "sidebar.files.navigator",
				scope: "session",
				locale: NS,
				store,
				inject: injectFace
			}, FileNavigator), "ui-sidebar-files: navigator factory");
			ctx.effect(() => ctx.slots.registerFactory({
				name: "sidebar.files.navigator.toggle",
				scope: "session",
				locale: NS,
				store,
				inject: injectFace
			}, NavigatorToggle), "ui-sidebar-files: navigator toggle factory");
			ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
				name: "sidebar.right.pane.tab",
				key: FILES_ID,
				locale: NS,
				store,
				inject: injectFace,
				children: { "sidebar.right.tab.files.actions": {
					kind: "list",
					scope: "session"
				} }
			}, FilesBody)), "ui-sidebar-files: files tab body");
			ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab.title", () => ctx.slots.register({
				name: "sidebar.right.pane.tab.title",
				key: FILES_ID
			}, FilesTitle)), "ui-sidebar-files: files tab title");
		}
