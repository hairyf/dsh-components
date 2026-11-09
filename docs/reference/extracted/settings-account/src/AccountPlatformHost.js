// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/AccountPlatformHost.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* @param props - the native commands, the live page request, and its dismissal.
* @returns the native Platform container, or null while no page is requested.
*/
function AccountPlatformHost({ platform, usePage, closePage, t }) {
	const claim = usePage((current) => current);
	if (claim === null) return null;
	return (0, react_jsx_runtime.jsx)(PlatformOverlay, {
		bridge: platform,
		page: claim.page,
		backLabel: t("backToHarness"),
		loadingLabel: t("loading"),
		failureLabel: t("platformFailed"),
		retryLabel: t("platformRetry"),
		onClose: closePage
	});
}
