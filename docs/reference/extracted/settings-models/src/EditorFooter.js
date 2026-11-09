// Extracted from @deepseek-ai/dsh-client-ui-settings-models (lib/client.js); region lib/types/client/EditorFooter.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render one provider card's action row.
* @param props - the labels, commit gating, and handlers the owning card supplies.
* @returns the cancel/commit row.
*/
function EditorFooter(props) {
	const { t } = props;
	return (0, react_jsx_runtime.jsxs)("div", {
		className: ModelsSection_module_css_default["editorActions"],
		children: [(0, react_jsx_runtime.jsx)("button", {
			type: "button",
			className: ModelsSection_module_css_default["secondaryButton"],
			disabled: props.busy,
			onClick: props.onCancel,
			children: t(props.cancelLabelKey ?? "cancel")
		}), (0, react_jsx_runtime.jsx)("button", {
			type: "button",
			className: ModelsSection_module_css_default["primaryButton"],
			disabled: props.submitDisabled,
			onClick: props.onSubmit,
			children: props.busy ? t(props.submitBusyLabelKey) : t(props.submitLabelKey)
		})]
	});
}
