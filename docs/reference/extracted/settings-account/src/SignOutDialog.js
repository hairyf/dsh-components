// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/SignOutDialog.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Account sign-out confirmation with the current task impact. */
/** @param props - task impact at opening, localized copy, and account actions. @returns sign-out confirmation. */
function SignOutDialog({ running, signOut, close, t }) {
	const [busy, setBusy] = (0, react.useState)(false);
	const [failed, setFailed] = (0, react.useState)(false);
	const dismiss = () => {
		if (!busy) close();
	};
	const confirm = async () => {
		setBusy(true);
		setFailed(false);
		try {
			await signOut();
			close();
		} catch {
			setFailed(true);
		} finally {
			setBusy(false);
		}
	};
	return (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
		open: true,
		headless: true,
		title: t("signOut"),
		onClose: dismiss,
		className: SignInDialog_module_css_default.dialog,
		children: [(0, react_jsx_runtime.jsxs)("div", {
			className: SignInDialog_module_css_default.content,
			children: [
				(0, react_jsx_runtime.jsxs)("div", {
					className: SignInDialog_module_css_default.header,
					children: [(0, react_jsx_runtime.jsx)("h2", {
						className: SignInDialog_module_css_default.title,
						children: t("signOut")
					}), (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: SignInDialog_module_css_default.close,
						"aria-label": t("close"),
						disabled: busy,
						onClick: dismiss,
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 14 })
					})]
				}),
				(0, react_jsx_runtime.jsx)("p", {
					className: SignInDialog_module_css_default.description,
					children: t(running === "unknown" ? "signOutUnknownDescription" : running ? "signOutRunningDescription" : "signOutDescription")
				}),
				failed && (0, react_jsx_runtime.jsx)("p", {
					className: SignInDialog_module_css_default.description,
					role: "alert",
					children: t("failed")
				})
			]
		}), (0, react_jsx_runtime.jsxs)("div", {
			className: SignInDialog_module_css_default.actions,
			children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
				variant: "outline",
				className: SignInDialog_module_css_default.secondaryButton,
				disabled: busy,
				onClick: dismiss,
				children: t("cancel")
			}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
				variant: "primary",
				className: SignInDialog_module_css_default.primaryButton,
				disabled: busy,
				onClick: () => {
					confirm();
				},
				children: t("signOut")
			})]
		})]
	});
}
