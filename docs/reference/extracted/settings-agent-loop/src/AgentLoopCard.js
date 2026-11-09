// Extracted from @deepseek-ai/dsh-client-ui-settings-agent-loop (lib/client.js); region lib/types/client/AgentLoopCard.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render the agent loop's one-liner or its settings form, as the Plugins page asks.
* @param props - the view asked for, locale copy, the form snapshot, and its actions.
* @returns the one-liner, or the form.
*/
function AgentLoopCard(props) {
	const { t } = props;
	const state = props.useAgentLoopCard((snapshot) => snapshot);
	if (props.view === "summary") return t("description");
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsForm, {
		labels: formLabels(t),
		state,
		onSave: props.save,
		onDiscard: props.discard,
		children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsValueField, {
			id: "plugin-config-agent-loop-parallel",
			label: t("maxParallel"),
			hint: t("maxParallelHint"),
			overriddenLabel: t("overridden"),
			resetLabel: t("reset"),
			invalidLabel: t("invalidNumber"),
			numeric: true,
			disabled: !state.writable,
			...state.maxParallelToolCalls,
			onEdit: (text) => {
				props.edit("maxParallelToolCalls", text);
			},
			onReset: () => {
				props.resetField("maxParallelToolCalls");
			}
		})
	});
}
