// Extracted from @deepseek-ai/dsh-client-ui-sidebar-files (lib/client.js); region lib/types/client/face.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The box an element is laid out in: its nearest ancestor that generates one,
		* passing over wrappers drawn with `display: contents`.
		* @param element - the laid-out element.
		* @returns that ancestor, or `null` for a detached element.
		*/
		function layoutParent(element) {
			let parent = element.parentElement;
			while (parent !== null && getComputedStyle(parent).display === "contents") parent = parent.parentElement;
			return parent;
		}
		/**
		* Bind directory observation to the Remote stream supervisor.
		* @param remote - Client Remote with workspace file streams.
		* @returns a watcher that awaits stream disposal when its node ends.
		*/
		function createWatch(remote) {
			return async function* (sessionId, path, signal) {
				const aborted = () => signal.aborted;
				if (aborted()) return;
				const stream = remote.$stream({
					name: `directory ${path}`,
					open: (lifetime) => remote.workspaceFiles.changes(sessionId, path, lifetime),
					ended: () => /* @__PURE__ */ new Error(`Directory watch ended: ${path}`)
				});
				const abort = () => {
					stream.dispose();
				};
				signal.addEventListener("abort", abort, { once: true });
				try {
					for await (const item of stream) {
						if (aborted()) return;
						if (item.value.kind === "ready") item.accept();
						yield item.value.kind;
					}
				} finally {
					signal.removeEventListener("abort", abort);
					await stream.dispose();
				}
			};
		}
		/**
		* Bind the listing to one Remote face.
		* @param remote - the Client Remote face carrying the `workspaceFiles` namespace.
		* @returns the listing the tree's face performs.
		*/
		function createList(remote) {
			return async (sessionId, path, signal) => {
				const result = await remote.workspaceFiles.list(sessionId, path, signal);
				if (!result.ok) return result;
				return {
					ok: true,
					value: {
						entries: result.value.entries,
						truncated: result.value.truncated
					}
				};
			};
		}
		/**
		* Observe whether any registered tab type can open an address.
		* @param registry - the right Sidebar's tab type registry.
		* @returns a source whose snapshot is a predicate, replaced whenever registrations change.
		*/
		function canOpenOf(registry) {
			let seen = registry.entries();
			let check = (address) => registry.candidates(address).length > 0;
			return {
				getSnapshot: () => {
					const entries = registry.entries();
					if (entries !== seen) {
						seen = entries;
						check = (address) => registry.candidates(address).length > 0;
					}
					return check;
				},
				subscribe: (listener) => registry.subscribe(listener)
			};
		}
		/** `focus` asked for the tree's keyboard focus. */
		const REQUESTED = {};
		/**
		* Bind the tree's face to one directory listing.
		* @param list - the bound `workspaceFiles.list` call.
		* @param watch - target-scoped directory observation.
		* @param canOpen - whether some tab type can open an address.
		* @param navigationOf - the attached tab's navigation; subscriptions end with this plugin or their disposer.
		* @returns the face factory: session, its store instance, and where to place the face beside tabs in, face out.
		*/
		function filesFace(list, watch, canOpen, navigationOf) {
			return (sessionId, store, place) => {
				const { actions } = store;
				const panes = /* @__PURE__ */ new Map();
				const record = (paneId) => {
					let pane = panes.get(paneId);
					if (pane === void 0) {
						pane = {
							lifetime: void 0,
							mounts: 0,
							tabs: /* @__PURE__ */ new Set(),
							holds: 0,
							root: void 0,
							scrollTop: 0,
							revealed: void 0,
							revealing: void 0,
							drawn: void 0,
							current: void 0,
							scrollToCurrent: false,
							focus: void 0,
							show: false,
							width: (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(void 0),
							navigator: void 0,
							closable: false,
							unobserve: void 0,
							toggle: void 0
						};
						panes.set(paneId, pane);
					}
					return pane;
				};
				/** Each open tab's latest pane. */
				const homes = /* @__PURE__ */ new Map();
				const forget = (paneId, pane) => {
					pane.lifetime?.abort();
					pane.root?.close();
					pane.root = void 0;
					pane.unobserve?.();
					panes.delete(paneId);
					actions.forget(paneId);
				};
				const settle = (paneId, pane) => {
					if (pane.mounts > 0 || pane.tabs.size > 0) return;
					queueMicrotask(() => {
						if (pane.mounts === 0 && pane.tabs.size === 0 && panes.get(paneId) === pane) forget(paneId, pane);
					});
				};
				const leave = (tabId, home) => {
					home.pane.tabs.delete(tabId);
					settle(home.paneId, home.pane);
				};
				const load = async (paneId, path, signal) => {
					const aborted = () => signal.aborted;
					if (aborted()) return void 0;
					actions.loading(paneId, path);
					const result = await list(sessionId, path, signal);
					if (aborted()) return void 0;
					if (result.ok) actions.loaded(paneId, path, result.value);
					else actions.failed(paneId, path, result.error);
					return result.ok ? result.value : void 0;
				};
				let batching = false;
				const batch = (write) => {
					batching = true;
					try {
						write();
					} finally {
						batching = false;
					}
				};
				const relisting = (paneId, paths) => {
					for (const path of paths) if (store.getSnapshot().byPane[paneId]?.tree?.levels[path]?.kind === "ready") actions.loading(paneId, path);
				};
				const drop = (paneId) => {
					const pane = panes.get(paneId);
					if (pane !== void 0 && pane.lifetime === void 0) settle(paneId, pane);
				};
				const expand = (paneId, parentPath, path, expanded, manual) => {
					const pane = panes.get(paneId);
					const root = pane?.root;
					if (pane === void 0 || root === void 0) return;
					const parent = root.find(parentPath);
					if (parent === void 0 && !expanded.includes(parentPath)) return;
					const collapsing = expanded.includes(path);
					if (manual && collapsing && pane.revealing !== void 0) {
						pane.revealed = pane.revealing;
						pane.revealing = void 0;
					}
					const next = collapsing ? expanded.filter((value) => value !== path) : [...expanded, path];
					root.setExpanded(next);
					if (collapsing) parent?.collapse(path);
					else parent?.expand(path, next);
					batch(() => {
						actions.toggled(paneId, path);
						if (!collapsing) relisting(paneId, next.filter((value) => value === path || value.startsWith(childPath(path, ""))));
					});
					reveal();
				};
				const focusTree = (pane) => {
					const handoff = {};
					pane.focus = handoff;
					queueMicrotask(() => {
						if (pane.focus !== handoff) return;
						pane.focus = void 0;
						(pane.current ?? pane.drawn?.body)?.focus();
					});
				};
				const step = (paneId, pane) => {
					const address = pane.revealing;
					const tree = store.getSnapshot().byPane[paneId]?.tree;
					if (address === void 0 || tree === void 0 || pane.root === void 0) return;
					const path = relativeFileOf(address, sessionId, tree.root);
					const location = path === void 0 ? void 0 : locateFile(tree, path);
					const next = location?.ancestors.find((ancestor) => !tree.expanded.includes(ancestor.path));
					if (next !== void 0) {
						expand(paneId, next.parent, next.path, tree.expanded, false);
						return;
					}
					if (location?.pending === true) return;
					pane.revealing = void 0;
					pane.revealed = address;
					if (location?.current === void 0) return;
					if (pane.current === void 0) pane.scrollToCurrent = true;
					else pane.current.scrollIntoView({
						block: "nearest",
						inline: "nearest"
					});
				};
				const reveal = () => {
					for (const [paneId, pane] of panes) if (pane.revealing !== void 0) step(paneId, pane);
				};
				store.subscribe(() => {
					if (!batching) reveal();
				});
				const open = (paneId, pane, signal, root) => {
					if (pane.root?.path === root) return;
					pane.root?.close();
					const tree = store.getSnapshot().byPane[paneId]?.tree;
					const kept = tree?.root === root ? tree : void 0;
					if (kept === void 0) {
						actions.start(paneId, root);
						pane.scrollTop = 0;
						pane.revealed = void 0;
						pane.revealing = pane.drawn?.address;
					}
					const node = new DirectoryNode(root, (path, lifetime) => load(paneId, path, lifetime), (path, lifetime) => watch(sessionId, path, lifetime), (path, error) => {
						if (pane.root === node) actions.failed(paneId, path, new RemoteError("gateway/internal", error instanceof Error ? error.message : String(error), {}));
					}, signal, kept?.expanded);
					if (kept !== void 0) node.setAutomatic(kept.autoRefresh);
					pane.root = node;
					node.open();
					if (kept !== void 0) batch(() => {
						relisting(paneId, kept.expanded);
					});
					step(paneId, pane);
				};
				const answerNavigation = (home) => {
					if (home.mounts === 0) return;
					const navigation = home.navigation.getSnapshot();
					if (navigation.revision <= home.revision) return;
					const { pane, paneId } = home;
					if (store.getSnapshot().byPane[paneId]?.open !== true) {
						home.revision = navigation.revision;
						return;
					}
					const navigator = pane.navigator;
					if (navigator === void 0 || pane.drawn?.address !== navigation.address) return;
					const row = layoutParent(navigator);
					if (row === null) return;
					home.revision = navigation.revision;
					const window = row.ownerDocument.defaultView;
					if (pane.closable && (row.getBoundingClientRect().width < 400 || typeof window?.matchMedia === "function" && window.matchMedia("(width < 768px)").matches)) face.hide(paneId);
				};
				const answerDrawn = (pane) => {
					for (const home of homes.values()) if (home.pane === pane) answerNavigation(home);
				};
				const face = {
					attach(paneId, tabId, tabSignal) {
						if (tabSignal.aborted) {
							drop(paneId);
							return () => {};
						}
						const pane = record(paneId);
						pane.lifetime ??= new AbortController();
						if (pane.show) {
							pane.show = false;
							actions.shown(paneId, true);
						}
						pane.mounts += 1;
						let home = homes.get(tabId);
						if (home === void 0) {
							const first = {
								paneId,
								pane,
								mounts: 0,
								revision: 0,
								navigation: navigationOf(sessionId, tabId)
							};
							home = first;
							homes.set(tabId, first);
							const unsubscribe = first.navigation.subscribe(() => {
								answerNavigation(first);
							});
							tabSignal.addEventListener("abort", () => {
								unsubscribe();
								homes.delete(tabId);
								leave(tabId, first);
							}, { once: true });
						} else if (home.pane !== pane) {
							leave(tabId, home);
							home.paneId = paneId;
							home.pane = pane;
						}
						home.mounts += 1;
						pane.tabs.add(tabId);
						answerNavigation(home);
						let attached = true;
						return () => {
							if (!attached) return;
							attached = false;
							pane.mounts -= 1;
							home.mounts -= 1;
							settle(paneId, pane);
						};
					},
					placeBeside: (tabId) => place(tabId, face),
					hold(paneId, root) {
						const pane = panes.get(paneId);
						if (pane?.lifetime === void 0) return () => {};
						pane.holds += 1;
						open(paneId, pane, pane.lifetime.signal, root);
						let held = true;
						return () => {
							if (!held) return;
							held = false;
							pane.holds -= 1;
							queueMicrotask(() => {
								if (pane.holds > 0) return;
								pane.root?.close();
								pane.root = void 0;
							});
						};
					},
					refresh: (paneId) => {
						panes.get(paneId)?.root?.refreshTree();
					},
					setAutoRefresh: (paneId, enabled) => {
						actions.autoRefresh(paneId, enabled);
						panes.get(paneId)?.root?.setAutomatic(enabled);
					},
					toggle: (paneId, parentPath, path, expanded) => {
						expand(paneId, parentPath, path, expanded, true);
					},
					scrolled: (paneId, scrollTop) => {
						const pane = panes.get(paneId);
						if (pane?.lifetime !== void 0) pane.scrollTop = scrollTop;
					},
					hide(paneId) {
						const pane = panes.get(paneId);
						if (pane?.lifetime === void 0) return;
						const navigator = pane.navigator;
						const held = pane.focus !== void 0 || navigator?.contains(navigator.ownerDocument.activeElement) === true;
						pane.focus = void 0;
						actions.shown(paneId, false);
						if (held) queueMicrotask(() => {
							panes.get(paneId)?.toggle?.focus();
						});
					},
					focus(paneId) {
						const pane = panes.get(paneId);
						if (pane === void 0) return;
						if (pane.lifetime === void 0) pane.show = true;
						else actions.shown(paneId, true);
						if (pane.drawn === void 0) pane.focus = REQUESTED;
						else focusTree(pane);
					},
					bodyDrawn(paneId, address, body) {
						if (body === null) {
							const pane = panes.get(paneId);
							if (pane === void 0) return;
							const gone = pane.drawn?.body;
							pane.drawn = void 0;
							pane.revealing = void 0;
							pane.scrollToCurrent = false;
							drop(paneId);
							if (gone?.contains(gone.ownerDocument.activeElement) !== true) return;
							const handoff = {};
							pane.focus = handoff;
							queueMicrotask(() => {
								if (pane.focus === handoff) pane.focus = void 0;
							});
							return;
						}
						const pane = record(paneId);
						pane.drawn = {
							body,
							address
						};
						body.scrollTop = pane.scrollTop;
						if (pane.focus !== void 0) focusTree(pane);
						pane.revealing = pane.revealed === address ? void 0 : address;
						step(paneId, pane);
					},
					currentDrawn(paneId, row) {
						if (row === null) {
							const pane = panes.get(paneId);
							if (pane !== void 0) pane.current = void 0;
							drop(paneId);
							return;
						}
						const pane = record(paneId);
						pane.current = row;
						if (!pane.scrollToCurrent) return;
						pane.scrollToCurrent = false;
						row.scrollIntoView({
							block: "nearest",
							inline: "nearest"
						});
					},
					navigatorDrawn(paneId, navigator, closable) {
						const pane = navigator === null ? panes.get(paneId) : record(paneId);
						if (pane === void 0) return;
						pane.unobserve?.();
						pane.unobserve = void 0;
						pane.navigator = navigator ?? void 0;
						pane.closable = closable;
						if (navigator === null) {
							drop(paneId);
							return;
						}
						const row = layoutParent(navigator);
						if (row === null) return;
						const document = row.ownerDocument;
						let edge;
						const handOff = () => {
							const held = edge;
							if (held === void 0) return;
							const active = document.activeElement;
							if (active !== held && active !== document.body && active !== null) {
								edge = void 0;
								return;
							}
							if (held.isConnected && getComputedStyle(held).display !== "none") {
								if (active !== held) edge = void 0;
								return;
							}
							edge = void 0;
							focusTree(pane);
						};
						const focusin = (event) => {
							edge = event.target instanceof Element && event.target.hasAttribute("data-files-navigator-resize") ? event.target : void 0;
						};
						const focusout = (event) => {
							if (event.relatedTarget === null) queueMicrotask(handOff);
							else edge = void 0;
						};
						const viewport = closable && typeof matchMedia === "function" ? matchMedia(FULLSCREEN_QUERY) : void 0;
						let filling = false;
						const hidden = (element) => getComputedStyle(element).visibility === "hidden";
						let covered;
						const release = (event) => {
							const target = event.target;
							covered = event.relatedTarget === null && target instanceof Element && !navigator.contains(target) && hidden(target) ? target : void 0;
						};
						const forget = () => {
							covered = void 0;
						};
						const measure = () => {
							const active = document.activeElement;
							const blurred = covered;
							covered = void 0;
							const width = row.getBoundingClientRect().width;
							const fills = closable && (width < 400 || viewport?.matches === true);
							const entering = fills && !filling;
							filling = fills;
							pane.width.set(width);
							answerDrawn(pane);
							const inContent = active !== null && row.contains(active) && !navigator.contains(active);
							const blurredByFill = blurred !== void 0 && (active === null || active === document.body) && row.contains(blurred) && hidden(blurred);
							if (entering && store.getSnapshot().byPane[paneId]?.open === true && (inContent || blurredByFill) && pane.focus === void 0) focusTree(pane);
							if (edge !== void 0) queueMicrotask(handOff);
						};
						const close = (event) => {
							if (event.key !== "Escape" || event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
							if (!(event.target instanceof Node) || !row.contains(event.target)) return;
							event.preventDefault();
							pane.toggle?.focus();
							actions.shown(paneId, false);
						};
						measure();
						const observer = new ResizeObserver(measure);
						observer.observe(row);
						viewport?.addEventListener("change", measure);
						if (closable) {
							document.addEventListener("keydown", close);
							row.addEventListener("focusout", release);
							document.addEventListener("focusin", forget, true);
							document.addEventListener("pointerdown", forget, true);
							window.addEventListener("blur", forget);
						}
						navigator.addEventListener("focusin", focusin);
						navigator.addEventListener("focusout", focusout);
						pane.unobserve = () => {
							observer.disconnect();
							viewport?.removeEventListener("change", measure);
							document.removeEventListener("keydown", close);
							row.removeEventListener("focusout", release);
							document.removeEventListener("focusin", forget, true);
							document.removeEventListener("pointerdown", forget, true);
							window.removeEventListener("blur", forget);
							navigator.removeEventListener("focusin", focusin);
							navigator.removeEventListener("focusout", focusout);
						};
					},
					toggleDrawn(paneId, toggle) {
						if (toggle !== null) {
							record(paneId).toggle = toggle;
							return;
						}
						const pane = panes.get(paneId);
						if (pane !== void 0) pane.toggle = void 0;
						drop(paneId);
					},
					hooks: { canOpen },
					keyedHooks: { rowWidth: (paneId) => record(paneId).width }
				};
				return face;
			};
		}
