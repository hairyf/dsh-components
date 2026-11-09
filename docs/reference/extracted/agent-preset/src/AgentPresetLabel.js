// Extracted from @deepseek-ai/dsh-client-ui-agent-preset (lib/client.js); region lib/types/client/AgentPresetLabel.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* The session header's agent-preset label.
*
* Read-only by construction: a session's composition is fixed once its
* conversation starts, and a header is only worth reading after that. Offering
* a control here would promise a switch the host refuses; naming what the
* session runs is the honest affordance, and the choice itself lives on the
* new-session screen ({@link AgentPresetSeat}).
*/
/**
* Render this session's agent-preset name beside its title.
* @param props - composed slot props.
* @returns the label, or null when the session records no preset.
*/
function AgentPresetLabel({ sessionId, useSessions, useAgentPresets, load, t }) {
	const preset = useSessions((state) => {
		const value = state.byId[sessionId]?.projectionValues?.agentPreset;
		return typeof value === "string" ? value : void 0;
	});
	const options = useAgentPresets((state) => state.options);
	(0, react.useEffect)(() => {
		if (preset !== void 0) load();
	}, [preset, load]);
	if (preset === void 0) return null;
	const option = options.find((entry) => entry.id === preset);
	const text = option === void 0 ? void 0 : presetDisplayText(option, t);
	return (0, react_jsx_runtime.jsxs)("span", {
		className: AgentPresetLabel_module_css_default.label,
		title: text?.description ?? t("headerHint"),
		children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconAgentPresetOutlineRegular, {
			size: 14,
			className: AgentPresetLabel_module_css_default.icon
		}), text?.name ?? preset]
	});
}
