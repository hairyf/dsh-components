// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/SignInDialog.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Account authorization dialog; errors allow retry after cancelling any active attempt. */
/** @param props - safe account state, localized copy, and user actions. @returns login dialog. */
function SignInDialog({ account, colorScheme, start, cancel, close, useApiKey, t }) {
	const [busy, setBusy] = (0, react.useState)(false);
	const [failed, setFailed] = (0, react.useState)(false);
	const [copyResult, setCopyResult] = (0, react.useState)(null);
	const attempt = account.view?.attempt;
	(0, react.useEffect)(() => {
		setCopyResult(null);
	}, [attempt?.id, attempt?.authorizeUrl]);
	(0, react.useEffect)(() => {
		if (copyResult === null) return;
		const timer = setTimeout(() => {
			setCopyResult(null);
		}, 2e3);
		return () => {
			clearTimeout(timer);
		};
	}, [copyResult]);
	const authorizeUrl = attempt?.authorizeUrl;
	const phase = attempt?.phase;
	const active = busy || phase === "initializing" || phase === "waiting-browser" || phase === "exchanging" || phase === "committing";
	const expired = phase === "expired";
	const localFailure = failed || account.loginFailed || account.failed;
	const error = localFailure || phase === "failed";
	const failureKey = !localFailure && phase === "failed" && attempt?.errorCode === "no-response" ? "noResponse" : "failed";
	const waiting = active && !error;
	const committing = phase === "committing";
	(0, react.useEffect)(() => {
		if (account.view?.status === "credential-stored") close();
	}, [account.view?.status, close]);
	const run = async (action) => {
		setBusy(true);
		setFailed(false);
		try {
			await action();
		} catch {
			setFailed(true);
		} finally {
			setBusy(false);
		}
	};
	const dismiss = () => {
		if (committing || busy) return;
		if (active && attempt) run(async () => {
			await cancel(attempt.id);
			close();
		});
		else close();
	};
	const retry = async () => {
		if (active && attempt) await cancel(attempt.id);
		await start();
	};
	const copyLink = async (authorizeUrl) => {
		try {
			await navigator.clipboard.writeText(authorizeUrlWithTheme(authorizeUrl, colorScheme));
			setCopyResult({ messageKey: "copiedLink" });
		} catch {
			setCopyResult({ messageKey: "copyFailed" });
		}
	};
	const title = error ? t("failureTitle") : active ? t("browserTitle") : expired ? t("timeoutTitle") : t("loginTitle");
	return (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
		open: true,
		headless: true,
		title,
		onClose: dismiss,
		className: SignInDialog_module_css_default.dialog,
		children: [(0, react_jsx_runtime.jsxs)("div", {
			className: SignInDialog_module_css_default.content,
			children: [(0, react_jsx_runtime.jsxs)("div", {
				className: SignInDialog_module_css_default.header,
				children: [(0, react_jsx_runtime.jsx)("h2", {
					className: SignInDialog_module_css_default.title,
					children: title
				}), (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: SignInDialog_module_css_default.close,
					"aria-label": t("close"),
					onClick: dismiss,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 14 })
				})]
			}), waiting ? (0, react_jsx_runtime.jsxs)("p", {
				className: SignInDialog_module_css_default.description,
				children: [
					t("browserPrompt"),
					(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: SignInDialog_module_css_default.link,
						disabled: !authorizeUrl,
						onClick: authorizeUrl ? () => {
							copyLink(authorizeUrl);
						} : void 0,
						children: t(copyResult?.messageKey ?? "copyLink")
					}),
					t("browserDescription")
				]
			}) : (0, react_jsx_runtime.jsx)("p", {
				className: SignInDialog_module_css_default.description,
				children: error ? t(failureKey) : expired ? t("timeoutDescription") : t("loginDescription")
			})]
		}), (0, react_jsx_runtime.jsxs)("div", {
			className: SignInDialog_module_css_default.actions,
			children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
				variant: "outline",
				className: SignInDialog_module_css_default.secondaryButton,
				disabled: committing || busy,
				onClick: active ? dismiss : useApiKey,
				children: t(active ? "cancel" : "addApiKey")
			}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
				variant: "primary",
				className: SignInDialog_module_css_default.primaryButton,
				disabled: busy || committing || waiting || account.view === void 0,
				"aria-label": waiting ? t("waiting") : void 0,
				onClick: () => {
					run(retry);
				},
				children: waiting ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLoadingOutlineRegular, { className: SignInDialog_module_css_default.spinner }) : t(expired || error ? "retry" : "signIn")
			})]
		})]
	});
}
