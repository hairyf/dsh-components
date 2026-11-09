// Extracted from @deepseek-ai/dsh-client-ui-schedule (lib/client.js); region lib/types/client/TaskRuleControls.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

const WEEKDAYS = [
	1,
	2,
	3,
	4,
	5,
	6,
	7
];
const WEEKDAY_LABELS = {
	1: "frequency.weekday.1",
	2: "frequency.weekday.2",
	3: "frequency.weekday.3",
	4: "frequency.weekday.4",
	5: "frequency.weekday.5",
	6: "frequency.weekday.6",
	7: "frequency.weekday.7"
};
/**
* Render the weekly rule's Weekday row: one pill per weekday, named by the row's
* label and toggled in the rule the caller is editing.
* @param props.weekdays - weekdays the rule currently selects, as ISO weekday numbers (Monday is 1).
* @param props.disabled - whether the rule's controls are read-only.
* @param props.t - frequency translator owning the weekday labels.
* @param props.rowId - id builder for the row's label, which names the pill group.
* @param props.onToggle - toggle one weekday in the rule being edited.
* @returns the labelled Weekday row.
*/
function RuleWeekdayRow({ weekdays, disabled, t, rowId, onToggle }) {
	return (0, react_jsx_runtime.jsxs)("div", {
		className: TaskManagerPage_module_css_default.ruleRow,
		children: [(0, react_jsx_runtime.jsx)("span", {
			className: TaskManagerPage_module_css_default.ruleLabel,
			id: rowId("weekday"),
			children: t("rule.weekday")
		}), (0, react_jsx_runtime.jsx)("div", {
			className: clsx(TaskManagerPage_module_css_default.ruleWeekdays, TaskManagerPage_module_css_default.ruleControl),
			role: "group",
			"aria-labelledby": rowId("weekday"),
			children: WEEKDAYS.map((weekday) => {
				const selected = weekdays.includes(weekday);
				return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Pill, {
					className: TaskManagerPage_module_css_default.ruleControl,
					active: selected,
					disabled,
					"aria-pressed": selected,
					"aria-label": t("rule.weekdayOption", { weekday: t(WEEKDAY_LABELS[weekday]) }),
					onClick: () => {
						onToggle(weekday);
					},
					children: t(WEEKDAY_LABELS[weekday])
				}, weekday);
			})
		})]
	});
}
/**
* One whole-number stepper of the task rule form, such as the repeat interval or
* the day of the month. Values clamp to the field's bounds, and an emptied or
* fractional input stages nothing, so the staged rule stays valid on every edit.
* @param props - bounds, staged value, blocking state, arrow labels, and callback.
* @returns the stepper pill.
*/
function RuleStepper({ id, min, max, value, disabled, increaseLabel, decreaseLabel, onChange }) {
	const clamp = (next) => Math.min(max, Math.max(min, next));
	return (0, react_jsx_runtime.jsxs)("span", {
		className: TaskManagerPage_module_css_default.ruleIntervalStepper,
		style: { "--interval-digits": String(value).length },
		children: [(0, react_jsx_runtime.jsx)("input", {
			id,
			className: clsx(TaskManagerPage_module_css_default.ruleInput, TaskManagerPage_module_css_default.ruleControl, TaskManagerPage_module_css_default.ruleIntervalInput),
			type: "number",
			min,
			max,
			step: 1,
			disabled,
			value,
			onChange: (event) => {
				const next = Number(event.target.value);
				if (event.target.value === "" || !Number.isSafeInteger(next)) return;
				onChange(clamp(next));
			}
		}), (0, react_jsx_runtime.jsxs)("span", {
			className: TaskManagerPage_module_css_default.ruleIntervalArrows,
			children: [(0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: TaskManagerPage_module_css_default.ruleIntervalArrow,
				"aria-label": increaseLabel,
				disabled: disabled || value >= max,
				onClick: () => {
					onChange(clamp(value + 1));
				},
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, { size: 9 })
			}), (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: TaskManagerPage_module_css_default.ruleIntervalArrow,
				"aria-label": decreaseLabel,
				disabled: disabled || value <= min,
				onClick: () => {
					onChange(clamp(value - 1));
				},
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: 9 })
			})]
		})]
	});
}
