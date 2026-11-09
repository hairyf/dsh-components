// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/DesktopOnboardingEntry.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Framework-hook projection into the desktop introduction's pure view. */
/**
* Read shared state through framework hooks; sessions do not control activation.
* @param props - shell overlay bindings and account-owned actions.
* @returns the unfinished flow, retained briefly after successful completion unless motion is reduced.
*/
function DesktopOnboardingEntry({ useOnboarding, useAccount, setVisible, ...props }) {
	const locale = props.t("onboardingArtworkLocale");
	const state = useOnboarding((value) => value);
	const account = useAccount((value) => value);
	(0, react.useLayoutEffect)(() => {
		if (!state.visible) return;
		const bridge = globalThis.dshOnboarding;
		bridge?.setActive(true);
		return () => {
			bridge?.setActive(false);
		};
	}, [state.visible]);
	const [lastVisible, setLastVisible] = (0, react.useState)(state.visible ? state : null);
	const done = !state.visible && state.progress.step === "done" && account.view?.status === "credential-stored";
	const pendingCompletion = done && state.status === "saving";
	const completed = done && state.status === "ready";
	const exiting = completed && lastVisible !== null && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	(0, react.useLayoutEffect)(() => {
		if (state.visible) setLastVisible(state);
		else if (!completed && !pendingCompletion) setLastVisible(null);
	}, [
		state,
		completed,
		pendingCompletion
	]);
	(0, react.useEffect)(() => {
		if (!exiting) return;
		const timer = window.setTimeout(() => {
			setLastVisible(null);
		}, 180);
		return () => {
			window.clearTimeout(timer);
		};
	}, [exiting]);
	const displayed = state.visible ? state : exiting || pendingCompletion ? lastVisible : null;
	const visible = displayed !== null || state.status === "loading";
	(0, react.useLayoutEffect)(() => {
		setVisible(visible);
	}, [setVisible, visible]);
	if (displayed === null) return state.status === "loading" ? (0, react_jsx_runtime.jsx)(OnboardingSurface, { children: (0, react_jsx_runtime.jsx)("div", {
		role: "status",
		children: props.t("onboardingLoading")
	}) }) : null;
	return (0, react_jsx_runtime.jsx)(DesktopOnboarding, {
		...props,
		locale,
		state: pendingCompletion ? {
			...displayed,
			status: "saving"
		} : displayed,
		account,
		exiting
	});
}
