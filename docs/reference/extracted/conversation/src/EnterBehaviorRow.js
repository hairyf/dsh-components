// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/settings/EnterBehaviorRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** General Settings row for the Composer's busy-state Enter preference. */
const OPTIONS = [{
	id: "queue",
	label: "settings.enter.queue"
}, {
	id: "steer",
	label: "settings.enter.steer"
}];
/**
* Render the busy-state Enter behavior selector.
* @param props - composed Settings slot props.
* @returns the preference row.
*/
function EnterBehaviorRow({ useBusyEnter, setBusyEnter, t }) {
	const behavior = useBusyEnter((value) => value);
	const [open, setOpen] = (0, react.useState)(false);
	const selectedLabel = behavior === "queue" ? "settings.enter.queue" : "settings.enter.steer";
	return (0, react_jsx_runtime.jsxs)("div", {
		className: EnterBehaviorRow_module_css_default.row,
		children: [(0, react_jsx_runtime.jsxs)("div", {
			className: EnterBehaviorRow_module_css_default.rowText,
			children: [(0, react_jsx_runtime.jsx)("div", {
				className: EnterBehaviorRow_module_css_default.title,
				children: t("settings.enter.title")
			}), (0, react_jsx_runtime.jsx)("div", {
				className: EnterBehaviorRow_module_css_default.desc,
				children: t("settings.enter.description")
			})]
		}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
			open,
			onClose: () => {
				setOpen(false);
			},
			items: OPTIONS.map((option) => ({
				id: option.id,
				label: t(option.label)
			})),
			selectedId: behavior,
			onSelect: (id) => {
				setOpen(false);
				setBusyEnter(id);
			},
			align: "end",
			portal: true,
			anchor: (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: EnterBehaviorRow_module_css_default.selector,
				"aria-haspopup": "menu",
				"aria-expanded": open,
				onClick: () => {
					setOpen((value) => !value);
				},
				children: [t(selectedLabel), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { className: EnterBehaviorRow_module_css_default.chevron })]
			})
		})]
	});
}
