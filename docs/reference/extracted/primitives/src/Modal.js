// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/Modal.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render a centered, body-portaled modal over a blurred page mask.
* @param props.open - whether the dialog is showing.
* @param props.onClose - application close command, Escape, or mask click; while a menu is open inside the
* dialog, Escape belongs to that menu first.
* @param props.title - dialog heading (aria-label in every mode).
* @param props.closeLabel - localized accessible close-button label.
* @param props.description - optional supporting sentence under the title.
* @param props.children - dialog body; mark its initial-focus control with
* data-modal-autofocus instead of React autoFocus to preserve return focus.
* @param props.footer - action row (Cancel / Create).
* @param props.contentClassName - optional class for a scrollable content region.
* @param props.backdropBlur - disable when the caller already blurs the page; defaults to true.
* @param props.shortcutModal - command scope allowed by shortcut owners; unnamed
* dialogs block application commands unless their owner allows the "other" scope.
* @param props.headless - render children directly in the card (no default
* header/close/body chrome); mask, card, Escape, and aria-label remain.
* @param props.onKeyDownCapture - handle a nested dialog's keys before the document Escape listeners.
* @returns null when closed; otherwise the overlay tree.
*/
function Modal({ open, onClose, title, closeLabel, description, children, footer, className, contentClassName, onKeyDownCapture, headless = false, backdropBlur = true, shortcutModal }) {
	const dialog = useRef(null);
	useModalLayer(dialog, open, onClose);
	if (!open) return null;
	return createPortal(jsxs("div", {
		className: css$23.root,
		role: "presentation",
		onKeyDownCapture,
		children: [jsx("div", {
			className: css$23.mask,
			style: backdropBlur ? void 0 : { backdropFilter: "none" },
			"aria-hidden": "true",
			onClick: onClose
		}), jsx("div", {
			ref: dialog,
			tabIndex: -1,
			"data-shortcut-modal": shortcutModal,
			className: clsx(css$23.dialog, className),
			role: "dialog",
			"aria-modal": "true",
			"aria-label": title,
			children: headless ? children : jsxs(Fragment, { children: [jsxs("div", {
				className: clsx(css$23.content, contentClassName),
				children: [
					jsxs("div", {
						className: css$23.header,
						children: [jsx("h2", {
							className: css$23.title,
							children: title
						}), jsx("button", {
							type: "button",
							className: css$23.close,
							"aria-label": closeLabel,
							onClick: onClose,
							children: jsx(IconCloseOutlineRegular, { size: 14 })
						})]
					}),
					description !== void 0 && description !== "" && jsx("p", {
						className: css$23.description,
						children: description
					}),
					children !== void 0 && jsx("div", {
						className: css$23.body,
						children
					})
				]
			}), footer !== void 0 && jsx("div", {
				className: css$23.footer,
				children: footer
			})] })
		})]
	}), document.body);
}
