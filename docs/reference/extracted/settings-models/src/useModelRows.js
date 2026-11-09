// Extracted from @deepseek-ai/dsh-client-ui-settings-models (lib/client.js); region lib/types/client/useModelRows.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Local model-row identities, disclosures, capacity text, and draft ordering. */
/** One editor-local identity; editing a model ID never replaces its controls. */
function createRow(key) {
	return {
		key,
		expanded: false,
		editing: /* @__PURE__ */ new Map()
	};
}
/**
* Keep row state with its model through draft moves and removals.
* @param models - current draft array, owned by the provider card.
* @param onChange - replaces only that card's draft array.
* @param disabled - prevents reordering while the card cannot be edited.
* @returns row state and local editing and ordering actions.
*/
function useModelRows(models, onChange, disabled) {
	const nextKey = (0, react.useRef)(0);
	const [stored, setRows] = (0, react.useState)(() => models.map(() => createRow(nextKey.current++)));
	const [dragged, setDragged] = (0, react.useState)();
	const [target, setTarget] = (0, react.useState)();
	const entries = models.map((model, index) => ({
		model,
		state: stored[index] ?? createRow(nextKey.current++)
	}));
	const rows = entries.map((entry) => entry.state);
	if (stored.length !== models.length) setRows(rows);
	const endDrag = () => {
		setDragged(void 0);
		setTarget(void 0);
	};
	const move = (from, to) => {
		if (disabled || from === to || from < 0 || to < 0 || to >= models.length) return;
		const order = [...entries];
		const moved = order.splice(from, 1);
		order.splice(to, 0, ...moved);
		setRows(order.map((entry) => entry.state));
		onChange(order.map((entry) => entry.model));
	};
	return {
		rows: entries.map(({ model, state }, index) => ({
			...state,
			model,
			order: {
				dragging: dragged === state.key,
				target: target?.key === state.key ? target.half : void 0,
				canDrop: !disabled && dragged !== void 0,
				onStart: () => {
					setDragged(state.key);
				},
				onEnd: endDrag,
				onOver: (half) => {
					setTarget((current) => current?.key === state.key && current.half === half ? current : {
						key: state.key,
						half
					});
				},
				onLeave: () => {
					setTarget((current) => current?.key === state.key ? void 0 : current);
				},
				onDrop: (half) => {
					const from = rows.findIndex((row) => row.key === dragged);
					const insertion = index + (half === "after" ? 1 : 0);
					move(from, insertion > from ? insertion - 1 : insertion);
					endDrag();
				},
				onMove: (offset) => {
					move(index, index + offset);
				}
			}
		})),
		toggle: (index) => {
			setRows(rows.map((row, at) => at === index ? {
				...row,
				expanded: !row.expanded
			} : row));
		},
		edit: (index, field, text) => {
			setRows(rows.map((row, at) => {
				if (at !== index) return row;
				const editing = new Map(row.editing);
				if (text === void 0) editing.delete(field);
				else editing.set(field, text);
				return {
					...row,
					editing
				};
			}));
		},
		forget: (removed) => {
			setRows(rows.filter((_row, index) => !removed.has(index)));
			endDrag();
		},
		reset: () => {
			setRows(models.map(() => createRow(nextKey.current++)));
			endDrag();
		}
	};
}
