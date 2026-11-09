// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/settings-form/fields.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* The controls of a settings form. Each renders one field's label, its staged
* text, whether saving would leave an override, and — when one stands — the
* reset that stages a clear back to the composition layer. Nothing here
* writes: a control reports what the user typed, and the form's save is the
* single point where a draft becomes a document mutation.
*/
/**
* A staged value field. `numeric` only hints the keypad: which drafts a field
* accepts is decided by its spec, so the control never silently rewrites what
* the user typed.
* @param props - the field's copy, its staged text, and the edit actions.
* @returns the labelled control.
*/
function SettingsValueField(props) {
	const [helpOpen, setHelpOpen] = useState(false);
	const helpId = `${props.id}-help`;
	const messageId = `${props.id}-message`;
	const hasMessage = props.invalid || Boolean(props.hint);
	const description = [hasMessage ? messageId : "", helpOpen ? helpId : ""].filter(Boolean).join(" ");
	return jsxs("div", {
		className: css$30.field,
		children: [
			jsxs("div", {
				className: css$30.head,
				children: [jsxs("div", {
					className: css$30.labelGroup,
					children: [jsx("label", {
						className: css$30.label,
						htmlFor: props.id,
						children: props.label
					}), props.help !== void 0 ? jsx("button", {
						type: "button",
						className: css$30.helpButton,
						"aria-label": props.help.label,
						"aria-expanded": helpOpen,
						"aria-controls": helpId,
						onClick: () => {
							setHelpOpen(!helpOpen);
						},
						children: jsx(IconInfoOutlineRegular, { size: 12 })
					}) : null]
				}), props.overridden ? jsxs("span", {
					className: css$30.badges,
					children: [jsx(Tag, {
						tone: "neutral",
						children: props.overriddenLabel
					}), jsx("button", {
						type: "button",
						className: css$30.reset,
						disabled: props.disabled,
						onClick: props.onReset,
						children: props.resetLabel
					})]
				}) : null]
			}),
			jsx("input", {
				id: props.id,
				className: css$30.input,
				type: "text",
				...props.numeric === true ? { inputMode: "numeric" } : {},
				...props.invalid ? { "aria-invalid": true } : {},
				"aria-describedby": description || void 0,
				value: props.text,
				placeholder: props.placeholder ?? "",
				disabled: props.disabled,
				onChange: (event) => {
					props.onEdit(event.target.value);
				}
			}),
			hasMessage ? jsx("p", {
				id: messageId,
				className: props.invalid ? css$30.invalid : css$30.hint,
				children: props.invalid ? props.invalidLabel : props.hint
			}) : null,
			props.help !== void 0 && helpOpen ? jsx("div", {
				id: helpId,
				className: css$30.help,
				role: "region",
				"aria-label": props.help.label,
				children: props.help.content
			}) : null
		]
	});
}
/**
* A write-only credential control. The value never rides a response, so the
* control reports only whether one is configured and starts blank; a blank
* draft writes nothing, which keeps the stored key rather than clearing it.
* The control asks browsers not to autofill saved login passwords.
* @param props - the field's copy, its staged text, and the configured state.
* @returns the labelled control.
*/
function SettingsSecretField(props) {
	return jsxs("div", {
		className: css$30.field,
		children: [
			jsxs("div", {
				className: css$30.head,
				children: [jsx("label", {
					className: css$30.label,
					htmlFor: props.id,
					children: props.label
				}), jsx("span", {
					className: css$30.badges,
					children: jsx(Tag, {
						tone: props.configured ? "neutral" : "quiet",
						children: props.stateLabel
					})
				})]
			}),
			jsx("input", {
				id: props.id,
				className: css$30.input,
				type: "password",
				autoComplete: "new-password",
				value: props.text,
				disabled: props.disabled,
				onChange: (event) => {
					props.onEdit(event.target.value);
				}
			}),
			jsx("p", {
				className: css$30.hint,
				children: props.hint
			})
		]
	});
}
