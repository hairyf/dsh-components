// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/CodeToolbar.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Shared language, wrapping, and clipboard controls for code cards. */
/**
* Render a language label and keyboard-accessible icon actions with tooltips.
* @param props - Localized labels, current state, and card-owned actions.
* @returns The shared code-card header.
*/
function CodeToolbar({ lang, title, status, labels, copyLabel, copiedLabel, copied, wrapped, onCopy, onWrap }) {
	const wrapLabel = wrapped ? labels.unwrapLabel : labels.wrapLabel;
	const clipboardLabel = copied ? copiedLabel : copyLabel;
	return jsxs("div", {
		className: cardCss.header,
		"data-code-block-banner": true,
		children: [jsxs("div", {
			className: cardCss.heading,
			children: [jsx("span", {
				className: cardCss.language,
				children: supportsHighlighting(lang) ? lang : labels.codeLabel
			}), title !== void 0 && jsx("span", {
				className: cardCss.title,
				title,
				children: title
			})]
		}), jsxs("div", {
			className: cardCss.actions,
			children: [
				status !== void 0 && jsx("span", {
					className: cardCss.status,
					children: status
				}),
				onWrap !== void 0 && jsx(Tooltip, {
					label: wrapLabel,
					side: "top",
					portal: true,
					children: jsx("button", {
						type: "button",
						className: cardCss.action,
						"aria-label": labels.wrapLabel,
						"aria-pressed": wrapped,
						onClick: onWrap,
						children: wrapped ? jsx(IconNowrapFillRegular, { size: 14 }) : jsx(IconWrapFillRegular, { size: 14 })
					})
				}),
				onCopy !== void 0 && jsx(Tooltip, {
					label: clipboardLabel,
					side: "top",
					portal: true,
					children: jsx("button", {
						type: "button",
						className: cardCss.action,
						"aria-label": clipboardLabel,
						onClick: onCopy,
						children: copied ? jsx(IconCheckOutlineRegular, { size: 14 }) : jsx(IconCopyOutlineRegular, { size: 14 })
					})
				})
			]
		})]
	});
}
