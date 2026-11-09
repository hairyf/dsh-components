// Extracted from @deepseek-ai/dsh-client-ui-sidebar-files (lib/client.js); region lib/types/client/FileNavigator.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* One pane's workspace navigator: the tree and the edge that resizes it. The
		* `files` page draws it below its header; beside a preview the preview's own
		* header is the only one. Everything it shows lives in the store and face,
		* keyed by pane, so a remount on a tab switch or replacement draws it
		* unchanged, keyboard focus included when the tree held it. Its layout
		* follows `PUSH_FROM`, `FILL_BELOW`, and `FULLSCREEN_QUERY`; the package
		* README describes its behavior.
		*/
		/** One keyboard resize step. */
		const RESIZE_STEP = 20;
		/**
		* The layout a preview's navigator takes in a row; `FULLSCREEN_QUERY` makes every layout fill in CSS.
		* @param rowWidth - the row's width measured by the face; `undefined` before it is measured.
		* @returns `overlay` until measured, then the layout for the width.
		*/
		function navigatorMode(rowWidth) {
			if (rowWidth === void 0) return "overlay";
			return rowWidth >= 560 ? "push" : rowWidth >= 400 ? "overlay" : "fill";
		}
		/**
		* The navigator Factory's component.
		* @param props - the tab it is drawn for, the pane's store records, the tree's face, and copy.
		* @returns the navigator, or nothing while hidden or without a workspace.
		*/
		function FileNavigator({ useTabInfo, page, onOpen, sessionId, useSessions, useStore, actions, useRowWidth, useCanOpen, attach, placeBeside, hold, toggle, scrolled, bodyDrawn, currentDrawn, navigatorDrawn, t, renderFactorySlot, useContextMenu }) {
			const { tab, panel } = useTabInfo();
			const { getTriggerProps } = useContextMenu();
			const paneId = panel.id;
			const cwd = useSessions((sessions) => sessions.byId[sessionId]?.cwd);
			const state = useStore((store) => store.byPane[paneId]);
			const rowWidth = useRowWidth(paneId);
			const canOpen = useCanOpen((check) => check);
			const open = page || state?.open === true;
			const mode = navigatorMode(rowWidth);
			const tree = state?.tree?.root === cwd ? state?.tree : void 0;
			const [dragging, setDragging] = (0, react.useState)(false);
			const drag = (0, react.useRef)(void 0);
			const navigatorRef = (0, react.useCallback)((element) => {
				navigatorDrawn(paneId, element, !page);
			}, [
				navigatorDrawn,
				paneId,
				page
			]);
			const bodyRef = (0, react.useCallback)((body) => {
				bodyDrawn(paneId, tab.contentId, body);
			}, [
				bodyDrawn,
				paneId,
				tab.contentId
			]);
			const currentRef = (0, react.useCallback)((row) => {
				currentDrawn(paneId, row);
			}, [currentDrawn, paneId]);
			(0, react.useEffect)(() => attach(paneId, tab.id, tab.signal), [
				attach,
				paneId,
				tab.id,
				tab.signal
			]);
			(0, react.useEffect)(() => page || cwd === void 0 ? void 0 : placeBeside(tab.id), [
				page,
				cwd,
				placeBeside,
				tab.id
			]);
			(0, react.useEffect)(() => cwd === void 0 || !open ? void 0 : hold(paneId, cwd), [
				cwd,
				open,
				paneId,
				hold
			]);
			const relativePath = tree === void 0 ? void 0 : relativeFileOf(tab.contentId, sessionId, tree.root);
			const location = (0, react.useMemo)(() => tree === void 0 || relativePath === void 0 ? void 0 : locateFile(tree, relativePath), [tree, relativePath]);
			const root = tree?.root;
			const levels = tree?.levels;
			const expanded = tree?.expanded;
			const entries = (0, react.useMemo)(() => levels === void 0 ? void 0 : workspaceEntries(levels), [levels]);
			const directories = (0, react.useMemo)(() => root === void 0 || levels === void 0 || expanded === void 0 ? void 0 : workspaceDirectories({
				root,
				levels,
				expanded
			}, t), [
				root,
				levels,
				expanded,
				t
			]);
			const view = (0, react.useMemo)(() => {
				if (tree === void 0) return void 0;
				return {
					root: treeRootOf(tree.root),
					expanded: tree.expanded,
					onToggle: (entry) => {
						toggle(paneId, parentOf(tree, entry.path), entry.path, tree.expanded);
					},
					onOpen: (entry) => {
						onOpen(fileAddressFor(sessionId, tree.root, entry.path));
					},
					canOpen: (entry) => canOpen(fileAddressFor(sessionId, tree.root, entry.path)),
					rowTriggerProps: (entry, kind) => getTriggerProps(kind === "directory" ? {
						kind,
						value: {
							sessionId,
							path: entry.path
						}
					} : {
						kind,
						value: {
							sessionId,
							path: entry.path,
							paneId
						}
					})
				};
			}, [
				tree,
				paneId,
				sessionId,
				toggle,
				canOpen,
				onOpen,
				getTriggerProps
			]);
			if (cwd === void 0 || !open) return null;
			const geometry = navigatorGeometry(rowWidth, state?.width ?? 260);
			const shown = page ? void 0 : mode;
			const clamp = (next) => Math.min(Math.max(next, geometry.minimum), geometry.maximum);
			return (0, react_jsx_runtime.jsxs)("aside", {
				ref: navigatorRef,
				className: clsx(FilesBody_module_css_default.navigator, shown === void 0 ? FilesBody_module_css_default.wholePage : FilesBody_module_css_default[shown], dragging && FilesBody_module_css_default.dragging),
				style: page ? void 0 : { "--files-navigator-width": `${geometry.width}px` },
				"aria-label": t("guide.title"),
				"data-files-navigator": paneId,
				"data-files-navigator-mode": shown,
				"data-files-state": "tree",
				"data-files-root": cwd,
				children: [shown !== void 0 && shown !== "fill" && (0, react_jsx_runtime.jsx)("div", {
					className: FilesBody_module_css_default.separator,
					role: "separator",
					"aria-orientation": "vertical",
					"aria-label": t("navigator.resize"),
					"aria-valuemin": geometry.minimum,
					"aria-valuemax": geometry.maximum,
					"aria-valuenow": geometry.width,
					tabIndex: 0,
					"data-files-navigator-resize": true,
					onKeyDown: (event) => {
						const next = event.key === "ArrowLeft" ? geometry.width + RESIZE_STEP : event.key === "ArrowRight" ? geometry.width - RESIZE_STEP : event.key === "Home" ? geometry.minimum : event.key === "End" ? geometry.maximum : void 0;
						if (next === void 0) return;
						event.preventDefault();
						actions.resized(paneId, clamp(next));
					},
					onPointerDown: (event) => {
						if (event.button !== 0) return;
						event.preventDefault();
						event.currentTarget.setPointerCapture(event.pointerId);
						drag.current = {
							x: event.clientX,
							width: geometry.width
						};
						setDragging(true);
					},
					onPointerMove: (event) => {
						const origin = drag.current;
						if (origin === void 0) return;
						actions.resized(paneId, clamp(origin.width + origin.x - event.clientX));
					},
					onPointerUp: (event) => {
						event.currentTarget.releasePointerCapture(event.pointerId);
					},
					onLostPointerCapture: () => {
						drag.current = void 0;
						setDragging(false);
					}
				}), (0, react_jsx_runtime.jsx)("div", {
					ref: bodyRef,
					className: FilesBody_module_css_default.body,
					tabIndex: -1,
					"data-files-body": true,
					onScroll: (event) => {
						scrolled(paneId, event.currentTarget.scrollTop);
					},
					children: view === void 0 || entries === void 0 || directories === void 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: FilesBody_module_css_default.note,
						"data-files-row": "loading",
						children: t("loading")
					}) : renderFactorySlot("sidebar.files.tree", {
						...view,
						entries,
						directories,
						current: location?.current,
						currentRef
					})
				})]
			});
		}
