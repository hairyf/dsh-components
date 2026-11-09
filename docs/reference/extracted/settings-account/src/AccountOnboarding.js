// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/AccountOnboarding.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Account choice inside the model credential onboarding step. */
/** @param props - onboarding completion, account state and actions. @returns account dialog while signed out. */
function AccountOnboarding({ complete, useApiKey, useAccount, useTheme, setOnboarding, showLogin, start, cancel, t }) {
	const account = useAccount((value) => value);
	const colorScheme = useTheme((snapshot) => snapshot.active.colorScheme);
	(0, react.useEffect)(() => {
		setOnboarding(true);
		return () => {
			setOnboarding(false);
		};
	}, [setOnboarding]);
	(0, react.useEffect)(() => {
		if (account.view?.status === "credential-stored") complete();
	}, [account.view?.status, complete]);
	if (!account.view || account.view.status === "credential-stored") return null;
	return (0, react_jsx_runtime.jsx)(SignInDialog, {
		account,
		colorScheme,
		start,
		cancel,
		t,
		close: () => {
			showLogin(false);
			complete();
		},
		useApiKey: () => {
			showLogin(false);
			useApiKey();
		}
	});
}
