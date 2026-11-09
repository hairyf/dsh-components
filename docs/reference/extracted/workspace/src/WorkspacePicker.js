// Extracted from @deepseek-ai/dsh-client-ui-workspace (lib/client.js); region lib/types/client/WorkspacePicker.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

const ADD_WORKSPACE = "::add-workspace";
/**
* Render the pick menu plus the adoption error dialog.
* @param props - owner-controlled flow props.
* @returns menu + dialog elements.
*/
function WorkspacePickFlow({ t, open, anchorRef, useWorkspaces, createWorkspace, useDirectoryFlow, renderDirectoryFlow, onPick, onClose, addOnly = false, onBusyChange, side = "bottom", selectedId }) {
	const workspaceSnapshot = useWorkspaces((state) => state);
	const workspaces = workspaceSnapshot.items;
	const getAnchorRect = (0, react.useCallback)(() => anchorRef?.current?.getBoundingClientRect() ?? null, [anchorRef]);
	const [errorOpen, setErrorOpen] = (0, react.useState)(false);
	const [modalError, setModalError] = (0, react.useState)(null);
	const [flowOpen, setFlowOpen] = (0, react.useState)(false);
	const [pickingFolder, setPickingFolder] = (0, react.useState)(false);
	const flowBusy = flowOpen || pickingFolder;
	(0, react.useEffect)(() => {
		onBusyChange?.(flowBusy);
	}, [flowBusy, onBusyChange]);
	const flowAvailable = useDirectoryFlow((occupied) => occupied);
	(0, react.useEffect)(() => {
		if (flowOpen && !flowAvailable) setFlowOpen(false);
	}, [flowOpen, flowAvailable]);
	const addEntries = flowAvailable ? [{
		id: ADD_WORKSPACE,
		label: t("menu.addWorkspace"),
		icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 16 }),
		disabled: flowBusy
	}] : [];
	const pinAdd = !addOnly && workspaces.length > 0;
	const defaultWorkspaceName = t("workspace.defaultName");
	const listed = (0, react.useMemo)(() => {
		if (!pinAdd) return [];
		const rows = workspaces.map((workspace) => ({
			id: workspace.workspaceId,
			title: workspaceDisplayTitle(workspace.title, defaultWorkspaceName),
			path: workspace.path
		}));
		const suffixes = distinguishingPathSuffixes(rows);
		return rows.map((row) => ({
			...row,
			suffix: suffixes.get(row.id)
		}));
	}, [
		pinAdd,
		workspaces,
		defaultWorkspaceName
	]);
	const items = pinAdd ? listed.map(({ id, title, path, suffix }) => ({
		id,
		label: suffix === void 0 ? title : (0, react_jsx_runtime.jsxs)("span", {
			className: WorkspacePicker_module_css_default.disambiguated,
			title: path,
			children: [
				(0, react_jsx_runtime.jsx)("span", {
					className: WorkspacePicker_module_css_default.title,
					children: title
				}),
				" ",
				(0, react_jsx_runtime.jsx)("span", {
					className: WorkspacePicker_module_css_default.pathSuffix,
					children: suffix
				})
			]
		}),
		icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderCloseRegular, { size: 16 }),
		disabled: flowBusy
	})) : addEntries;
	const menuIsEmpty = items.length === 0;
	const closeModal = () => {
		setErrorOpen(false);
		setModalError(null);
	};
	/** Adopt a picked directory; failures land in the folder-error dialog (Choose again reopens the flow). */
	const adoptDirectory = (path) => createWorkspace({ path }).then((workspace) => {
		setFlowOpen(false);
		onPick(workspace.workspaceId);
	}).catch((reason) => {
		setModalError(reason instanceof Error ? reason.message : String(reason));
		setFlowOpen(false);
		setErrorOpen(true);
	});
	const openDirectoryFlow = (0, react.useCallback)(() => {
		onClose();
		setErrorOpen(false);
		setModalError(null);
		setFlowOpen(true);
	}, [onClose]);
	const listSettled = addOnly || workspaceSnapshot.phase === "ready";
	const addIsTheOnlyEntry = !pinAdd && listSettled && addEntries.length === 1;
	(0, react.useEffect)(() => {
		if (open && addIsTheOnlyEntry && !flowBusy) openDirectoryFlow();
	}, [
		open,
		addIsTheOnlyEntry,
		flowBusy,
		openDirectoryFlow
	]);
	/** Owner side of the flow conversation: adopt keeps the flow open (busy) until the Host answers. */
	const flowOwner = {
		open: flowOpen,
		busy: pickingFolder,
		onPicked: (path) => {
			setPickingFolder(true);
			adoptDirectory(path).finally(() => {
				setPickingFolder(false);
			});
		},
		onCancel: () => {
			setFlowOpen(false);
		},
		onError: (message) => {
			setFlowOpen(false);
			setModalError(message);
			setErrorOpen(true);
		}
	};
	const handleSelect = (id) => {
		if (id === ADD_WORKSPACE) {
			openDirectoryFlow();
			return;
		}
		onPick(id);
	};
	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
			open: open && !addIsTheOnlyEntry && !menuIsEmpty,
			anchor: null,
			items,
			...pinAdd ? { footer: addEntries } : {},
			selectedId,
			onSelect: handleSelect,
			onClose,
			side,
			portal: true,
			getAnchorRect
		}),
		open && !addIsTheOnlyEntry && !menuIsEmpty && workspaceSnapshot.phase === "pending" && (0, react_jsx_runtime.jsx)("div", {
			className: WorkspacePicker_module_css_default.menuStatus,
			role: "status",
			children: t("picker.loading")
		}),
		renderDirectoryFlow(flowOwner),
		(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
			open: errorOpen,
			onClose: closeModal,
			closeLabel: t("close"),
			title: t("folderError.title"),
			footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
				variant: "outline",
				className: WorkspacePicker_module_css_default.modalAction,
				onClick: closeModal,
				children: t("cancel")
			}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
				variant: "primary",
				className: WorkspacePicker_module_css_default.modalAction,
				disabled: !flowAvailable,
				onClick: openDirectoryFlow,
				children: t("folderError.retry")
			})] }),
			children: (0, react_jsx_runtime.jsx)("div", {
				className: WorkspacePicker_module_css_default.modalError,
				role: "alert",
				children: modalError
			})
		})
	] });
}
/**
* The conversation empty-state registration: adapts the owner share to the
* core flow (all state and semantics live in the flow / the owner).
* @param props - empty-state slot props (owner share + injected creation callback).
* @returns the flow element.
*/
function WorkspacePicker({ open, anchorRef, useWorkspaces, selectedId, onPick, onClose, createWorkspace, useDirectoryFlow, renderSlot, t }) {
	return (0, react_jsx_runtime.jsx)(WorkspacePickFlow, {
		t,
		open,
		anchorRef,
		useWorkspaces,
		createWorkspace,
		useDirectoryFlow,
		renderDirectoryFlow: (owner) => renderSlot("conversation.hero.workspace.directoryFlow", owner),
		selectedId,
		onPick,
		onClose
	});
}
