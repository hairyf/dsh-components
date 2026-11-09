// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/settings-form/SettingsForm.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* One plugin's settings form as its page on the Plugins page shows it: the
* read-only notice when the deployment stores settings read-only, the
* plugin's controls, and the save that writes every staged edit. The page
* draws the plugin's title and one-liner itself.
*
* Only a save writes. Leaving the page drops every staged edit, so the form
* discards on unmount and offers no discard control. A form whose namespace
* the Host stopped serving says so in place of its controls rather than
* showing fields nothing would accept.
*/
/**
* Render one plugin's settings form.
* @param props - the form's copy and state, its controls, and the save and discard actions.
* @returns the form, or the unavailable line while the namespace is not served.
*/
function SettingsForm(props) {
	const { state, labels } = props;
	const discard = useRef(props.onDiscard);
	discard.current = props.onDiscard;
	useEffect(() => () => {
		discard.current();
	}, []);
	if (!state.available) return jsx("p", {
		className: css$29.unavailable,
		role: "status",
		children: labels.unavailable
	});
	const blocked = !state.dirty || state.invalid || state.saving;
	return jsxs("div", {
		className: css$29.form,
		children: [
			!state.writable ? jsx("p", {
				className: css$29.readOnly,
				role: "status",
				children: labels.readOnly
			}) : null,
			props.children,
			jsxs("div", {
				className: css$29.footer,
				children: [state.failed ? jsx("p", {
					className: css$29.failed,
					role: "status",
					children: labels.saveFailed
				}) : null, jsx("button", {
					type: "button",
					className: css$29.save,
					disabled: blocked,
					onClick: props.onSave,
					children: state.saving ? labels.saving : labels.save
				})]
			})
		]
	});
}
