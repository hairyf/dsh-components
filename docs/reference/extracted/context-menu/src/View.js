// Extracted from @deepseek-ai/dsh-client-ui-context-menu (lib/client.js); region lib/types/client/View.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Shared Web renderer for Client menu contributions. */
		/**
		* @param actions - plain presentation.
		* @param catalog - effective user shortcuts.
		* @param renderSlot - owner-authorized keyed icon renderer.
		* @returns Existing Menu entries.
		*/
		function menuEntries(actions, catalog, renderSlot) {
			return actions.flatMap((action) => {
				const shortcut = catalog.find((entry) => entry.id === action.commandId);
				const item = {
					id: action.id,
					label: action.label,
					...shortcut === void 0 ? {} : { shortcut },
					...action.disabled === void 0 ? {} : { disabled: action.disabled },
					...action.danger === void 0 ? {} : { danger: action.danger },
					...action.icon === void 0 ? {} : { icon: renderSlot("contextMenu.icon", { icon: action.icon }, { entryKey: action.icon.key }) },
					...action.children === void 0 ? {} : { submenu: menuEntries(action.children, catalog, renderSlot) }
				};
				return action.separatorBefore ? [{
					type: "separator",
					id: `${action.id}:separator`
				}, item] : [item];
			});
		}
		/** @param props - registered state, target-specific legacy rows, and actions. @returns one menu and persistent feedback. */
		function MenuOverlay({ useStore, actions, renderSlot, close, select, returnFocus, useCatalog }) {
			const catalog = useCatalog((value) => value);
			const { target, point, items, notice, occurrence, closing, replacing } = useStore((s) => s);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
				open: target !== null,
				anchor: null,
				portal: true,
				autoFocus: true,
				contextual: true,
				returnFocus,
				exiting: closing ? replacing ? "replace" : "dismiss" : void 0,
				getAnchorRect: () => new DOMRect(point.x, point.y, 0, 0),
				items: menuEntries(items.filter((item) => !item.afterContent), catalog, renderSlot),
				footer: menuEntries(items.filter((item) => item.afterContent), catalog, renderSlot),
				onClose: close,
				onSelect: select,
				children: target !== null && renderSlot("contextMenu.content", {
					target,
					dismiss: close
				}, { entryKey: target.kind })
			}, occurrence), notice !== null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
				text: notice.text,
				...notice.action === void 0 ? {} : { actions: [notice.action] },
				...notice.success ? { tone: "success" } : {},
				onDone: () => {
					actions.notify(null);
				}
			}, notice.id)] });
		}
