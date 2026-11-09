// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/settings/PerformanceUsageRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

const OPTIONS = [{
	id: "compact",
	label: "settings.performance.compact"
}, {
	id: "detailed",
	label: "settings.performance.detailed"
}];
/**
* Render the performance and usage detail selector.
* @param props - composed Settings slot props.
* @returns the preference row.
*/
function PerformanceUsageRow({ usePerformanceUsage, setPerformanceUsage, t }) {
	const mode = usePerformanceUsage((value) => value);
	const selectedLabel = mode === "detailed" ? "settings.performance.detailed" : "settings.performance.compact";
	return (0, react_jsx_runtime.jsx)(PreferenceRow, {
		title: t("settings.performance.title"),
		description: t("settings.performance.description"),
		value: mode,
		selectedLabel: t(selectedLabel),
		options: OPTIONS.map((option) => ({
			id: option.id,
			label: t(option.label)
		})),
		onSelect: (value) => {
			setPerformanceUsage(value);
		}
	});
}
