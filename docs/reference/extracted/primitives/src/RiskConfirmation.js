// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/RiskConfirmation.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Controlled risk acknowledgement dialog shared by product surfaces that
* must gate a sensitive action behind an explicit checkbox.
*/
/**
* Render one in-page confirmation whose primary action is unavailable until
* the caller-controlled acknowledgement is checked.
*/
function RiskConfirmation({ open, title, description, acknowledgeLabel, cancelLabel, closeLabel, confirmLabel, acknowledged, disabled = false, onAcknowledgedChange, onCancel, onConfirm }) {
	return jsxs(Modal, {
		open,
		onClose: onCancel,
		title,
		closeLabel,
		className: css$24.confirmation ?? "",
		contentClassName: css$24.confirmationContent ?? "",
		footer: jsxs(Fragment, { children: [jsx(Button, {
			variant: "outline",
			className: css$24.modalAction,
			onClick: onCancel,
			children: cancelLabel
		}), jsx(Button, {
			variant: "primary",
			className: css$24.confirmAction,
			disabled: disabled || !acknowledged,
			onClick: onConfirm,
			children: confirmLabel
		})] }),
		children: [jsxs("div", {
			className: css$24.warning,
			children: [jsx(IconWarningOutlineRegular, {
				size: 18,
				className: css$24.warningIcon
			}), jsx("p", { children: description })]
		}), jsxs("label", {
			className: css$24.acknowledgement,
			children: [jsx("input", {
				type: "checkbox",
				checked: acknowledged,
				disabled,
				"data-modal-autofocus": true,
				onChange: (event) => {
					onAcknowledgedChange(event.currentTarget.checked);
				}
			}), jsx("span", { children: acknowledgeLabel })]
		})]
	});
}
