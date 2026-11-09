// Extracted from @deepseek-ai/dsh-client-ui-sidebar-right (lib/client.js); region lib/types/client/persistence.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Validated current-layout snapshots; undo history belongs to the live window. */
		/** Persistence namespace shared by scoped stores and startup discovery. */
		const sidebarPersistence = "dsh.sidebar-right.v1";
		const paneId = zod.z.string().regex(/^(?:pane|float)[1-9][0-9]*$/u);
		const splitId = zod.z.string().regex(/^split[1-9][0-9]*$/u);
		const tabId = zod.z.string().regex(/^tab[1-9][0-9]*$/u);
		const nodeId = zod.z.union([paneId, splitId]);
		const rectangle = zod.z.object({
			x: zod.z.number(),
			y: zod.z.number(),
			width: zod.z.number().positive(),
			height: zod.z.number().positive()
		});
		const node = zod.z.discriminatedUnion("kind", [zod.z.object({
			kind: zod.z.literal("pane"),
			id: paneId,
			host: zod.z.enum(["dock", "float"]),
			tabs: zod.z.array(tabId),
			activeTabId: tabId.optional(),
			rect: rectangle.optional()
		}), zod.z.object({
			kind: zod.z.literal("split"),
			id: splitId,
			axis: zod.z.enum(["row", "column"]),
			children: zod.z.array(nodeId).min(2),
			sizes: zod.z.array(zod.z.number().positive()).min(2)
		})]);
		const layout = zod.z.object({
			nodes: zod.z.record(nodeId, node),
			tabs: zod.z.record(tabId, zod.z.object({
				id: tabId,
				kind: zod.z.string().min(1),
				contentId: zod.z.string().min(1),
				title: zod.z.string()
			})),
			rootId: nodeId,
			floats: zod.z.array(paneId),
			activePaneId: paneId,
			expanded: zod.z.boolean(),
			mode: zod.z.enum(["push", "fullscreen"])
		});
		const surface = zod.z.object({
			layout,
			minted: zod.z.int().nonnegative()
		});
		const envelope = zod.z.object({ bySession: zod.z.record(zod.z.string(), zod.z.unknown()) });
		function validateReferences(value) {
			const { layout, minted } = value;
			const reject = () => {
				throw new Error("Invalid saved sidebar layout references");
			};
			const visited = /* @__PURE__ */ new Set();
			const usedTabs = /* @__PURE__ */ new Set();
			const pending = [{
				id: layout.rootId,
				host: "dock"
			}, ...layout.floats.map((id) => ({
				id,
				host: "float"
			}))];
			for (const [id, entry] of [...Object.entries(layout.nodes), ...Object.entries(layout.tabs)]) if (entry.id !== id || Number(id.replace(/^[a-z]+/u, "")) > minted) reject();
			for (const { id, host } of pending) {
				const entry = layout.nodes[id];
				if (visited.has(id) || entry === void 0) reject();
				visited.add(id);
				if (entry.kind === "split") {
					if (host !== "dock" || id !== layout.rootId || entry.axis !== "row" || entry.children.length !== 2 || entry.children.length !== entry.sizes.length || Math.abs(entry.sizes.reduce((sum, size) => sum + size, 0) - 1) > 1e-9) reject();
					pending.push(...entry.children.map((id) => ({
						id,
						host
					})));
				} else {
					if (entry.host !== host || (host === "float" ? entry.rect === void 0 || entry.tabs.length !== 1 : entry.rect !== void 0)) reject();
					if (entry.tabs.length === 0 ? entry.activeTabId !== void 0 : !entry.tabs.includes(entry.activeTabId ?? "")) reject();
					for (const tab of entry.tabs) {
						if (usedTabs.has(tab) || layout.tabs[tab] === void 0) reject();
						usedTabs.add(tab);
					}
				}
			}
			if (visited.size !== Object.keys(layout.nodes).length || usedTabs.size !== Object.keys(layout.tabs).length || layout.nodes[layout.activePaneId]?.kind !== "pane") reject();
		}
		/**
		* Restore one validated Session layout with a fresh in-window undo history.
		* @param sessionId - storage scope.
		* @returns the saved surface, or undefined when absent, inaccessible or invalid.
		*/
		function readSidebarLayout(sessionId) {
			if (typeof localStorage === "undefined") return void 0;
			let raw;
			try {
				raw = localStorage.getItem(`${sidebarPersistence}.${sessionId}`);
			} catch (_storageUnavailable) {
				return;
			}
			if (raw === null) return void 0;
			try {
				const saved = envelope.parse(JSON.parse(raw)).bySession[sessionId];
				if (saved === void 0) return void 0;
				const parsed = surface.parse(saved);
				validateReferences(parsed);
				return {
					layout: parsed.layout,
					minted: parsed.minted,
					history: _deepseek_ai_dsh_client_ui_dockkit.EMPTY_HISTORY
				};
			} catch (_invalidLayout) {
				clearSidebarLayout(sessionId);
				return;
			}
		}
		/**
		* Persist current layout and identity allocation without retaining undo entries.
		* @param sessionId - storage scope.
		* @param surface - current in-memory surface.
		*/
		function writeSidebarLayout(sessionId, surface) {
			if (typeof localStorage === "undefined") return;
			const saved = { bySession: { [sessionId]: {
				layout: surface.layout,
				minted: surface.minted
			} } };
			try {
				localStorage.setItem(`${sidebarPersistence}.${sessionId}`, JSON.stringify(saved));
			} catch (error) {
				console.error("Sidebar layout persistence failed:", error);
			}
		}
		/**
		* Remove only one Session's persisted layout.
		* @param sessionId - storage scope to discard.
		*/
		function clearSidebarLayout(sessionId) {
			if (typeof localStorage === "undefined") return;
			try {
				localStorage.removeItem(`${sidebarPersistence}.${sessionId}`);
			} catch (_storageUnavailable) {}
		}
