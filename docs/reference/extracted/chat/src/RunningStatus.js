// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/RunningStatus.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Running Turn clock isolated from the transcript's render cycle. */
/**
* Show live elapsed time after the current Turn's content without announcing ticks.
* @param props - Current Turn start time, pause state, and localized copy.
* @returns the blue running indicator; mount while the Session is running, or holding its slot hidden until the
* Turn's actions row replaces it.
*/
const RunningStatus = (0, react.memo)(function RunningStatus({ startTime, paused, holding = false, t }) {
	const [now, setNow] = (0, react.useState)(Date.now);
	(0, react.useEffect)(() => {
		if (startTime === void 0 || paused || holding) return;
		setNow(Date.now());
		const timer = setInterval(() => {
			setNow(Date.now());
		}, LIVE_RUN_CLOCK_INTERVAL_MS);
		return () => {
			clearInterval(timer);
		};
	}, [
		startTime,
		paused,
		holding
	]);
	const label = startTime === void 0 ? t("chat.deepDiving") : t("chat.deepDivingFor", { duration: formatRunDuration(Math.max(1e3, now - startTime), t).map((part) => part.text).join("") });
	return (0, react_jsx_runtime.jsxs)("div", {
		className: ChatView_module_css_default.running,
		"data-chat-running": true,
		"data-holding": holding ? "" : void 0,
		"aria-hidden": holding || void 0,
		children: [
			holding ? null : (0, react_jsx_runtime.jsx)("span", {
				className: accessibility_module_css_default.visuallyHidden,
				role: "status",
				"aria-live": "polite",
				"aria-atomic": "true",
				children: t("chat.deepDiving")
			}),
			(0, react_jsx_runtime.jsx)("span", {
				className: ChatView_module_css_default.runningDivider,
				"aria-hidden": "true"
			}),
			(0, react_jsx_runtime.jsxs)("span", {
				className: ChatView_module_css_default.runningContent,
				children: [(0, react_jsx_runtime.jsx)(RunningWhaleTail, {}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, {
					active: !holding,
					className: ChatView_module_css_default.runningText,
					children: label
				})]
			})
		]
	});
});
