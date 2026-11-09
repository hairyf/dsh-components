// Extracted from @deepseek-ai/dsh-client-ui-schedule (lib/client.js); region lib/types/client/NewSessionLimit.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Display the Host's effective admission interval before selecting per-run conversations. */
/** Read the configured interval through an injected action; failed reads stay visible and retryable.
* @param props - The failure-contained read action and task-manager translations.
* @returns The configured interval, a loading indicator, or a retryable failure.
*/
function NewSessionLimit({ load, t }) {
	const [attempt, setAttempt] = (0, react.useState)(0);
	const [interval, setInterval] = (0, react.useState)("loading");
	(0, react.useEffect)(() => {
		let active = true;
		setInterval("loading");
		load().then((seconds) => {
			if (active) setInterval(seconds ?? "error");
		});
		return () => {
			active = false;
		};
	}, [load, attempt]);
	if (interval === "loading") return (0, react_jsx_runtime.jsx)("div", {
		className: TaskManagerPage_module_css_default.saveNotice,
		role: "status",
		"aria-label": t("host.limitsLoading"),
		children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" })
	});
	if (interval === "error") return (0, react_jsx_runtime.jsxs)("div", {
		className: TaskManagerPage_module_css_default.notice,
		children: [(0, react_jsx_runtime.jsx)("p", {
			role: "alert",
			children: t("host.limitsError")
		}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
			size: "sm",
			onClick: () => {
				setAttempt((value) => value + 1);
			},
			children: t("list.retry")
		})]
	});
	const unit = interval % 3600 === 0 ? "hour" : interval % 60 === 0 ? "minute" : "second";
	const value = interval / (unit === "hour" ? 3600 : unit === "minute" ? 60 : 1);
	const label = new Intl.NumberFormat(t("time.locale"), {
		style: "unit",
		unit,
		unitDisplay: "long"
	}).format(value);
	return (0, react_jsx_runtime.jsx)("p", {
		className: TaskManagerPage_module_css_default.saveNotice,
		children: t("host.newSessionInterval", { interval: label })
	});
}
