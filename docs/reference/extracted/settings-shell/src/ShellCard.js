// Extracted from @deepseek-ai/dsh-client-ui-settings-shell (lib/client.js); region lib/types/client/ShellCard.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render the shell executor's one-liner or its settings form, as the Plugins page asks.
* @param props - the view asked for, locale copy, the form snapshot, and its actions.
* @returns the one-liner, or the form.
*/
function ShellCard(props) {
	const { t } = props;
	const state = props.useShellCard((snapshot) => snapshot);
	if (props.view === "summary") return t("description");
	const disabled = !state.writable;
	return (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.SettingsForm, {
		labels: formLabels(t),
		state,
		onSave: props.save,
		onDiscard: props.discard,
		children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsValueField, {
			id: "plugin-config-shell-timeout",
			label: t("timeoutMs"),
			hint: t("timeoutMsHint"),
			overriddenLabel: t("overridden"),
			resetLabel: t("reset"),
			invalidLabel: t("invalidNumber"),
			numeric: true,
			disabled,
			...state.timeoutMs,
			onEdit: (text) => {
				props.edit("timeoutMs", text);
			},
			onReset: () => {
				props.resetField("timeoutMs");
			}
		}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsValueField, {
			id: "plugin-config-shell-output",
			label: t("maxOutputBytes"),
			hint: t("maxOutputBytesHint"),
			overriddenLabel: t("overridden"),
			resetLabel: t("reset"),
			invalidLabel: t("invalidNumber"),
			numeric: true,
			disabled,
			...state.maxOutputBytes,
			onEdit: (text) => {
				props.edit("maxOutputBytes", text);
			},
			onReset: () => {
				props.resetField("maxOutputBytes");
			}
		})]
	});
}
