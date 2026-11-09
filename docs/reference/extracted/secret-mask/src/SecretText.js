// Extracted from @deepseek-ai/dsh-client-ui-secret-mask (lib/client.js); region lib/types/client/SecretText.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Masked credential presentation with a per-value reveal control in interactive text. */
		const EYE_CONTOUR = "M1.5 8C2.9 5.25 5.25 3.5 8 3.5C10.75 3.5 13.1 5.25 14.5 8C13.1 10.75 10.75 12.5 8 12.5C5.25 12.5 2.9 10.75 1.5 8Z";
		const EYE_PATH = `${EYE_CONTOUR}M10 8C10 9.1 9.1 10 8 10C6.9 10 6 9.1 6 8C6 6.9 6.9 6 8 6C9.1 6 10 6.9 10 8Z`;
		/** The struck-through glyph drops the pupil so it stays distinct at text size. */
		const EYE_OFF_PATH = `${EYE_CONTOUR}M2.5 2.5L13.5 13.5`;
		const MASK_RUNS = new RegExp(`(\\*+)`, "u");
		function EyeGlyph({ path }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				className: SecretText_module_css_default.icon,
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.3,
				strokeLinecap: "round",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", { d: path })
			});
		}
		/**
		* Split the masked form into kept text and mask runs. Mask runs keep their
		* characters for copying and assistive technology but draw centered marks,
		* because a font's own asterisk sits near the cap height.
		*/
		function MaskedText({ masked }) {
			let offset = 0;
			return masked.split(MASK_RUNS).map((part) => {
				const key = offset;
				offset += part.length;
				if (part === "") return null;
				return part.startsWith("*") ? (0, react_jsx_runtime.jsx)("span", {
					className: SecretText_module_css_default.mask,
					children: part
				}, key) : (0, react_jsx_runtime.jsx)("span", { children: part }, key);
			});
		}
		/**
		* Draw one credential masked; interactive text adds a control that reveals or hides this value.
		* Every mount, and every different original value at the same position, starts masked.
		* @param props - masked node, original spelling, interaction mode, and locale seat.
		* @returns an inline masked run with an optional reveal control.
		*/
		function SecretText({ node, raw, interactive, t }) {
			const [revealedRaw, setRevealedRaw] = (0, react.useState)();
			const revealed = interactive && revealedRaw === raw;
			return (0, react_jsx_runtime.jsxs)("span", {
				className: SecretText_module_css_default.secret,
				"data-secret": "",
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: SecretText_module_css_default.value,
					children: revealed ? raw : (0, react_jsx_runtime.jsx)(MaskedText, { masked: node.data.masked })
				}), interactive && (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: SecretText_module_css_default.toggle,
					"aria-pressed": revealed,
					"aria-label": t(revealed ? "secret.hide" : "secret.reveal"),
					onClick: () => {
						setRevealedRaw(revealed ? void 0 : raw);
					},
					children: (0, react_jsx_runtime.jsx)(EyeGlyph, { path: revealed ? EYE_OFF_PATH : EYE_PATH })
				})]
			});
		}
