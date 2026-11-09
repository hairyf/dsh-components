// Extracted from @deepseek-ai/dsh-client-ui-settings-models (lib/client.js); region lib/types/client/ApiKeyInput.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Write-only credential input with the same reveal behavior as masked conversation text. */
		const EYE_CONTOUR = "M1.5 8C2.9 5.25 5.25 3.5 8 3.5C10.75 3.5 13.1 5.25 14.5 8C13.1 10.75 10.75 12.5 8 12.5C5.25 12.5 2.9 10.75 1.5 8Z";
		const EYE_PATH = `${EYE_CONTOUR}M10 8C10 9.1 9.1 10 8 10C6.9 10 6 9.1 6 8C6 6.9 6.9 6 8 6C9.1 6 10 6.9 10 8Z`;
		const EYE_OFF_PATH = `${EYE_CONTOUR}M2.5 2.5L13.5 13.5`;
		/**
		* Reveal only a nonempty draft; a different value starts masked, as in SecretText.
		* @param props - current draft, input attributes, and translated control labels.
		* @returns a password input with an optional reveal button.
		*/
		function ApiKeyInput({ value, t, ...props }) {
			const [revealedValue, setRevealedValue] = (0, react.useState)();
			const revealed = value.length > 0 && revealedValue === value;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ModelsSection_module_css_default["keyInput"],
				children: [(0, react_jsx_runtime.jsx)("input", {
					...props,
					className: `${ModelsSection_module_css_default["input"]} ${value.length > 0 ? ModelsSection_module_css_default["keyInputFilled"] : ""}`,
					type: revealed ? "text" : "password",
					autoComplete: "new-password",
					value,
					onChange: (event) => {
						setRevealedValue(void 0);
						props.onChange?.(event);
					}
				}), value.length === 0 ? null : (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: ModelsSection_module_css_default["keyToggle"],
					"aria-label": t(revealed ? "keyHide" : "keyReveal"),
					"aria-pressed": revealed,
					disabled: props.disabled,
					onClick: () => {
						setRevealedValue(revealed ? void 0 : value);
					},
					children: (0, react_jsx_runtime.jsx)("svg", {
						width: "16",
						height: "16",
						viewBox: "0 0 16 16",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: 1.3,
						strokeLinecap: "round",
						"aria-hidden": "true",
						children: (0, react_jsx_runtime.jsx)("path", { d: revealed ? EYE_OFF_PATH : EYE_PATH })
					})
				})]
			});
		}
