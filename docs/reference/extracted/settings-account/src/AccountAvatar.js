// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/AccountAvatar.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Shared account picture with an icon fallback for missing or unavailable images. */
/**
* Render a decorative avatar next to the account identity.
* @param props - shared browser load outcome and rendered-image failure reporter; absent data uses the default icon.
* @returns picture or the default account icon.
*/
function AccountAvatar({ avatar, avatarFailed }) {
	return avatar?.status === "ready" ? (0, react_jsx_runtime.jsx)("img", {
		className: AccountAvatar_module_css_default.image,
		src: avatar.url,
		alt: "",
		referrerPolicy: "no-referrer",
		onError: () => {
			avatarFailed(avatar);
		}
	}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconUserOutlineMedium, { size: 16 });
}
