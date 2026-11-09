// Extracted from @deepseek-ai/dsh-client-ui-settings-web-search (lib/client.js); region lib/types/client/WebSearchCard.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render the web-search provider's one-liner or its settings form, as the Plugins page asks.
* @param props - the view asked for, locale copy, the form snapshot, and its actions.
* @returns the one-liner, or the form.
*/
function WebSearchCard(props) {
	const { t } = props;
	const state = props.useWebSearchCard((snapshot) => snapshot);
	if (props.view === "summary") return t("description");
	const disabled = !state.writable || state.saving;
	const searchApi = state.useSearchApi;
	const limitField = searchApi ? "count" : "maxUses";
	return (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.SettingsForm, {
		labels: formLabels(t),
		state,
		onSave: props.save,
		onDiscard: props.discard,
		children: [
			state.apiSwitchAvailable && (0, react_jsx_runtime.jsxs)("div", {
				className: WebSearchCard_module_css_default.feature,
				children: [(0, react_jsx_runtime.jsxs)("label", {
					className: WebSearchCard_module_css_default.toggleRow,
					children: [(0, react_jsx_runtime.jsx)("span", { children: t("useSearchApi") }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
						checked: searchApi,
						label: t("useSearchApi"),
						disabled: disabled || state.apiSwitchBlocked,
						onChange: (checked) => {
							props.setSearchApi(checked);
						}
					})]
				}), (0, react_jsx_runtime.jsxs)("p", {
					className: WebSearchCard_module_css_default.hint,
					children: [t("useSearchApiHint"), (0, react_jsx_runtime.jsx)("a", {
						className: WebSearchCard_module_css_default.link,
						href: t("searchGuideUrl"),
						target: "_blank",
						rel: "noopener noreferrer",
						children: t("searchGuide")
					})]
				})]
			}),
			(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsSecretField, {
				id: "plugin-config-web-search-key",
				label: t("apiKey"),
				hint: t("apiKeyHint"),
				disabled: !state.apiKeyWritable,
				text: state.apiKey.text,
				configured: state.apiKeyConfigured,
				stateLabel: state.apiKeyConfigured ? t("apiKeySet") : t("apiKeyUnset"),
				onEdit: (text) => {
					props.edit("apiKey", text);
				}
			}),
			(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsValueField, {
				id: "plugin-config-web-search-endpoint",
				label: t(searchApi ? "searchApiBaseUrl" : "baseUrl"),
				hint: t(searchApi ? "searchApiBaseUrlHint" : "baseUrlHint"),
				overriddenLabel: t("overridden"),
				resetLabel: t("reset"),
				invalidLabel: t("invalidNumber"),
				disabled,
				...state.baseURL,
				onEdit: (text) => {
					props.edit("baseURL", text);
				},
				onReset: () => {
					props.resetField("baseURL");
				}
			}),
			(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsValueField, {
				id: searchApi ? "plugin-config-web-search-count" : "plugin-config-web-search-max-uses",
				label: t(limitField),
				hint: t(searchApi ? "countHint" : "maxUsesHint"),
				overriddenLabel: t("overridden"),
				resetLabel: t("reset"),
				invalidLabel: t(searchApi ? "invalidCount" : "invalidNumber"),
				numeric: true,
				disabled,
				...state[limitField],
				onEdit: (text) => {
					props.edit(limitField, text);
				},
				onReset: () => {
					props.resetField(limitField);
				}
			})
		]
	});
}
