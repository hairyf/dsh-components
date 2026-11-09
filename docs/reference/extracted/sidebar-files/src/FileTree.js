// Extracted from @deepseek-ai/dsh-client-ui-sidebar-files (lib/client.js); region lib/types/client/FileTree.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* A controlled file tree Component Factory over flat entries. The caller owns
		* the data, which directories are expanded, each directory's listing
		* state, and what a click does; the tree derives each entry's level from its
		* path, adds the directories the paths imply, orders every drawn level, and
		* draws the rows and their icons. It redraws when its
		* props or the occurrence's local selection change, and orders a drawn level
		* again only when the names or directory kinds in that level change.
		*/
		/** No row accessory unless the caller selects a local Component. */
		function EmptyAccessory() {
			return null;
		}
		/** Natural, case-insensitive name order, so `file2` precedes `file10`. */
		const byName = new Intl.Collator(void 0, {
			numeric: true,
			sensitivity: "base"
		});
		/**
		* The key of the level an entry is listed in.
		* @param path - the entry's key.
		* @param root - the root's key.
		* @returns the part of `path` before its last `/`, or `root` when it has none.
		*/
		function parentOf$1(path, root) {
			const slash = path.lastIndexOf("/");
			return slash < 0 ? root : path.slice(0, slash);
		}
		/**
		* Group entries under their parent keys, adding the directories their paths imply.
		* @param entries - the caller's entries; a repeated `path` keeps its first entry.
		* @param root - the root's key.
		* @returns each parent key's children.
		*/
		function levelsOf(entries, root) {
			const byPath = /* @__PURE__ */ new Map();
			for (const entry of entries) if (entry.path !== root && !byPath.has(entry.path)) byPath.set(entry.path, entry);
			for (const entry of entries) {
				if (entry.path === root) continue;
				for (let parent = parentOf$1(entry.path, root); parent !== root && parent !== "" && !byPath.has(parent); parent = parentOf$1(parent, root)) byPath.set(parent, {
					path: parent,
					name: parent.slice(parent.lastIndexOf("/") + 1),
					meta: { kind: "directory" }
				});
			}
			const groups = /* @__PURE__ */ new Map();
			for (const entry of byPath.values()) {
				const parent = parentOf$1(entry.path, root);
				const group = groups.get(parent);
				if (group === void 0) groups.set(parent, [entry]);
				else group.push(entry);
			}
			const levels = /* @__PURE__ */ new Map();
			for (const [parent, group] of groups) levels.set(parent, group.map((entry) => ({
				entry,
				kind: entry.meta?.kind ?? (groups.has(entry.path) ? "directory" : "file")
			})));
			return levels;
		}
		/**
		* One level's display order: directories first, then everything else, each by name.
		* @param level - one parent key's children.
		* @returns the children's indices in display order.
		*/
		function orderOf(level) {
			return level.map((node, index) => ({
				node,
				index
			})).sort(({ node: left }, { node: right }) => {
				const group = Number(right.kind === "directory") - Number(left.kind === "directory");
				return group !== 0 ? group : byName.compare(left.entry.name, right.entry.name);
			}).map(({ index }) => index);
		}
		/** One entry's row, and its children when it is an expanded directory. */
		function Entry({ node, tree }) {
			const { input, Accessory } = tree;
			const { entry, kind } = node;
			const hidden = entry.meta?.hidden === true && FileTree_module_css_default.hidden;
			const label = (0, react_jsx_runtime.jsx)("span", {
				className: FileTree_module_css_default.name,
				children: entry.name
			});
			if (kind === "directory") {
				const expanded = tree.expanded.has(entry.path);
				return (0, react_jsx_runtime.jsxs)("li", {
					className: FileTree_module_css_default.item,
					"data-files-entry": "directory",
					"data-files-path": entry.path,
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: FileTree_module_css_default.row,
						children: [(0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: clsx(FileTree_module_css_default.action, hidden),
							"aria-expanded": expanded,
							onClick: () => {
								input.onToggle(entry, !expanded);
							},
							...input.rowTriggerProps?.(entry, "directory"),
							children: [expanded ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpenRegular, { className: FileTree_module_css_default.icon }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderCloseRegular, { className: FileTree_module_css_default.icon }), label]
						}), (0, react_jsx_runtime.jsx)("div", {
							className: FileTree_module_css_default.accessory,
							children: (0, react_jsx_runtime.jsx)(Accessory, { entry })
						})]
					}), expanded && (0, react_jsx_runtime.jsx)("ul", {
						className: FileTree_module_css_default.level,
						children: (0, react_jsx_runtime.jsx)(Level, {
							path: entry.path,
							tree
						})
					})]
				});
			}
			if (kind === "file" && input.canOpen?.(entry) !== false) {
				const current = entry.path === input.current;
				return (0, react_jsx_runtime.jsx)("li", {
					className: FileTree_module_css_default.item,
					"data-files-entry": "file",
					"data-files-path": entry.path,
					children: (0, react_jsx_runtime.jsxs)("div", {
						className: clsx(FileTree_module_css_default.row, current && FileTree_module_css_default.current),
						children: [(0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: clsx(FileTree_module_css_default.action, hidden),
							"aria-current": current || void 0,
							ref: current ? input.currentRef : void 0,
							...input.rowTriggerProps?.(entry, "file"),
							onClick: () => {
								input.onOpen(entry);
							},
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
								kind: (0, _deepseek_ai_dsh_client_ui_primitives.classifyFileType)(entry.name),
								size: 16,
								className: FileTree_module_css_default.fileIcon
							}), label]
						}), (0, react_jsx_runtime.jsx)("div", {
							className: FileTree_module_css_default.accessory,
							children: (0, react_jsx_runtime.jsx)(Accessory, { entry })
						})]
					})
				});
			}
			const file = kind === "file";
			return (0, react_jsx_runtime.jsx)("li", {
				className: FileTree_module_css_default.item,
				"data-files-entry": kind,
				"data-files-path": entry.path,
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: clsx(FileTree_module_css_default.row, FileTree_module_css_default.inactive),
					children: [(0, react_jsx_runtime.jsxs)("span", {
						className: clsx(FileTree_module_css_default.action, hidden, FileTree_module_css_default.other),
						"aria-disabled": "true",
						title: tree.t(file ? "entry.noViewer" : "entry.other"),
						children: [file && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
							kind: (0, _deepseek_ai_dsh_client_ui_primitives.classifyFileType)(entry.name),
							size: 16,
							className: FileTree_module_css_default.fileIcon
						}), label]
					}), (0, react_jsx_runtime.jsx)("div", {
						className: FileTree_module_css_default.accessory,
						children: (0, react_jsx_runtime.jsx)(Accessory, { entry })
					})]
				})
			});
		}
		/** No entries, shared so that an empty level orders nothing. */
		const NO_ENTRIES = [];
		/** One directory's rows: a loading line until it is listed, then its entries and notes. */
		function Level({ path, tree }) {
			const { t } = tree;
			const state = tree.input.directories?.[path];
			const level = tree.levels.get(path) ?? NO_ENTRIES;
			const order = (0, react.useMemo)(() => orderOf(level), [JSON.stringify(level.map((node) => [node.kind === "directory", node.entry.name]))]);
			if (state?.loading === true) return (0, react_jsx_runtime.jsx)("li", {
				className: FileTree_module_css_default.note,
				"data-files-row": "loading",
				children: t("loading")
			});
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				state?.failure !== void 0 && (0, react_jsx_runtime.jsx)("li", {
					className: FileTree_module_css_default.note,
					"data-files-row": "failed",
					children: state.failure
				}),
				level.length === 0 && state?.failure === void 0 && (0, react_jsx_runtime.jsx)("li", {
					className: FileTree_module_css_default.note,
					"data-files-row": "empty",
					children: t("empty")
				}),
				order.map((index) => level[index]).filter((node) => node !== void 0).map((node) => (0, react_jsx_runtime.jsx)(Entry, {
					node,
					tree
				}, node.entry.path)),
				state?.truncated === true && (0, react_jsx_runtime.jsx)("li", {
					className: FileTree_module_css_default.note,
					"data-files-row": "truncated",
					children: t("truncated")
				})
			] });
		}
		/**
		* The tree from its root.
		* @param props - the caller's entries, expansion, states, callbacks, and framework seats.
		* @returns the root level's list.
		*/
		function FileTreeView({ t, useFactorySlot, ...input }) {
			const Accessory = useFactorySlot("accessory", EmptyAccessory);
			const tree = {
				levels: (0, react.useMemo)(() => levelsOf(input.entries, input.root), [input.entries, input.root]),
				expanded: (0, react.useMemo)(() => new Set(input.expanded), [input.expanded]),
				input,
				t,
				Accessory
			};
			return (0, react_jsx_runtime.jsx)("ul", {
				className: FileTree_module_css_default.level,
				children: (0, react_jsx_runtime.jsx)(Level, {
					path: input.root,
					tree
				})
			});
		}
		/**
		* The file tree. It redraws when a prop or the occurrence's local selection
		* changes, so a caller keeps its inputs and local selection stable between renders.
		*/
		const FileTree = (0, react.memo)(FileTreeView);
