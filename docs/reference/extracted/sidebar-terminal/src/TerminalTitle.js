// Extracted from @deepseek-ai/dsh-client-ui-sidebar-terminal (lib/client.js); region lib/types/client/TerminalTitle.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Live terminal names in docked and floating tab chrome. */
/**
* Render the terminal name, editable in place on double-click.
* @param props - sidebar occurrence, terminal model and localized copy.
* @returns the terminal icon and current name or its editor.
*/
function TerminalTitle({ useTabInfo, useTerminal, view, t }) {
	const { tab } = useTabInfo();
	const title = useTerminal(tab.id, (state) => state?.info?.title ?? state?.title) ?? tab.title;
	const [editing, setEditing] = (0, react.useState)(false);
	const input = (0, react.useRef)(null);
	const label = (0, react.useRef)(null);
	const cancelled = (0, react.useRef)(false);
	(0, react.useLayoutEffect)(() => {
		if (editing) return;
		const chip = label.current?.closest("[data-dockkit-tab], [data-dockkit-float-grip]");
		const rename = (event) => {
			event.stopPropagation();
			cancelled.current = false;
			setEditing(true);
		};
		chip?.addEventListener("dblclick", rename);
		return () => {
			chip?.removeEventListener("dblclick", rename);
		};
	}, [editing]);
	(0, react.useLayoutEffect)(() => {
		if (!editing) return;
		input.current?.focus();
		input.current?.select();
	}, [editing]);
	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(TerminalIcon, {}), editing ? (0, react_jsx_runtime.jsx)("input", {
		ref: input,
		className: TerminalTitle_module_css_default.name,
		defaultValue: title,
		maxLength: 120,
		"aria-label": t("rename"),
		onPointerDown: (event) => {
			event.stopPropagation();
		},
		onClick: (event) => {
			event.stopPropagation();
		},
		onDoubleClick: (event) => {
			event.stopPropagation();
		},
		onBlur: (event) => {
			setEditing(false);
			const next = event.currentTarget.value.trim();
			if (!cancelled.current && next !== "" && next !== title) view(tab.id).rename(next);
		},
		onKeyDown: (event) => {
			event.stopPropagation();
			if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
			if (event.key === "Escape") {
				cancelled.current = true;
				event.currentTarget.blur();
			} else if (event.key === "Enter") event.currentTarget.blur();
		}
	}) : (0, react_jsx_runtime.jsx)("span", {
		ref: label,
		className: TerminalTitle_module_css_default.title,
		children: title
	})] });
}
