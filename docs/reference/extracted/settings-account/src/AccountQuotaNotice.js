// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/AccountQuotaNotice.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Account-owned take-over of the frame-wide quota notice for account balances. */
/**
* @param props - the claimed notice, account state, and the shared Platform page channel.
* @returns the balance Modal, nothing while awaiting account state or a Platform page's return, or the fallback Toast.
*/
function AccountQuotaNotice({ matched, openPlatformPage, useAccount, usePlatformPage, t }) {
	const { dismiss, keepOpen, message } = matched;
	const accountStatus = useAccount((snapshot) => snapshot.view?.status);
	const accountFailed = useAccount((snapshot) => snapshot.failed);
	const signedIn = accountStatus === "credential-stored";
	const platformPage = usePlatformPage((current) => current);
	const [opened, setOpened] = (0, react.useState)(false);
	const previousSignedIn = (0, react.useRef)(signedIn);
	const releaseHold = (0, react.useRef)(void 0);
	const releasePage = (0, react.useRef)(void 0);
	const releaseClaims = () => {
		releasePage.current?.();
		releasePage.current = void 0;
		releaseHold.current?.();
		releaseHold.current = void 0;
	};
	(0, react.useEffect)(() => releaseClaims, []);
	(0, react.useEffect)(() => {
		if (previousSignedIn.current && !signedIn) {
			releaseClaims();
			dismiss();
		}
		previousSignedIn.current = signedIn;
	}, [dismiss, signedIn]);
	if (accountStatus === void 0 && !accountFailed && openPlatformPage !== void 0) return null;
	if (!signedIn || openPlatformPage === void 0) return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
		text: message,
		icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, { size: 18 }),
		onDone: dismiss
	});
	if (opened || platformPage !== null) return null;
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
		open: true,
		title: t("quotaTitle"),
		closeLabel: t("close"),
		onClose: dismiss,
		description: t("quotaDescription"),
		footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
			variant: "outline",
			onClick: dismiss,
			children: t("cancel")
		}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
			variant: "primary",
			onClick: () => {
				releaseHold.current = keepOpen();
				releasePage.current = openPlatformPage("top-up", () => {
					releasePage.current = void 0;
					dismiss();
				});
				setOpened(true);
			},
			children: t("quotaTopUp")
		})] })
	});
}
