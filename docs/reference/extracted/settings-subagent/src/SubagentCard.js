// Extracted from @deepseek-ai/dsh-client-ui-settings-subagent (lib/client.js); region lib/types/client/SubagentCard.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** One settings card for Subagent delegation limits and model authorization. */
		/**
		* Render the available Subagent settings with one configuration page and save footer.
		* @param props - Locale, both form snapshots, and their shared actions.
		* @returns The summary or the available settings form.
		*/
		function SubagentCard(props) {
			const { t } = props;
			const limits = props.useSubagentLimitsCard((snapshot) => snapshot);
			const models = props.useSubagentModelSelectionCard((snapshot) => snapshot);
			const headingId = (0, react.useId)();
			if (props.view === "summary") return t("subagentDescription");
			const state = subagentCardShell(limits, models);
			return (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.SettingsForm, {
				labels: formLabels(t),
				state,
				onSave: props.save,
				onDiscard: props.discard,
				children: [limits.available ? (0, react_jsx_runtime.jsxs)("section", {
					className: SubagentCard_module_css_default.section,
					"aria-labelledby": `${headingId}-limits`,
					children: [(0, react_jsx_runtime.jsx)("h3", {
						className: SubagentCard_module_css_default.heading,
						id: `${headingId}-limits`,
						children: t("subagentLimitsTitle")
					}), (0, react_jsx_runtime.jsx)(SubagentLimitsFields, {
						t,
						state: {
							...limits,
							saving: state.saving
						},
						edit: props.editLimit,
						resetField: props.resetLimit
					})]
				}) : null, models.available ? (0, react_jsx_runtime.jsxs)("section", {
					className: SubagentCard_module_css_default.section,
					"aria-labelledby": `${headingId}-models`,
					children: [(0, react_jsx_runtime.jsx)("h3", {
						className: SubagentCard_module_css_default.heading,
						id: `${headingId}-models`,
						children: t("subagentModelSelectionTitle")
					}), (0, react_jsx_runtime.jsx)(SubagentModelSelectionFields, {
						t,
						state: {
							...models,
							saving: state.saving
						},
						toggleEnabled: props.toggleEnabled,
						toggleModel: props.toggleModel,
						retryCatalog: props.retryCatalog
					})]
				}) : null]
			});
		}
