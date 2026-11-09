// Extracted from @deepseek-ai/dsh-client-ui-settings-general (lib/client.js); region lib/types/client/DesktopUpdateIndicator.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Optional Electron status presentation; the native shell owns actions and Web owns visible copy. */
const BUSY_PHASES = new Set([
	"checking",
	"downloading",
	"verifying",
	"installing"
]);
function updateCopy(state, t) {
	const label = {
		idle: "",
		checking: t("desktop.update.checking"),
		available: t("desktop.update.available"),
		downloading: t("desktop.update.progress", { percent: state.percent ?? 0 }),
		verifying: t("desktop.update.verifying"),
		installing: t("desktop.update.installing"),
		ready: t("desktop.update.ready"),
		error: t("desktop.update.retry")
	}[state.phase];
	if (state.phase === "checking" || state.phase === "verifying" || state.phase === "installing") return {
		label,
		detail: state.version ?? label
	};
	if (state.phase === "error") return {
		label,
		detail: {
			check: t("desktop.update.checkFailed"),
			"check-network": t("desktop.update.checkNetworkFailed"),
			download: t("desktop.update.downloadFailed"),
			"download-network": t("desktop.update.downloadNetworkFailed"),
			install: t("desktop.update.installFailed"),
			"install-network": t("desktop.update.installNetworkFailed"),
			"stop-failed": t("desktop.update.stopFailed"),
			"tasks-changed": t("desktop.update.tasksChanged"),
			"tasks-unavailable": t("desktop.update.tasksUnavailable"),
			"fullscreen-timeout": t("desktop.update.fullscreenTimeout")
		}[state.failure ?? "install"]
	};
	if (state.phase === "downloading" && state.version !== void 0) return {
		label,
		detail: t("desktop.update.downloadDetail", {
			percent: state.percent ?? 0,
			version: state.version
		})
	};
	return {
		label,
		detail: state.version === void 0 ? label : t("desktop.update.versionDetail", {
			label,
			version: state.version
		})
	};
}
/**
* Render update status with connection-indicator geometry and brand-blue labels, including retries.
* @param props - Connection priority, sidebar width, and localized bridge-failure copy.
* @returns Desktop-only status beside the account button, or nothing in browsers.
*/
function DesktopUpdateIndicator({ wide, hidden, t, view, onOpen }) {
	const { presentation: state, failed, opening } = view;
	if (!wide || hidden || !failed && (state === void 0 || state.phase === "idle")) return null;
	const retryLabel = t("desktop.update.retry");
	const copy = state === void 0 ? {
		label: retryLabel,
		detail: retryLabel
	} : updateCopy(state, t);
	const label = failed ? retryLabel : copy.label;
	const error = failed || state?.phase === "error";
	const busy = opening || state !== void 0 && BUSY_PHASES.has(state.phase);
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
		label: failed ? retryLabel : copy.detail,
		side: "top",
		children: (0, react_jsx_runtime.jsxs)("button", {
			type: "button",
			className: DesktopUpdateIndicator_module_css_default.indicator,
			"aria-label": label,
			"aria-disabled": busy,
			onClick: () => {
				if (!busy) onOpen();
			},
			children: [(0, react_jsx_runtime.jsx)("span", {
				className: DesktopUpdateIndicator_module_css_default.icon,
				"aria-hidden": "true",
				children: error ? (0, react_jsx_runtime.jsx)("span", { className: DesktopUpdateIndicator_module_css_default.errorDot }) : busy ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLoadingOutlineRegular, {
					className: DesktopUpdateIndicator_module_css_default.spinner,
					size: 14
				}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDownloadOutlineRegular, { size: 14 })
			}), (0, react_jsx_runtime.jsx)("span", { children: label })]
		})
	});
}
/**
* @param props - Framework-bound carrier and connection state.
* @returns A non-interactive brand-blue notification on the sidebar expand button.
*/
function DesktopUpdateBadge({ useDesktopUpdate, useConnectionState, t }) {
	const { presentation: state, failed } = useDesktopUpdate((value) => value);
	const connection = useConnectionState((value) => value);
	if ((connection === "disconnected" || connection === "connecting") && state?.phase !== "installing" || !failed && (state === void 0 || state.phase === "idle")) return null;
	const retryLabel = t("desktop.update.retry");
	const copy = state === void 0 ? {
		label: retryLabel,
		detail: retryLabel
	} : updateCopy(state, t);
	const label = failed ? retryLabel : copy.label;
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
		label: failed ? label : copy.detail,
		side: "right",
		children: (0, react_jsx_runtime.jsx)("span", {
			role: "img",
			"aria-label": label,
			className: DesktopUpdateIndicator_module_css_default.badge
		})
	});
}
