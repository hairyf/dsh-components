// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/JsonTree.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

const OBJECT_PREVIEW_LIMIT = 4;
const ARRAY_PREVIEW_LIMIT = 5;
const PREVIEW_DEPTH_LIMIT = 2;
function valueCopyMenuItems(labels) {
	return [
		{
			id: "value",
			label: labels.copyValue
		},
		{
			id: "json",
			label: labels.copyJson
		},
		{
			id: "path",
			label: labels.copyPath
		}
	];
}
function objectCopyMenuItems(labels) {
	return [
		{
			id: "prettyJson",
			label: labels.copyPrettyJson
		},
		{
			id: "json",
			label: labels.copyCompactJson
		},
		{
			id: "path",
			label: labels.copyPath
		}
	];
}
/** Notify only the old and new row actions; JSON values do not subscribe to hover state. */
function createCopyStore() {
	let current;
	const listeners = /* @__PURE__ */ new Map();
	return {
		get: () => current,
		set(next) {
			const previous = current?.id;
			current = next;
			for (const id of new Set([previous, next?.id])) {
				if (id === void 0) continue;
				for (const listener of listeners.get(id) ?? []) listener();
			}
		},
		subscribe(id, listener) {
			let row = listeners.get(id);
			if (row === void 0) listeners.set(id, row = /* @__PURE__ */ new Set());
			row.add(listener);
			return () => {
				row.delete(listener);
				if (row.size === 0) listeners.delete(id);
			};
		}
	};
}
function JsonCopyAction({ store, target, persistent, labels, onCopy, onClose }) {
	const id = pathId(target.path);
	const subscribe = useCallback((listener) => store.subscribe(id, listener), [id, store]);
	const getSnapshot = () => {
		const current = store.get();
		return current?.id === id ? current : void 0;
	};
	const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
	const buttonRef = useRef(null);
	const state = snapshot?.state ?? "idle";
	const object = typeof target.value === "object" && target.value !== null;
	const copyTitle = state === "copied" ? labels.copied : state === "failed" ? labels.copyFailed : object ? labels.copyPrettyJson : labels.copyValue;
	return jsx("span", {
		className: css$31.copySlot,
		children: (persistent || snapshot !== void 0) && jsx(Menu, {
			open: snapshot?.menuOpen === true,
			compact: true,
			portal: true,
			align: "end",
			anchor: jsx("button", {
				ref: buttonRef,
				type: "button",
				className: css$31.actionButton,
				"data-json-copy-button": true,
				"data-state": state,
				"aria-label": copyTitle,
				title: labels.copyButtonTitle(copyTitle),
				onClick: () => void onCopy(target, object ? "prettyJson" : "value"),
				onContextMenu: (event) => {
					event.preventDefault();
					event.stopPropagation();
					store.set({
						id,
						target,
						state,
						menuOpen: true
					});
				},
				children: state === "copied" ? jsx(IconCheckOutlineRegular, { size: 12 }) : jsx(IconCopyOutlineRegular, { size: 12 })
			}),
			items: object ? objectCopyMenuItems(labels) : valueCopyMenuItems(labels),
			onSelect: (mode) => {
				onCopy(target, mode);
			},
			onClose,
			getAnchorRect: () => buttonRef.current.getBoundingClientRect()
		})
	});
}
function isExpandableValue(value) {
	return typeof value === "object" && value !== null && !(value instanceof Date);
}
function entriesOf(value) {
	if (Array.isArray(value)) return value.map((item, index) => [String(index), item]);
	return Object.keys(value).map((key) => [key, value[key]]);
}
function bracketOf(value) {
	return Array.isArray(value) ? ["[", "]"] : ["{", "}"];
}
function previewPrimitive(value) {
	if (value === null) return jsx("span", {
		className: css$31.keywordValue,
		children: "null"
	});
	if (typeof value === "string") return jsx("span", {
		className: css$31.stringValue,
		children: JSON.stringify(value)
	});
	if (typeof value === "number") return jsx("span", {
		className: css$31.numberValue,
		children: String(value)
	});
	if (typeof value === "boolean") return jsx("span", {
		className: css$31.keywordValue,
		children: String(value)
	});
	if (typeof value === "bigint") return jsx("span", {
		className: css$31.otherValue,
		children: value.toString()
	});
	if (typeof value === "undefined") return jsx("span", {
		className: css$31.otherValue,
		children: "undefined"
	});
	if (typeof value === "symbol") return jsx("span", {
		className: css$31.otherValue,
		children: value.description ?? "Symbol"
	});
	if (typeof value === "function") return jsx("span", {
		className: css$31.otherValue,
		children: value.name || "Function"
	});
	return null;
}
function previewValue(value, depth) {
	if (!isExpandableValue(value)) return previewPrimitive(value);
	const array = Array.isArray(value);
	const entries = entriesOf(value);
	const limit = array ? ARRAY_PREVIEW_LIMIT : OBJECT_PREVIEW_LIMIT;
	const visible = entries.slice(0, limit);
	const [open, close] = bracketOf(value);
	return jsxs(Fragment, { children: [
		jsx("span", {
			className: css$31.punctuation,
			children: open
		}),
		depth >= PREVIEW_DEPTH_LIMIT ? jsx("span", {
			className: css$31.previewEllipsis,
			children: "…"
		}) : visible.map(([key, item], index) => jsxs("span", { children: [
			index > 0 && jsx("span", {
				className: css$31.punctuation,
				children: ", "
			}),
			!array && jsxs(Fragment, { children: [jsx("span", {
				className: css$31.previewProperty,
				children: key
			}), jsx("span", {
				className: css$31.punctuation,
				children: ": "
			})] }),
			previewValue(item, depth + 1)
		] }, key)),
		depth < PREVIEW_DEPTH_LIMIT && entries.length > limit && jsx("span", {
			className: css$31.previewEllipsis,
			children: ", …"
		}),
		jsx("span", {
			className: css$31.punctuation,
			children: close
		})
	] });
}
function primitiveValue(value) {
	if (value === null) return jsx("span", {
		className: css$31.keywordValue,
		children: "null"
	});
	if (typeof value === "string") return jsx("span", {
		className: css$31.stringValue,
		children: JSON.stringify(value)
	});
	if (typeof value === "boolean") return jsx("span", {
		className: css$31.keywordValue,
		children: String(value)
	});
	if (typeof value === "number") return jsx("span", {
		className: css$31.numberValue,
		children: String(value)
	});
	if (typeof value === "bigint") return jsx("span", {
		className: css$31.numberValue,
		children: `${value.toString()}n`
	});
	if (value instanceof Date) return jsx("span", {
		className: css$31.otherValue,
		children: value.toISOString()
	});
	if (typeof value === "function") return jsxs("span", {
		className: css$31.otherValue,
		children: ["function() ", "{ }"]
	});
	if (typeof value === "undefined") return jsx("span", {
		className: css$31.otherValue,
		children: "undefined"
	});
	return jsx("span", {
		className: css$31.otherValue,
		children: value.toString()
	});
}
function fieldText(field) {
	return field === "" ? "\"\"" : field;
}
function pathId(path) {
	return path.map((part) => typeof part === "number" ? `n${String(part)}` : `s${String(part.length)}:${part}`).join("/");
}
function claimFocus(button) {
	button.focus();
}
function moveFocus(button, direction) {
	const tree = button.closest("[role=\"tree\"]");
	/* v8 ignore next -- JsonTree attaches expander handlers only beneath its owning role=tree. */
	if (tree === null) return;
	const expanders = Array.from(tree.querySelectorAll("[data-json-expander]"));
	const current = expanders.indexOf(button);
	/* v8 ignore next -- the current expander is a member of the queried non-empty set. */
	if (current < 0 || expanders.length === 0) return;
	const nextExpander = expanders[(current + direction + expanders.length) % expanders.length];
	/* v8 ignore next -- modulo over the non-empty expander set always resolves a member. */
	if (nextExpander !== void 0) claimFocus(nextExpander);
}
function NodeField({ field, expandable, onToggle }) {
	if (field === void 0) return null;
	return jsxs("span", {
		className: clsx(css$31.label, expandable && css$31.clickableLabel),
		onClick: expandable ? onToggle : void 0,
		children: [fieldText(field), ":"]
	});
}
function JsonString({ collapsedStringLines, stringWrapping, field, labels, lastElement, renderCopy, value }) {
	const contentsId = useId();
	const contentRef = useRef(null);
	const rawRef = useRef(null);
	const [expanded, setExpanded] = useState(false);
	const [wrapped, setWrapped] = useState(false);
	const [truncated, setTruncated] = useState(false);
	useLayoutEffect(() => {
		if (expanded) return;
		const content = contentRef.current;
		const measure = () => {
			const lineHeight = Number.parseFloat(getComputedStyle(content).lineHeight);
			setTruncated(content.scrollHeight > lineHeight * collapsedStringLines);
		};
		measure();
		if (typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver(measure);
		observer.observe(content);
		return () => {
			observer.disconnect();
		};
	}, [
		collapsedStringLines,
		expanded,
		field,
		lastElement,
		value
	]);
	useLayoutEffect(() => {
		if (!expanded) return;
		const raw = rawRef.current;
		const clips = [];
		const tree = raw.closest(`.${css$31.root}`);
		for (let parent = tree.parentElement; parent !== null; parent = parent.parentElement) if (/auto|scroll|hidden|clip/.test(getComputedStyle(parent).overflowY)) clips.push(parent);
		const measure = () => {
			let top = 0;
			let bottom = window.innerHeight;
			for (const clip of clips) {
				const rect = clip.getBoundingClientRect();
				const style = getComputedStyle(clip);
				top = Math.max(top, rect.top + clip.clientTop);
				bottom = Math.min(bottom, rect.top + clip.clientTop + clip.clientHeight - Number.parseFloat(style.paddingBottom));
			}
			const available = bottom - Math.max(top, raw.getBoundingClientRect().top);
			raw.style.maxHeight = `${Math.max(16, available - 4)}px`;
		};
		measure();
		const observer = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver(measure);
		observer?.observe(raw);
		for (const clip of clips) observer?.observe(clip);
		window.addEventListener("resize", measure);
		window.addEventListener("scroll", measure, true);
		return () => {
			observer?.disconnect();
			window.removeEventListener("resize", measure);
			window.removeEventListener("scroll", measure, true);
		};
	}, [expanded, value]);
	if (expanded) {
		const fieldId = `${contentsId}-field`;
		return jsxs("div", {
			className: css$31.stringField,
			"data-expanded": true,
			children: [
				field !== void 0 && jsxs("span", {
					id: fieldId,
					className: css$31.label,
					children: [fieldText(field), ":"]
				}),
				jsx("pre", {
					ref: rawRef,
					id: contentsId,
					className: css$31.stringRaw,
					"data-wrap": wrapped,
					tabIndex: 0,
					"aria-labelledby": field === void 0 ? void 0 : fieldId,
					children: value
				}),
				!lastElement && jsx("span", {
					className: css$31.punctuation,
					children: ","
				}),
				jsxs("div", {
					className: css$31.stringActions,
					children: [
						stringWrapping !== void 0 && jsx("button", {
							type: "button",
							className: css$31.actionButton,
							"aria-label": stringWrapping.label,
							title: stringWrapping.label,
							"aria-pressed": wrapped,
							"aria-controls": contentsId,
							onClick: () => {
								const next = !wrapped;
								setWrapped(next);
								stringWrapping.setDefault(next);
							},
							children: jsx(IconWrapLinesOutlineRegular, { size: 12 })
						}),
						jsx("button", {
							type: "button",
							className: css$31.actionButton,
							"aria-label": labels.collapseNode,
							title: labels.collapseNode,
							"aria-expanded": true,
							"aria-controls": contentsId,
							onClick: () => {
								setExpanded(false);
							},
							children: jsx("svg", {
								width: "12",
								height: "12",
								viewBox: "0 0 16 16",
								fill: "none",
								stroke: "currentColor",
								"aria-hidden": "true",
								children: jsx("path", { d: "M9.5 1.5V6.5H14.5M1.5 9.5H6.5V14.5" })
							})
						}),
						renderCopy?.(true)
					]
				})
			]
		});
	}
	return jsxs(Fragment, { children: [renderCopy?.(), jsx("span", {
		className: css$31.stringField,
		"data-expanded": expanded,
		children: jsxs("span", {
			ref: contentRef,
			id: contentsId,
			className: css$31.stringText,
			children: [
				truncated && jsx("span", {
					className: css$31.stringToggleSlot,
					children: jsxs("button", {
						type: "button",
						className: css$31.stringToggle,
						"aria-label": labels.expandNode,
						"aria-expanded": false,
						"aria-controls": contentsId,
						onClick: () => {
							setWrapped(stringWrapping?.getDefault() ?? false);
							setExpanded(true);
						},
						children: [jsx("span", {
							"aria-hidden": "true",
							children: "…"
						}), labels.expandNode]
					})
				}),
				field !== void 0 && jsxs("span", {
					className: css$31.label,
					children: [fieldText(field), ":"]
				}),
				primitiveValue(value),
				!lastElement && jsx("span", {
					className: css$31.punctuation,
					children: ","
				})
			]
		})
	})] });
}
function JsonTreeNode({ collapsedStringLines, stringWrapping, field, initialExpanded, labels, lastElement, onClaimTabStop, onRowHover, path, renderCopy, tabStopId, value }) {
	const contentsId = useId();
	const expanderRef = useRef(null);
	const [expanded, setExpanded] = useState(initialExpanded);
	const nodeId = pathId(path);
	const container = isExpandableValue(value);
	const entries = container ? entriesOf(value) : [];
	const expandable = entries.length > 0;
	const toggle = () => {
		setExpanded((current) => !current);
		claimFocus(expanderRef.current);
	};
	const onExpanderKeyDown = (event) => {
		if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
			event.preventDefault();
			setExpanded(event.key === "ArrowRight");
			return;
		}
		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			event.preventDefault();
			moveFocus(event.currentTarget, event.key === "ArrowUp" ? -1 : 1);
		}
	};
	const row = (children, ariaExpanded) => jsxs("div", {
		className: css$31.row,
		role: "treeitem",
		"aria-expanded": ariaExpanded,
		onMouseOver: (event) => {
			event.stopPropagation();
			onRowHover(event.currentTarget, {
				path,
				value
			});
		},
		children: [typeof value !== "string" && renderCopy?.({
			path,
			value
		}), children]
	});
	if (typeof value === "string") return row(jsx(JsonString, {
		collapsedStringLines,
		stringWrapping,
		field,
		value,
		labels,
		lastElement,
		renderCopy: renderCopy === void 0 ? void 0 : (persistent) => renderCopy({
			path,
			value
		}, persistent)
	}));
	if (!container) return row(jsxs(Fragment, { children: [
		jsx(NodeField, {
			field,
			expandable: false,
			onToggle: toggle
		}),
		primitiveValue(value),
		!lastElement && jsx("span", {
			className: css$31.punctuation,
			children: ","
		})
	] }));
	const [open, close] = bracketOf(value);
	if (!expandable) return row(jsxs(Fragment, { children: [
		jsx(NodeField, {
			field,
			expandable: false,
			onToggle: toggle
		}),
		jsx("span", {
			className: css$31.punctuation,
			children: open
		}),
		jsx("span", {
			className: css$31.punctuation,
			children: close
		}),
		!lastElement && jsx("span", {
			className: css$31.punctuation,
			children: ","
		})
	] }));
	return row(jsxs(Fragment, { children: [
		jsx("span", {
			ref: expanderRef,
			className: clsx(css$31.expander, expanded ? css$31.collapseIcon : css$31.expandIcon),
			"data-json-expander": true,
			role: "button",
			"aria-label": expanded ? labels.collapseNode : labels.expandNode,
			"aria-expanded": expanded,
			"aria-controls": expanded ? contentsId : void 0,
			tabIndex: tabStopId === nodeId ? 0 : -1,
			onFocus: () => {
				onClaimTabStop(nodeId);
			},
			onClick: toggle,
			onKeyDown: onExpanderKeyDown
		}),
		jsxs("span", {
			className: css$31.summary,
			children: [
				jsx(NodeField, {
					field,
					expandable: true,
					onToggle: toggle
				}),
				jsx("span", {
					className: css$31.preview,
					children: previewValue(value, 0)
				}),
				!lastElement && jsx("span", {
					className: css$31.punctuation,
					children: ","
				})
			]
		}),
		expanded && jsx("ul", {
			id: contentsId,
			role: "group",
			className: css$31.children,
			children: entries.map(([key, item], index) => jsx(JsonTreeNode, {
				collapsedStringLines,
				stringWrapping,
				field: key,
				value: item,
				path: [...path, Array.isArray(value) ? index : key],
				labels,
				lastElement: index === entries.length - 1,
				initialExpanded: false,
				tabStopId,
				onClaimTabStop,
				onRowHover,
				renderCopy
			}, key))
		})
	] }), expanded);
}
function formattedPath(path) {
	return path.reduce((result, part) => {
		if (typeof part === "number") return `${result}[${String(part)}]`;
		return /^[A-Za-z_$][\w$]*$/.test(part) ? `${result}.${part}` : `${result}[${JSON.stringify(part)}]`;
	}, "$");
}
function copyText$2(target, mode) {
	if (mode === "path") return formattedPath(target.path);
	if (mode === "prettyJson") return JSON.stringify(target.value, null, 2);
	if (mode === "json") return JSON.stringify(target.value);
	if (typeof target.value === "string") return target.value;
	if (typeof target.value === "undefined") return "undefined";
	if (typeof target.value === "bigint") return target.value.toString();
	if (typeof target.value === "symbol") return target.value.description ?? "Symbol";
	if (typeof target.value === "function") return target.value.name || "Function";
	return JSON.stringify(target.value);
}
/**
* Render parsed JSON as a compact, keyboard-accessible inspector tree.
* @param props - Parsed data, accessible label, and display options.
* @returns A read-only JSON tree with an optionally fixed-open top level.
*/
function JsonTree({ data, label, className, collapsedStringLines = 3, stringWrapping, copyable = true, expandTopLevel = true, labels }) {
	const rootEntries = entriesOf(data);
	const firstExpandableIndex = rootEntries.findIndex(([, value]) => isExpandableValue(value) && entriesOf(value).length > 0);
	const firstExpandableEntry = rootEntries[firstExpandableIndex];
	const initialTabStopId = expandTopLevel ? firstExpandableEntry === void 0 ? null : pathId([Array.isArray(data) ? firstExpandableIndex : firstExpandableEntry[0]]) : isExpandableValue(data) && rootEntries.length > 0 ? pathId([]) : null;
	const activeRowRef = useRef();
	const resetTimer = useRef();
	const copySequence = useRef(0);
	const [copyStore] = useState(createCopyStore);
	const [tabStopId, setTabStopId] = useState(initialTabStopId);
	const setActiveRow = (row) => {
		activeRowRef.current?.removeAttribute("data-json-copy-active");
		activeRowRef.current = row;
		row?.setAttribute("data-json-copy-active", "");
	};
	const clearCopyTarget = () => {
		copySequence.current += 1;
		if (resetTimer.current !== void 0) clearTimeout(resetTimer.current);
		setActiveRow(void 0);
		copyStore.set(void 0);
	};
	useEffect(() => () => {
		copySequence.current += 1;
		if (resetTimer.current !== void 0) clearTimeout(resetTimer.current);
		activeRowRef.current?.removeAttribute("data-json-copy-active");
	}, []);
	useEffect(() => {
		clearCopyTarget();
		setTabStopId(initialTabStopId);
	}, [
		data,
		expandTopLevel,
		initialTabStopId
	]);
	const handleRowHover = (row, target) => {
		if (!copyable || copyStore.get()?.menuOpen) return;
		if (activeRowRef.current === row) return;
		setActiveRow(row);
		copyStore.set({
			id: pathId(target.path),
			target,
			state: "idle",
			menuOpen: false
		});
	};
	const handleRootMouseOver = (event) => {
		if (!copyable || copyStore.get()?.menuOpen) return;
		/* v8 ignore next -- browser mouse events delivered through React target an Element. */
		if (!(event.target instanceof Element)) return;
		if (event.target.closest("[data-json-copy-button]") === null) clearCopyTarget();
	};
	const copy = async (target, mode) => {
		const sequence = ++copySequence.current;
		const snapshot = {
			id: pathId(target.path),
			target,
			state: "idle",
			menuOpen: false
		};
		copyStore.set(snapshot);
		let state;
		try {
			await navigator.clipboard.writeText(copyText$2(target, mode));
			state = "copied";
		} catch {
			state = "failed";
		}
		const current = copyStore.get();
		if (sequence !== copySequence.current || current?.target !== target) return;
		copyStore.set({
			...current,
			state
		});
		if (resetTimer.current !== void 0) clearTimeout(resetTimer.current);
		resetTimer.current = setTimeout(() => {
			const current = copyStore.get();
			if (current?.target === target) copyStore.set({
				...current,
				state: "idle"
			});
		}, 1500);
	};
	const [rootOpen, rootClose] = bracketOf(data);
	const renderCopy = copyable ? (target, persistent = false) => jsx(JsonCopyAction, {
		store: copyStore,
		target,
		persistent,
		labels,
		onCopy: copy,
		onClose: clearCopyTarget
	}) : void 0;
	return jsx("div", {
		className: clsx(css$31.root, className),
		style: { "--json-tree-collapsed-lines": collapsedStringLines },
		onMouseOver: handleRootMouseOver,
		onMouseLeave: () => {
			if (!copyStore.get()?.menuOpen) clearCopyTarget();
		},
		children: expandTopLevel ? jsxs("div", {
			className: css$31.expandedTopLevel,
			children: [
				jsxs("div", {
					className: clsx(css$31.row, css$31.topLevelBracket),
					"data-json-root-row": true,
					onMouseOver: (event) => {
						event.stopPropagation();
						handleRowHover(event.currentTarget, {
							path: [],
							value: data
						});
					},
					children: [renderCopy?.({
						path: [],
						value: data
					}), jsx("span", {
						className: css$31.punctuation,
						children: rootOpen
					})]
				}),
				jsx("div", {
					"aria-label": label,
					className: clsx(css$31.container, css$31.expandedTopLevelContainer),
					role: "tree",
					children: rootEntries.map(([key, value], index) => jsx(JsonTreeNode, {
						collapsedStringLines,
						stringWrapping,
						field: key,
						value,
						path: [Array.isArray(data) ? index : key],
						labels,
						lastElement: index === rootEntries.length - 1,
						initialExpanded: false,
						tabStopId,
						onClaimTabStop: setTabStopId,
						onRowHover: handleRowHover,
						renderCopy
					}, key))
				}),
				jsx("div", {
					className: clsx(css$31.row, css$31.topLevelBracket),
					children: jsx("span", {
						className: css$31.punctuation,
						children: rootClose
					})
				})
			]
		}) : jsx("div", {
			"aria-label": label,
			className: css$31.container,
			role: "tree",
			children: jsx(JsonTreeNode, {
				collapsedStringLines,
				stringWrapping,
				value: data,
				path: [],
				labels,
				lastElement: true,
				initialExpanded: true,
				tabStopId,
				onClaimTabStop: setTabStopId,
				onRowHover: handleRowHover,
				renderCopy
			})
		})
	});
}
