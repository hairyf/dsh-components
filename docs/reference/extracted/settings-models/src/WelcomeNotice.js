// Extracted from @deepseek-ai/dsh-client-ui-settings-models (lib/client.js); region lib/types/client/WelcomeNotice.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Product-wide, versioned preview notice. */
/**
* Render the current notice until its exact copy version is acknowledged.
* @param props - settings-shell owner state and welcome dependencies.
* @returns the welcome modal or null while the step decides not to show.
*/
function WelcomeNotice(props) {
	const { complete, controller, useWelcome, t } = props;
	const state = useWelcome((snapshot) => snapshot);
	const finished = (0, react.useRef)(false);
	const finish = (0, react.useCallback)(() => {
		if (finished.current) return;
		finished.current = true;
		complete();
	}, [complete]);
	(0, react.useEffect)(() => {
		if (state.status === "idle") controller.load();
	}, [controller, state.status]);
	(0, react.useEffect)(() => {
		if (state.acknowledged) finish();
	}, [finish, state.acknowledged]);
	if (state.status === "idle" || state.status === "loading" || state.acknowledged) return null;
	const acknowledge = async () => {
		if (await controller.acknowledge()) finish();
	};
	const paragraphs = t("welcomeBody").split("\n\n");
	return (0, react_jsx_runtime.jsxs)(OnboardingModal, {
		title: t("welcomeTitle"),
		focusTitle: true,
		children: [
			(0, react_jsx_runtime.jsx)("div", {
				className: WelcomeNotice_module_css_default.copy,
				children: paragraphs.map((paragraph) => (0, react_jsx_runtime.jsx)("p", { children: paragraph }, paragraph))
			}),
			state.error === null ? null : (0, react_jsx_runtime.jsx)("p", {
				className: WelcomeNotice_module_css_default.error,
				role: "alert",
				children: t("welcomeError")
			}),
			(0, react_jsx_runtime.jsx)("div", {
				className: WelcomeNotice_module_css_default.actions,
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "primary",
					className: WelcomeNotice_module_css_default.primary,
					disabled: state.status === "saving",
					onClick: () => {
						acknowledge();
					},
					children: t("welcomeContinue")
				})
			})
		]
	});
}
