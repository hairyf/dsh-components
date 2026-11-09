// Extracted from @deepseek-ai/dsh-client-ui-settings-models (lib/client.js); region lib/types/client/ModelInputTypes.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Edit a nonempty set of input types, displaying inherited types before an override exists.
		* @param props - model declaration and row replacement action.
		* @returns the labeled text and image checkboxes.
		*/
		function ModelInputTypes({ model, field, position, disabled, fallback, t, onChange }) {
			const modalities = model[field];
			const selected = Array.isArray(modalities) && modalities.length > 0 ? modalities : fallback ?? ["text"];
			return (0, react_jsx_runtime.jsxs)("fieldset", {
				className: ModelsSection_module_css_default["modelInputTypes"],
				"aria-label": `${t("modelInputTypes")} ${String(position)}`,
				children: [(0, react_jsx_runtime.jsx)("legend", {
					className: ModelsSection_module_css_default["modelFieldLabel"],
					children: t("modelInputTypes")
				}), (0, react_jsx_runtime.jsx)("div", {
					className: ModelsSection_module_css_default["modelInputChoices"],
					children: ["text", "image"].map((modality) => (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Checkbox, {
						label: t(modality === "text" ? "modelInputText" : "modelInputImage"),
						checked: selected.includes(modality),
						disabled: disabled || selected.length === 1 && selected.includes(modality),
						onChange: (checked) => {
							const nextSelected = ["text", "image"].filter((value) => value === modality ? checked : selected.includes(value));
							const next = {
								...model,
								[field]: nextSelected
							};
							if (field === "inputModalities" && !nextSelected.includes("image")) {
								Reflect.deleteProperty(next, "imagePixelBudget");
								Reflect.deleteProperty(next, "imageMaxBytes");
							}
							onChange(next);
						}
					}, modality))
				})]
			});
		}
