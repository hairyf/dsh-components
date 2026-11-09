// Extracted from @deepseek-ai/dsh-client-ui-reference (lib/client.js); region lib/types/client/FileReference.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** File navigation feedback belongs to the individual inline reference that requested it. */
/**
* Render a file chip and contain synchronous navigation failures without hiding the reference.
* @param props - JSON node, interaction policy, Session-authorized navigation, and locale seat.
* @returns an inline chip and, after a navigation failure, its body-portaled dialog.
*/
function FileReference({ node, raw, interactive, openFile, resolveFilePath, sessionId, useContextMenu, t }) {
	const { getTriggerProps } = useContextMenu();
	const [failedPath, setFailedPath] = (0, react.useState)(null);
	const { path, label } = node.data;
	const close = () => {
		setFailedPath(null);
	};
	const open = () => {
		try {
			openFile(path);
		} catch {
			setFailedPath(path);
			return;
		}
		setFailedPath(null);
	};
	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ReferenceChip, {
		appearance: "file",
		label,
		title: raw,
		contextMenuProps: getTriggerProps(interactive ? () => ({
			kind: "file",
			value: {
				sessionId,
				path: resolveFilePath(path)
			}
		}) : void 0),
		...interactive ? { onActivate: open } : {}
	}), interactive && failedPath === path && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
		open: true,
		onClose: close,
		closeLabel: t("fileOpen.close"),
		title: t("fileOpen.title"),
		description: t("fileOpen.failed", { path }),
		footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
			variant: "outline",
			onClick: close,
			children: t("fileOpen.close")
		}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
			variant: "primary",
			onClick: open,
			children: t("fileOpen.retry")
		})] })
	})] });
}
/**
* Render a directory as a label, even when the containing text permits file navigation.
* @param props - resolved directory data and the original reference spelling.
* @returns an inline non-interactive chip.
*/
function FolderReference({ node, raw }) {
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ReferenceChip, {
		appearance: "folder",
		label: node.data.label,
		title: raw
	});
}
