// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/user-text.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render an uninterpreted inline text run.
* @param props - text retained verbatim from the caller's document.
* @returns one inline run without Markdown or reference recognition.
*/
function UserTextRun({ text }) {
	return jsx("span", {
		className: css$27.plainRun,
		children: text
	});
}
/**
* Render a reference label or its explicitly supplied activation action.
* Text selection and repeated pointer clicks do not activate the reference.
* @param props - resolved visual fields and optional action from the owning renderer.
* @returns an inline label, or a keyboard-accessible button when activation is supplied.
*/
function ReferenceChip({ appearance, label, title, onActivate, contextMenuProps }) {
	const slash = appearance === "skill" || appearance === "command";
	const contents = jsxs(Fragment, { children: [!slash && jsx(ReferenceIconRegular, {
		kind: appearance,
		size: 16,
		className: css$27.refIcon
	}), label] });
	const className = clsx(css$27.refChip, slash && css$27.slashChip);
	return onActivate === void 0 ? jsx("span", {
		...contextMenuProps,
		className,
		"data-ref-chip": appearance,
		title,
		children: contents
	}) : jsx("button", {
		type: "button",
		...contextMenuProps,
		className: clsx(className, markdownCss.fileMention),
		"data-ref-chip": appearance,
		title,
		onClick: (event) => {
			if (event.detail > 1 || event.detail !== 0 && event.currentTarget.ownerDocument.getSelection()?.isCollapsed === false) return;
			onActivate();
		},
		children: contents
	});
}
