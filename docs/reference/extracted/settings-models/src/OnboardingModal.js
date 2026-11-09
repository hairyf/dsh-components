// Extracted from @deepseek-ai/dsh-client-ui-settings-models (lib/client.js); region lib/types/client/OnboardingModal.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Shared modal chrome for every step registered by this onboarding plugin. */
const ignoreImplicitDismiss = () => {};
/**
* Render a blocking onboarding dialog and keep the application root inert.
* @param props.title - accessible and visible dialog title.
* @param props.focusTitle - focus the title when the step has no form control.
* @param props.children - step-owned body and actions.
* @returns the body-portaled modal.
*/
function OnboardingModal({ title, focusTitle = false, children }) {
	const titleRef = (0, react.useRef)(null);
	(0, react.useEffect)(() => {
		const appRoot = document.getElementById("root");
		if (appRoot === null) return;
		const previous = appRoot.inert;
		appRoot.inert = true;
		return () => {
			appRoot.inert = previous;
		};
	}, []);
	(0, react.useEffect)(() => {
		if (focusTitle) titleRef.current?.focus();
	}, [focusTitle]);
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
		open: true,
		title,
		onClose: ignoreImplicitDismiss,
		headless: true,
		className: OnboardingModal_module_css_default.dialog,
		children: (0, react_jsx_runtime.jsxs)("div", {
			className: OnboardingModal_module_css_default.content,
			children: [(0, react_jsx_runtime.jsx)("h2", {
				ref: titleRef,
				className: OnboardingModal_module_css_default.title,
				tabIndex: focusTitle ? -1 : void 0,
				children: title
			}), (0, react_jsx_runtime.jsx)("div", {
				className: OnboardingModal_module_css_default.body,
				children
			})]
		})
	});
}
