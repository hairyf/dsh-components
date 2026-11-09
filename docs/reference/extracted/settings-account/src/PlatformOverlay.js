// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/PlatformOverlay.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Desktop Platform viewport; the native child owns remote content and credentials. */
/** @param props - native commands, localized copy, and return action. @returns full-window Platform container. */
function PlatformOverlay({ bridge, page, backLabel, loadingLabel, failureLabel, retryLabel, onClose }) {
	const layer = (0, react.useRef)(null);
	const back = (0, react.useRef)(null);
	const viewport = (0, react.useRef)(null);
	const [attempt, setAttempt] = (0, react.useState)(0);
	const [status, setStatus] = (0, react.useState)("loading");
	(0, react.useLayoutEffect)(() => {
		const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const background = Array.from(document.body.children).filter((element) => element instanceof HTMLElement && element !== layer.current).map((element) => acquireOverlayInert(element));
		back.current?.focus();
		return () => {
			for (const release of background) release();
			if (previousFocus?.isConnected) previousFocus.focus();
		};
	}, []);
	(0, react.useLayoutEffect)(() => {
		back.current?.focus();
	}, [page, attempt]);
	(0, react.useEffect)(() => {
		const element = viewport.current;
		let closed = false;
		const bounds = () => {
			const rect = element.getBoundingClientRect();
			return {
				x: rect.x,
				y: rect.y,
				width: rect.width,
				height: rect.height
			};
		};
		const fail = () => {
			if (!closed) setStatus("failed");
		};
		setStatus("loading");
		bridge.open(page, bounds()).then(() => {
			if (!closed) setStatus("loaded");
		}, fail);
		const observer = new ResizeObserver(() => {
			bridge.setBounds(bounds()).catch(fail);
		});
		observer.observe(element);
		return () => {
			closed = true;
			observer.disconnect();
			bridge.close().catch(() => {});
		};
	}, [
		bridge,
		page,
		attempt
	]);
	return (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)("div", {
		ref: layer,
		className: PlatformOverlay_module_css_default.overlay,
		role: "dialog",
		"aria-modal": "true",
		"aria-label": backLabel,
		children: [(0, react_jsx_runtime.jsx)("header", {
			className: PlatformOverlay_module_css_default.header,
			"data-window-drag": true,
			children: (0, react_jsx_runtime.jsxs)("div", {
				className: PlatformOverlay_module_css_default.controls,
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: PlatformOverlay_module_css_default.trafficLights,
					"aria-hidden": "true"
				}), (0, react_jsx_runtime.jsxs)("button", {
					ref: back,
					className: PlatformOverlay_module_css_default.back,
					onClick: onClose,
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutlineRegular, { size: 16 }), backLabel]
				})]
			})
		}), (0, react_jsx_runtime.jsx)("div", {
			ref: viewport,
			className: PlatformOverlay_module_css_default.viewport,
			children: status !== "loaded" && (0, react_jsx_runtime.jsx)("div", {
				className: PlatformOverlay_module_css_default.status,
				role: "status",
				"aria-label": status === "loading" ? loadingLabel : void 0,
				children: status === "failed" ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
					className: PlatformOverlay_module_css_default.failure,
					children: failureLabel
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					className: PlatformOverlay_module_css_default.retry,
					onClick: () => {
						setAttempt((value) => value + 1);
					},
					children: retryLabel
				})] }) : (0, react_jsx_runtime.jsx)("span", {
					className: PlatformOverlay_module_css_default.spinner,
					"aria-hidden": "true"
				})
			})
		})]
	}), document.body);
}
