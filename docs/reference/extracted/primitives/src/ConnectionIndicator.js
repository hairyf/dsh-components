// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/ConnectionIndicator.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Exit-transition length; keep equal to the `.leaving` transition duration in the stylesheet. */
const EXIT_MS = 150;
/**
* Render an inline connection-recovery control. The outage and retry-attempt
* states are one button whose static label already names the retry action;
* clicking it requests an immediate reconnect. The indicator animates in on
* appearance and fades out for {@link EXIT_MS} before unmounting.
* @param props.state - visible outage, retry-attempt, or recovered state.
* @param props.disconnectedLabel - localized outage text naming the retry action.
* @param props.connectingLabel - localized retry text followed by the attempt dots.
* @param props.recoveredLabel - localized recovery confirmation.
* @param props.reconnectActionLabel - accessible label for the outage action.
* @param props.restartActionLabel - accessible label for replacing an active attempt.
* @param props.onReconnect - request an immediate reconnect attempt.
* @returns the indicator, or null when no connection feedback is active.
*/
function ConnectionIndicator({ state, disconnectedLabel, connectingLabel, recoveredLabel, reconnectActionLabel, restartActionLabel, onReconnect }) {
	const [rendered, setRendered] = useState(state);
	const leaving = state === void 0 && rendered !== void 0;
	useEffect(() => {
		if (state !== void 0) {
			setRendered(state);
			return;
		}
		if (rendered === void 0) return;
		const timeout = window.setTimeout(() => {
			setRendered(void 0);
		}, EXIT_MS);
		return () => {
			window.clearTimeout(timeout);
		};
	}, [state, rendered]);
	if (rendered === void 0) return null;
	const leavingClass = leaving ? ` ${css$25.leaving}` : "";
	if (rendered === "recovered") return jsxs("div", {
		className: `${css$25.indicator} ${css$25.success}${leavingClass}`,
		role: "status",
		"aria-label": recoveredLabel,
		children: [jsx("span", {
			className: css$25.icon,
			"aria-hidden": "true",
			children: jsx(IconCheckOutlineRegular, { size: 14 })
		}), jsx("span", {
			className: css$25.label,
			children: recoveredLabel
		})]
	});
	const connecting = rendered === "connecting";
	return jsxs("button", {
		type: "button",
		className: `${css$25.indicator} ${css$25.warning}${leavingClass}`,
		"data-phase": rendered,
		"aria-label": connecting ? restartActionLabel : reconnectActionLabel,
		onClick: onReconnect,
		children: [jsx("span", {
			className: css$25.icon,
			"aria-hidden": "true",
			children: connecting ? jsx(StateDot, { state: "ongoing" }) : jsx(IconRefreshOutlineRegular, { size: 14 })
		}), jsx("span", {
			className: css$25.label,
			children: connecting ? jsxs(Fragment, { children: [connectingLabel, jsxs("span", {
				className: css$25.dots,
				"aria-hidden": "true",
				children: [
					jsx("span", { children: "." }),
					jsx("span", {
						className: css$25.secondDot,
						children: "."
					}),
					jsx("span", {
						className: css$25.thirdDot,
						children: "."
					})
				]
			})] }) : disconnectedLabel
		})]
	});
}
