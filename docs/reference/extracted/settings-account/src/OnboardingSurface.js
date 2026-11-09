// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/OnboardingSurface.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Body-portaled introduction with shared background interaction ownership. */
/**
* Render a body-portaled onboarding stage and keep the application root inert
* while mounted. Completion reveals the root beneath a fading stage;
* native titlebar controls, dialogs, and account pages remain above the stage.
* @param props.children - the step's page content, centered on the stage.
* @param props.exiting - reveal the application while the owner retains the stage for its 180ms exit.
* @returns the body-portaled overlay tree.
*/
function OnboardingSurface({ children, exiting = false }) {
	const rootState = (0, react.useRef)(null);
	(0, react.useLayoutEffect)(() => {
		const appRoot = document.getElementById("root");
		if (appRoot === null) return;
		const releaseInert = acquireOverlayInert(appRoot);
		const previousOpacity = appRoot.style.opacity;
		rootState.current = {
			element: appRoot,
			opacity: previousOpacity
		};
		appRoot.style.opacity = "0";
		return () => {
			releaseInert();
			appRoot.style.opacity = previousOpacity;
			rootState.current = null;
		};
	}, []);
	(0, react.useLayoutEffect)(() => {
		const root = rootState.current;
		if (root !== null) root.element.style.opacity = exiting ? root.opacity : "0";
	}, [exiting]);
	return (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)("div", {
		className: OnboardingSurface_module_css_default.onboardingOverlay,
		"data-exiting": exiting || void 0,
		role: "presentation",
		children: [(0, react_jsx_runtime.jsx)("div", {
			className: OnboardingSurface_module_css_default.dragBand,
			"data-window-drag": true,
			"aria-hidden": "true"
		}), (0, react_jsx_runtime.jsx)("div", {
			className: OnboardingSurface_module_css_default.onboardingStage,
			children
		})]
	}), document.body);
}
