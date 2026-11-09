// Extracted from @deepseek-ai/dsh-client-ui-sidebar-browser (lib/client.js); region lib/types/client/view/BrowserTitle.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Browser icon and current host name. */
		function BrowserTitle({ useTabInfo, useStore }) {
			const { tab } = useTabInfo();
			const entry = useStore((state) => currentBrowserTarget(state.byTab[tab.id]));
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconGlobeOutlineRegular, { className: Browser_module_css_default.titleIcon }), entry?.title ?? tab.title] });
		}
		/**
		* Parse one address-bar value into the fixed protocol allowlist.
		* @param input - user or typed-open input.
		* @param applicationOrigin - current DSH document origin, blocked for HTTPS.
		* @returns a canonical target or the refusal reason.
		*/
		function parseBrowserAddress(input, applicationOrigin) {
			const trimmed = input.trim();
			if (trimmed === "") return {
				ok: false,
				reason: "empty"
			};
			if (trimmed.length > 16384) return {
				ok: false,
				reason: "invalid"
			};
			const candidate = /^[A-Za-z][A-Za-z\d+.-]*:(?!\d+(?:[/?#]|$))/u.test(trimmed) ? trimmed : `https://${trimmed}`;
			let url;
			try {
				url = new URL(candidate);
			} catch {
				return {
					ok: false,
					reason: "invalid"
				};
			}
			if (url.username !== "" || url.password !== "") return {
				ok: false,
				reason: "credentials"
			};
			if (url.protocol === "https:" || url.protocol === "http:") {
				if (applicationOrigin !== void 0 && applicationOrigin !== "null") try {
					if (url.origin === new URL(applicationOrigin).origin) return {
						ok: false,
						reason: "application-origin"
					};
				} catch {}
				return {
					ok: true,
					target: {
						kind: url.protocol === "https:" ? "https" : "http",
						url: url.href,
						title: url.hostname
					}
				};
			}
			return {
				ok: false,
				reason: "protocol"
			};
		}
