// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/ChatNodeSeat.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

function turnDataOf(node) {
	const location = node?.location;
	return location?.kind === "turn" || location?.kind === "step" ? location.turn.data : void 0;
}
function turnOf$1(node) {
	const location = node?.location;
	return location?.kind === "turn" || location?.kind === "step" ? location.turn.turn : void 0;
}
/**
* Subscribe, apply Turn-process visibility, and dispatch one stable Context key.
* Policy reads select this seat's own conclusion, so a mode change re-renders
* only seats whose visibility actually changes.
*/
const ChatNodeSeat = (0, react.memo)(function ChatNodeSeat({ nodeKey, groupPart, useChatNode, useChatNodeProcess, usePresentation, cwd, openFile, inspectCall, forkAt, loadImage, useStore, actions, renderSlot, t, useChatNodeBottom, deferCollapse, useGroupAction }) {
	const bottom = useChatNodeBottom(nodeKey);
	const node = useChatNode(nodeKey);
	const routedNode = node;
	const turn = turnOf$1(routedNode);
	const processPresentation = useChatNodeProcess(nodeKey);
	const processSpec = processPresentation?.spec;
	const storedOpen = useStore((state) => processSpec !== void 0 && turnProcessOpen(state, processSpec, bottom === true && deferCollapse));
	const liveProcess = processPresentation !== void 0 && !processPresentation.turnClosed;
	const interleavedInput = processPresentation?.hasInterleavedInput === true;
	const alwaysOpen = liveProcess || interleavedInput || turnProcessAlwaysOpen(routedNode);
	const processOpen = alwaysOpen || storedOpen;
	const setOpen = (0, react.useCallback)((open) => {
		if (processSpec !== void 0 && !alwaysOpen) actions.setTurnProcessOpen(processSpec.turn, processSpec.answerStep ?? 0, open);
	}, [
		actions,
		processSpec,
		alwaysOpen
	]);
	const foldCompleted = usePresentation((policy) => policy.foldCompletedTurns);
	const keepReplies = usePresentation((policy) => policy.foldedReplies === "all");
	const processWindowReady = processSpec !== void 0 && processPresentation !== void 0 && foldCompleted && processPresentation.turn === processSpec.turn && (processPresentation.turnStarted || processPresentation.turnClosed);
	const replyRow = keepReplies && routedNode?.kind === "assistant-step" && groupPart !== "reasoning" && hasAssistantReplyContent(routedNode.data.blocks);
	const processMember = routedNode !== void 0 && processWindowReady && !replyRow && !isAtOrOutside(routedNode, "turn") && routedNode.anchorSeq >= processSpec.processStartSeq && (liveProcess || processSpec.answerAnchorSeq === null || routedNode.anchorSeq < processSpec.answerAnchorSeq || groupPart === "reasoning" && routedNode.kind === "assistant-step" && routedNode.data.step === processSpec.answerStep);
	const processAnswer = routedNode !== void 0 && processWindowReady && !liveProcess && groupPart !== "reasoning" && routedNode.kind === "assistant-step" && routedNode.data.step === processSpec.answerStep;
	const ownsDisclosure = routedNode?.kind === "turn-process" || processAnswer || replyRow;
	const foldable = processWindowReady && (liveProcess || processMember || ownsDisclosure);
	const turnProcess = (0, react.useMemo)(() => processSpec === void 0 ? void 0 : {
		spec: processSpec,
		foldable,
		hasContent: !interleavedInput && (processSpec.inlineReasoning || (keepReplies ? processPresentation?.hasNonReplyProcess === true : processPresentation?.hasExternalProcess === true)),
		open: processOpen,
		setOpen
	}, [
		foldable,
		interleavedInput,
		keepReplies,
		processOpen,
		processSpec,
		processPresentation?.hasExternalProcess,
		processPresentation?.hasNonReplyProcess,
		setOpen
	]);
	const processHidden = routedNode?.kind === "turn-process" && foldCompleted && !foldable || foldable && processMember && !processOpen;
	const wrapperRef = useGroupAction(processHidden, (0, react.useCallback)(() => {
		if (processMember) setOpen(true);
	}, [processMember, setOpen]));
	const [disclosureReset] = (0, react.useState)(() => (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(0));
	const turnData = turnDataOf(routedNode);
	const hookContext = (0, react.useMemo)(() => ({
		turnData,
		disclosureReset,
		useGroupAction
	}), [
		turnData,
		disclosureReset,
		useGroupAction
	]);
	(0, react.useEffect)(() => {
		if (processMember && processHidden && wrapperRef.current !== null && hiddenOrCollapsing(wrapperRef.current)) disclosureReset.set(disclosureReset.getSnapshot() + 1);
	}, [
		processMember,
		processHidden,
		wrapperRef,
		disclosureReset
	]);
	const owner = (0, react.useMemo)(() => node === void 0 ? null : {
		...groupPart === void 0 ? {} : { groupPart },
		cwd,
		openFile,
		inspectCall,
		forkAt,
		loadImage,
		turnProcess
	}, [
		node,
		groupPart,
		cwd,
		openFile,
		inspectCall,
		forkAt,
		loadImage,
		turnProcess
	]);
	if (routedNode === void 0 || owner === null) return null;
	const routedOwner = {
		...owner,
		node: routedNode
	};
	const flowKey = groupPart === void 0 || groupPart === "response" ? routedNode.key : JSON.stringify([routedNode.key, groupPart]);
	return (0, react_jsx_runtime.jsx)("div", {
		ref: wrapperRef,
		className: ChatView_module_css_default.flowItem,
		"data-chat-anchor-key": flowKey,
		"data-chat-flow-key": flowKey,
		"data-chat-paging-anchor": routedNode.kind !== "turn-process" || void 0,
		"data-chat-node-key": routedNode.key,
		"data-chat-group-part": groupPart,
		"data-chat-flow-kind": routedNode.kind,
		"data-chat-turn": turn,
		"data-turn-process-member": processMember || void 0,
		"data-turn-process-hidden": processHidden || void 0,
		children: renderSlot("conversation.chat.node", routedOwner, {
			entryKey: routedNode.kind,
			hookContext,
			fallback: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonBlock, {
				label: t("message.unknownSurface", { type: routedNode.kind }),
				payload: routedNode.data,
				truncatedLabel: (total) => t("json.truncated", { total })
			})
		})
	});
});
