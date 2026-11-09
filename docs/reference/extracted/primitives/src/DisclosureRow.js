// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/DisclosureRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render one disclosure header and its controlled expanded content.
* Shallow prop comparison requires stable callbacks and React nodes to skip unchanged renders.
* @param props - Visual content, controlled state, and interaction policy.
* @returns the disclosure row.
*/
const DisclosureRow = memo(function DisclosureRow({ icon, title, open, expandable, onToggle, running = false, expandOnRowClick = false, previewChevron = expandable, keepContentWhenOpen = false, collapsedContent, headerAccessory, children, className, rowClassName, contentClassName, contentLayoutClassName, leadingClassName, chevronClassName, titleClassName }) {
	const rowExpands = expandable && expandOnRowClick;
	const toggleFromLeading = (event) => {
		event.stopPropagation();
		onToggle();
	};
	const toggleFromKeyboard = (event) => {
		if (!rowExpands || event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		onToggle();
	};
	const collapsedLeading = previewChevron ? jsxs(Fragment, { children: [jsx("span", {
		className: css$3.iconIdle,
		children: icon
	}), jsx(IconChevronDownOutlineRegular, { className: clsx(chevronClassName, css$3.chevronHover) })] }) : icon;
	const leading = open ? jsx(IconChevronUpOutlineRegular, { className: chevronClassName }) : collapsedLeading;
	return jsxs("div", {
		className: clsx(css$3.root, className),
		"data-open": open || void 0,
		children: [jsxs("div", {
			className: css$3.header,
			"data-disclosure-header": true,
			"data-has-accessory": !!headerAccessory || void 0,
			children: [jsxs("div", {
				className: clsx(css$3.row, rowClassName),
				"data-disclosure-row": true,
				"data-expandable": rowExpands || void 0,
				role: rowExpands ? "button" : void 0,
				tabIndex: rowExpands ? 0 : void 0,
				"aria-expanded": rowExpands ? open : void 0,
				onClick: rowExpands ? onToggle : void 0,
				onKeyDown: rowExpands ? toggleFromKeyboard : void 0,
				children: [expandable && !rowExpands ? jsx("button", {
					type: "button",
					className: clsx(css$3.leading, leadingClassName),
					"aria-label": title,
					"aria-expanded": open,
					onClick: toggleFromLeading,
					children: leading
				}) : jsx("span", {
					className: clsx(css$3.leading, leadingClassName),
					children: leading
				}), jsxs(TextShimmer, {
					active: running,
					className: contentClassName,
					contentClassName: contentLayoutClassName,
					children: [jsx(TextShimmer, {
						className: clsx(css$3.title, titleClassName),
						children: title
					}), (keepContentWhenOpen || !open) && collapsedContent]
				})]
			}), headerAccessory]
		}), open && children]
	});
});
