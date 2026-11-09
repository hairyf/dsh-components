// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/ChatView.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Host/OS refusal text for the file-open dialog; empty throws keep a locale fallback. */
function openFailureMessage(error, fallback) {
	const message = error instanceof Error ? error.message : String(error);
	return message === "" ? fallback : message;
}
/**
* Durable input identities suppress matching echoes in the same render.
* The last input's Turn also distinguishes an empty opening control from
* one whose human input or trigger notice is already present.
*/
function observedInputs(order, nodes) {
	const observed = /* @__PURE__ */ new Set();
	let lastInputTurn;
	for (const key of order) {
		const node = nodes.get(key);
		if (node === void 0 || !isAtOrOutside(node, "input")) continue;
		if (node.location.kind === "turn" || node.location.kind === "step") lastInputTurn = node.location.turn.turn;
		const data = node.data;
		const source = typeof data === "object" && data !== null && "source" in data ? data.source : void 0;
		if (typeof source === "object" && source !== null && "kind" in source && source.kind === "user" && "rpcId" in source && typeof source.rpcId === "string") observed.add(source.rpcId);
	}
	return {
		rpcIds: observed,
		lastInputTurn
	};
}
/** How long fold transitions stay enabled after a Turn stops running. */
const MOTION_TAIL_MS = 800;
/**
* The chat view slot entry: pure component over the composed props; each
* ordered business Node crosses the keyed renderer seat.
*/
function ChatView({ useSession, useChat, useConversation, useSessions, renderSlot, sessionId, openFile, openExternalLink, resolveFilePath, useContextMenu, loadOlder, loadThrough, loadImage, inspectCall, chatScroll, forkAt, usePresentation, useProjection, useInteractionIds, dispatchInteraction, t, fileDrag }) {
	const { getTriggerProps } = useContextMenu();
	const getMarkdownTriggerProps = (0, react.useCallback)((target) => getTriggerProps(() => {
		switch (target.kind) {
			case "file": return {
				kind: "file",
				value: {
					sessionId,
					path: resolveFilePath(target.path),
					...target.line === void 0 ? {} : { line: target.line }
				}
			};
			case "url": return {
				kind: "url",
				value: {
					sessionId,
					url: target.url
				}
			};
			case "image": return {
				kind: "image",
				value: {
					sessionId,
					url: target.url,
					...target.name === void 0 ? {} : { name: target.name },
					...target.mediaType === void 0 ? {} : { mediaType: target.mediaType },
					...target.path === void 0 ? {} : { path: resolveFilePath(target.path) }
				}
			};
		}
	}), [
		getTriggerProps,
		resolveFilePath,
		sessionId
	]);
	const order = useChat((s) => s.order);
	const groupedEntries = useConversation((snapshot) => snapshot.views.grouped("chat")?.entries);
	const entries = (0, react.useMemo)(() => groupedEntries ?? order.map((key) => ({
		kind: "node",
		key
	})), [groupedEntries, order]);
	const nodeStore = useChat((s) => s.nodes);
	const deferCompletedTurns = usePresentation((policy) => policy.collapseTiming === "next-input");
	const transcriptView = usePresentation((policy) => policy.mode);
	const turnNavigationItems = useChat((s) => s.navigation.items());
	const turnOutline = useProjection("turnOutline");
	const railItems = (0, react.useMemo)(() => mergeTurnRailItems(turnNavigationItems, turnOutline), [turnNavigationItems, turnOutline]);
	const inbox = useProjection("inbox");
	const cwd = useSessions((s) => s.byId[sessionId]?.cwd);
	const fileImages = (0, react.useMemo)(() => ({
		fileDrag,
		resolve: (path) => fileMediaUrl(document.baseURI, resolveWorkspacePath(cwd, path)),
		resourceAddress: (path) => sessionFileAddress(sessionId, resolveWorkspacePath(cwd, path)),
		labels: {
			open: t("image.open"),
			loading: t("image.loading"),
			failed: t("image.failed"),
			dialog: t("image.dialog"),
			close: t("image.close")
		}
	}), [
		cwd,
		t,
		fileDrag,
		sessionId
	]);
	const running = useSession((s) => s.running);
	const [motionTail, setMotionTail] = (0, react.useState)(false);
	(0, react.useEffect)(() => {
		if (!deferCompletedTurns) {
			setMotionTail(false);
			return;
		}
		if (running) {
			setMotionTail(true);
			return;
		}
		const timer = setTimeout(() => {
			setMotionTail(false);
		}, MOTION_TAIL_MS);
		return () => {
			clearTimeout(timer);
		};
	}, [running, deferCompletedTurns]);
	const openState = useSession((s) => s.openState);
	const openError = useSession((s) => s.openError);
	const hasMore = useSession((s) => s.hasMore);
	const loadingOlder = useSession((s) => s.loadingOlder);
	const [fileOpenError, setFileOpenError] = (0, react.useState)(null);
	const [fileOpenBusy, setFileOpenBusy] = (0, react.useState)(false);
	const fileOpenRequest = (0, react.useRef)(0);
	const requestOpenFile = (0, react.useCallback)((path, options) => {
		const id = ++fileOpenRequest.current;
		setFileOpenBusy(true);
		(options === void 0 ? openFile(path) : openFile(path, options)).then(() => {
			if (id !== fileOpenRequest.current) return;
			setFileOpenError(null);
			setFileOpenBusy(false);
		}, (error) => {
			if (id !== fileOpenRequest.current) return;
			setFileOpenError({
				path,
				message: openFailureMessage(error, t("fileOpen.unknown"))
			});
			setFileOpenBusy(false);
		});
	}, [openFile, t]);
	const closeFileOpenError = (0, react.useCallback)(() => {
		fileOpenRequest.current += 1;
		setFileOpenError(null);
		setFileOpenBusy(false);
	}, []);
	const inboxSteering = (0, react.useMemo)(() => inbox?.["next-step"].filter((message) => message.source.kind === "user") ?? [], [inbox]);
	const pendingSubmissions = useSession((s) => s.pendingSubmissions);
	const [visibleSubmissions, lastInputTurn] = (0, react.useMemo)(() => {
		if (pendingSubmissions.length === 0) return [pendingSubmissions, void 0];
		const observed = observedInputs(order, nodeStore);
		return [pendingSubmissions.filter((submission) => submission.placement !== "queued" && !observed.rpcIds.has(submission.requestId)), observed.lastInputTurn];
	}, [
		pendingSubmissions,
		order,
		nodeStore
	]);
	const pendingInputs = (0, react.useMemo)(() => {
		const local = new Map(visibleSubmissions.map((submission) => [submission.requestId, submission]));
		const localIds = new Set(pendingSubmissions.filter((submission) => submission.placement !== "queued").map((submission) => submission.requestId));
		return [...inboxSteering.flatMap((item) => {
			const source = item.source;
			if (source.kind !== "user" || !("rpcId" in source)) return [item];
			const submission = local.get(source.rpcId);
			if (submission === void 0) return localIds.has(source.rpcId) ? [] : [item];
			local.delete(source.rpcId);
			return [submission];
		}), ...local.values()];
	}, [
		inboxSteering,
		pendingSubmissions,
		visibleSubmissions
	]);
	const deferCollapse = deferCompletedTurns && !pendingInputs.some((item) => "requestId" in item && item.placement === "transcript");
	const firstKey = order[0];
	const firstSeq = firstKey === void 0 ? null : nodeStore.get(firstKey)?.anchorSeq ?? null;
	const lastKey = order.at(-1) ?? null;
	const latestSteering = pendingInputs.findLast((item) => "source" in item);
	const steeringId = latestSteering?.source.kind === "user" && "rpcId" in latestSteering.source ? latestSteering.source.rpcId : latestSteering?.id ?? null;
	const scroll = useChatScroll({
		ready: openState === "open",
		order,
		firstSeq,
		lastKey,
		running,
		loadingOlder,
		hasMore,
		chatScroll,
		loadOlder,
		loadThrough,
		deferCompletedTurns,
		lastIsUser: lastKey !== null && nodeStore.get(lastKey)?.kind === "user",
		steeringId,
		submissionId: visibleSubmissions.at(-1)?.requestId ?? null,
		submissionSteers: visibleSubmissions.at(-1)?.placement === "steering",
		loadedTurns: turnNavigationItems,
		transcriptView
	});
	const interactionSurfaceRef = (0, react.useRef)(null);
	const interactionIds = useInteractionIds((ids) => ids);
	const textInteraction = useTextInteraction(scroll.columnRef, interactionSurfaceRef, dispatchInteraction, interactionIds);
	const flowContext = (0, react.useMemo)(() => ({ motion: scroll.motion }), [scroll.motion]);
	return (0, react_jsx_runtime.jsxs)("div", {
		className: ChatView_module_css_default.frame,
		children: [
			scroll.initialized && (0, react_jsx_runtime.jsx)(TurnNavigator, {
				items: railItems,
				activeTurn: scroll.activeTurn,
				busyTurn: scroll.busyTurn,
				onNavigate: scroll.navigateToTurn,
				t
			}),
			(0, react_jsx_runtime.jsx)("div", {
				className: ChatView_module_css_default.root,
				"data-chat-following-tail": scroll.followingTail ? "" : void 0,
				children: (0, react_jsx_runtime.jsxs)("div", {
					ref: scroll.listRef,
					className: ChatView_module_css_default.scroll,
					children: [(0, react_jsx_runtime.jsxs)("div", {
						ref: scroll.columnRef,
						className: ChatView_module_css_default.column,
						"data-chat-flow": "",
						"data-chat-motion": deferCompletedTurns && scroll.initialized && (running || motionTail || pendingInputs.length > 0) ? "" : void 0,
						children: [
							openState === "loading" && (0, react_jsx_runtime.jsx)("div", {
								className: ChatView_module_css_default.hint,
								children: t("chat.loadingHistory")
							}),
							openState === "error" && openError !== null && (0, react_jsx_runtime.jsx)("div", {
								className: ChatView_module_css_default.openError,
								children: t("chat.loadError", {
									message: openError.message,
									code: openError.code
								})
							}),
							hasMore && (0, react_jsx_runtime.jsx)("div", {
								className: ChatView_module_css_default.older,
								children: (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: loadingOlder,
									onClick: scroll.loadEarlier,
									children: loadingOlder ? t("loading") : t("chat.loadOlder")
								})
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownDelegateProvider, {
								getTriggerProps: getMarkdownTriggerProps,
								openFile: requestOpenFile,
								openExternalLink,
								fileImages,
								children: renderSlot("conversation.chat.flow", {
									entries,
									pendingInputs,
									lastInputTurn,
									deferCollapse,
									cwd,
									openFile: requestOpenFile,
									inspectCall,
									forkAt,
									loadImage
								}, { hookContext: flowContext })
							}),
							(0, react_jsx_runtime.jsx)("div", {
								ref: interactionSurfaceRef,
								className: ChatView_module_css_default.textInteraction,
								"data-text-interaction-surface": "",
								"aria-hidden": textInteraction.active === null,
								children: textInteraction.active !== null && renderSlot("conversation.chat.text-interaction", {
									trigger: textInteraction.active.trigger,
									readText: textInteraction.readText,
									dismiss: textInteraction.dismiss,
									clearSelection: textInteraction.clearSelection
								}, { entryKey: textInteraction.active.id })
							})
						]
					}), (0, react_jsx_runtime.jsx)("div", {
						className: ChatView_module_css_default.turnSpacer,
						"data-chat-turn-spacer": true,
						"aria-hidden": "true"
					})]
				})
			}),
			!scroll.followingTail && (0, react_jsx_runtime.jsx)("div", {
				className: ChatView_module_css_default.toBottomSlot,
				children: (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: ChatView_module_css_default.toBottom,
					"aria-label": t("chat.toBottom"),
					onClick: scroll.returnToBottom,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})
				})
			}),
			fileOpenError !== null && (0, react_jsx_runtime.jsx)(FileOpenErrorDialog, {
				message: fileOpenError.message,
				busy: fileOpenBusy,
				onClose: closeFileOpenError,
				onRetry: () => {
					requestOpenFile(fileOpenError.path);
				},
				t
			})
		]
	});
}
/** In-page Host open-path refusal: the wire reason plus a retry of the same path. */
function FileOpenErrorDialog({ message, busy, onClose, onRetry, t }) {
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
		open: true,
		onClose,
		closeLabel: t("close"),
		title: t("fileOpen.title"),
		description: message,
		footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
			variant: "outline",
			className: ChatView_module_css_default.modalAction,
			onClick: onClose,
			children: t("cancel")
		}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
			variant: "primary",
			className: ChatView_module_css_default.modalAction,
			disabled: busy,
			onClick: onRetry,
			children: t("retry")
		})] })
	});
}
