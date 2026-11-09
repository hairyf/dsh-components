// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/AccountNotice.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Sidebar bonus notice. The card reports a display once it has a position, the
* document is visible, and it has painted one frame: that is the whole signal,
* and the card measures no cover, so a painted card behind the open Settings
* overlay reports the same way as any other. Closing counts as a display too,
* because the user acted on it. An award that expired before a render is not
* drawn at all.
*/
/** @param expiresAt - server expiration timestamp. @returns whether the award can still be spent. */
function live(expiresAt) {
	if (expiresAt === "") return true;
	const expires = Date.parse(expiresAt);
	return Number.isNaN(expires) || expires > Date.now();
}
/**
* @param run - callback to invoke once one presented frame has passed.
* @returns a canceller for a card that unmounts or hides first.
*/
function afterPaint(run) {
	if (typeof requestAnimationFrame !== "function") {
		const timer = setTimeout(run, 0);
		return () => {
			clearTimeout(timer);
		};
	}
	let cancelled = false;
	let timer;
	const frame = requestAnimationFrame(() => {
		timer = setTimeout(() => {
			if (!cancelled) run();
		}, 0);
	});
	return () => {
		cancelled = true;
		cancelAnimationFrame(frame);
		if (timer !== void 0) clearTimeout(timer);
	};
}
/** @param props - server-ordered notices, localized fallback copy, anchor, and display callbacks.
* @returns a non-modal stack whose foreground card alone can report display or be closed.
*/
function AccountNoticeStack({ notices, anchor, title, closeLabel, onShown, onDismiss }) {
	const [position, setPosition] = (0, react.useState)();
	(0, react.useLayoutEffect)(() => {
		if (!anchor.current) return;
		const element = anchor.current;
		const update = () => {
			const rect = element.getBoundingClientRect();
			setPosition({
				left: Math.max(8, Math.min(rect.left, window.innerWidth - 288)),
				bottom: Math.max(8, window.innerHeight - rect.top + 4)
			});
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(element);
		window.addEventListener("resize", update);
		window.addEventListener("scroll", update, true);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", update);
			window.removeEventListener("scroll", update, true);
		};
	}, [anchor]);
	const liveNotices = notices.filter((notice) => live(notice.expiresAt));
	return (0, react_dom.createPortal)((0, react_jsx_runtime.jsx)("div", {
		className: AccountNotice_module_css_default.stack,
		style: position ?? { visibility: "hidden" },
		children: liveNotices.map((notice, depth) => (0, react_jsx_runtime.jsx)(NoticeCard, {
			notice,
			depth,
			ready: position !== void 0,
			title: notice.title ?? title,
			closeLabel,
			onShown,
			onDismiss
		}, notice.orderId))
	}), document.body);
}
/** One stable card node remains mounted as the cards before it are dismissed. */
function NoticeCard({ notice, depth, ready, title, closeLabel, onShown, onDismiss }) {
	const foreground = depth === 0;
	const reported = (0, react.useRef)(false);
	(0, react.useEffect)(() => {
		if (!ready || !foreground || reported.current || !live(notice.expiresAt)) return;
		let cancel;
		const attempt = () => {
			if (reported.current || cancel !== void 0 || !live(notice.expiresAt)) return;
			if (document.visibilityState === "hidden") return;
			cancel = afterPaint(() => {
				cancel = void 0;
				if (reported.current || document.visibilityState === "hidden" || !live(notice.expiresAt)) return;
				reported.current = true;
				onShown(notice.orderId);
			});
		};
		attempt();
		document.addEventListener("visibilitychange", attempt);
		return () => {
			document.removeEventListener("visibilitychange", attempt);
			cancel?.();
		};
	}, [
		ready,
		foreground,
		notice.orderId,
		notice.expiresAt,
		onShown
	]);
	return (0, react_jsx_runtime.jsxs)("aside", {
		className: AccountNotice_module_css_default.card,
		"data-front": foreground,
		"aria-hidden": !foreground,
		style: {
			"--notice-depth": depth,
			"--notice-scale": Math.pow(272 / 280, depth)
		},
		children: [(0, react_jsx_runtime.jsxs)("div", {
			role: "status",
			className: AccountNotice_module_css_default.copy,
			children: [(0, react_jsx_runtime.jsxs)("div", {
				className: AccountNotice_module_css_default.title,
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: AccountNotice_module_css_default.icon,
					"aria-hidden": "true",
					children: (0, react_jsx_runtime.jsxs)("svg", {
						width: "14",
						height: "14",
						viewBox: "0 0 14 14",
						fill: "none",
						children: [(0, react_jsx_runtime.jsx)("path", {
							d: "M3.6355 6.93969C3.6355 4.8398 5.33779 3.1375 7.43768 3.1375C9.53757 3.1375 11.23987 4.8398 11.23987 6.93968V11.363H3.6355V6.93969Z",
							fill: "currentColor",
							fillOpacity: "0.2",
							stroke: "currentColor",
							strokeWidth: "0.875"
						}), (0, react_jsx_runtime.jsx)("path", {
							d: "M1.641 11.3645H12.36M5.053 13.3095H8.9479M7.4375 4.27422V2.70137912",
							stroke: "currentColor",
							strokeWidth: "0.875"
						})]
					})
				}), (0, react_jsx_runtime.jsx)("span", { children: title })]
			}), (0, react_jsx_runtime.jsx)("p", { children: notice.message })]
		}), (0, react_jsx_runtime.jsx)("button", {
			type: "button",
			tabIndex: foreground ? void 0 : -1,
			className: AccountNotice_module_css_default.close,
			"aria-label": closeLabel,
			onClick: (event) => {
				dismissNotice(event.currentTarget.parentElement, () => {
					onDismiss(notice.orderId);
				});
			},
			children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 10 })
		})]
	});
}
