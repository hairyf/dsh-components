// Extracted from @deepseek-ai/dsh-client-ui-workspace (lib/client.js); region lib/types/client/rows/WorkspaceDialogs.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Workspace rename and removal dialogs, keyed by their captured request. */
/** @param props - captured request, current Workspace list, and existing mutations. @returns the active dialog. */
function WorkspaceDialogs({ request, workspaces, renameWorkspace, deleteWorkspace, settleWorkspaceAction, t }) {
	const composingRef = (0, react.useRef)(false);
	const renameTarget = request.action === "rename" ? request : null;
	const [renameDraft, setRenameDraft] = (0, react.useState)(request.displayTitle);
	const [renaming, setRenaming] = (0, react.useState)(false);
	const [renameError, setRenameError] = (0, react.useState)(null);
	const renameTrimmed = renameDraft.trim();
	const renameDuplicate = renameTarget !== null && renameTrimmed !== "" && workspaces.some((w) => w.workspaceId !== renameTarget.workspaceId && w.title === renameTrimmed);
	const renameBlocked = renaming || renameTrimmed === "" || renameTarget === null || renameTrimmed === renameTarget.storedTitle || renameDuplicate;
	const closeRename = () => {
		if (renaming) return;
		settleWorkspaceAction();
		setRenameError(null);
	};
	const confirmRename = () => {
		if (renameBlocked) return;
		setRenaming(true);
		setRenameError(null);
		renameWorkspace(renameTarget.workspaceId, renameTrimmed).then(() => {
			setRenaming(false);
			settleWorkspaceAction();
		}).catch((reason) => {
			setRenaming(false);
			setRenameError(reason instanceof Error ? reason.message : String(reason));
		});
	};
	const deleteTarget = request.action === "delete" ? request : null;
	const [deleting, setDeleting] = (0, react.useState)(false);
	const [deleteCommittedId, setDeleteCommittedId] = (0, react.useState)(null);
	const [deleteError, setDeleteError] = (0, react.useState)(null);
	(0, react.useEffect)(() => {
		if (deleteCommittedId === null || workspaces.some((workspace) => workspace.workspaceId === deleteCommittedId)) return;
		setDeleting(false);
		setDeleteCommittedId(null);
		settleWorkspaceAction();
	}, [
		deleteCommittedId,
		workspaces,
		settleWorkspaceAction
	]);
	const closeDelete = () => {
		if (deleting) return;
		settleWorkspaceAction();
		setDeleteError(null);
	};
	const confirmDelete = () => {
		/* v8 ignore next -- the Modal is absent without a target and its button is disabled while deleting. */
		if (deleting || deleteTarget === null) return;
		setDeleting(true);
		setDeleteCommittedId(null);
		setDeleteError(null);
		deleteWorkspace(deleteTarget.workspaceId).then(() => {
			setDeleteCommittedId(deleteTarget.workspaceId);
		}).catch((reason) => {
			setDeleting(false);
			setDeleteError(reason instanceof Error ? reason.message : String(reason));
		});
	};
	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
		open: renameTarget !== null,
		onClose: closeRename,
		closeLabel: t("close"),
		title: t("rename.workspace.title"),
		footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
			variant: "outline",
			disabled: renaming,
			onClick: closeRename,
			children: t("cancel")
		}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
			variant: "primary",
			disabled: renameBlocked,
			onClick: confirmRename,
			children: t("rename")
		})] }),
		children: [
			(0, react_jsx_runtime.jsx)("input", {
				className: WorkspaceBrowser_module_css_default.renameInput,
				value: renameDraft,
				"aria-label": t("field.workspaceName"),
				"data-modal-autofocus": true,
				disabled: renaming,
				onFocus: (e) => {
					e.target.select();
				},
				onChange: (e) => {
					setRenameDraft(e.target.value);
					setRenameError(null);
				},
				onCompositionStart: () => {
					composingRef.current = true;
				},
				onCompositionEnd: () => {
					composingRef.current = false;
				},
				onKeyDown: (e) => {
					if (e.key === "Enter" && !composingRef.current) {
						e.preventDefault();
						confirmRename();
					}
				}
			}),
			renameDuplicate && (0, react_jsx_runtime.jsx)("div", {
				className: WorkspaceBrowser_module_css_default.renameError,
				role: "alert",
				children: t("conflict.named", { name: renameTrimmed })
			}),
			renameError !== null && (0, react_jsx_runtime.jsx)("div", {
				className: WorkspaceBrowser_module_css_default.renameError,
				role: "alert",
				children: renameError
			})
		]
	}), (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
		open: deleteTarget !== null,
		onClose: closeDelete,
		closeLabel: t("close"),
		title: t("delete.workspace"),
		...deleteTarget === null ? {} : { description: t("delete.desc", { name: deleteTarget.displayTitle }) },
		footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
			variant: "outline",
			disabled: deleting,
			onClick: closeDelete,
			children: t("cancel")
		}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
			variant: "outline",
			className: WorkspaceBrowser_module_css_default.deleteAction,
			disabled: deleting,
			onClick: confirmDelete,
			children: t("delete.workspace")
		})] }),
		children: [deleting && (0, react_jsx_runtime.jsx)("div", {
			className: WorkspaceBrowser_module_css_default.deleteStatus,
			role: "status",
			children: t("delete.pending")
		}), deleteError !== null && (0, react_jsx_runtime.jsx)("div", {
			className: WorkspaceBrowser_module_css_default.renameError,
			role: "alert",
			children: deleteError
		})]
	})] });
}
/**
* The text one Workspace is labeled with. A Workspace still carrying the
* automatic first-use title reads as the caller's localized default name; every
* other title reads verbatim in every language. A title the user typed as
* exactly {@link DEFAULT_WORKSPACE_DIRECTORY} is labeled as the default too;
* nothing else depends on the distinction.
* @param title - stored Workspace title.
* @param localizedDefault - the default Workspace name in the active language.
* @returns the title to display.
*/
function workspaceDisplayTitle(title, localizedDefault) {
	return title === "default-workspace" ? localizedDefault : title;
}
