// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/AssistantNodeView.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Streaming, settled, and interrupted Assistant states share one keyed renderer instance. */
const AssistantNodeView = (0, react.memo)(function AssistantNodeView({ node, groupPart, useDisclosure, useGroupAction, useTurnData, turnProcess, openFile, loadImage, fileMentions, usePresentation, renderSlot, t, sessionId, useContextMenu, resolveFilePath }) {
	const { getTriggerProps } = useContextMenu();
	const getFileTriggerProps = (0, react.useCallback)((path) => getTriggerProps(() => ({
		kind: "file",
		value: {
			sessionId,
			path: resolveFilePath(path)
		}
	})), [
		getTriggerProps,
		sessionId,
		resolveFilePath
	]);
	const data = node.data;
	const turn = node.location.kind === "turn" || node.location.kind === "step" ? node.location.turn : void 0;
	const tail = useTurnData("turn-tail");
	const owner = (0, react.useMemo)(() => {
		if (turn?.status !== "closed" || data.finalNode === void 0) return void 0;
		if (tail?.closing?.finalNode.seq !== data.finalNode.seq) return void 0;
		return {
			turn,
			seq: data.finalNode.seq,
			openFile
		};
	}, [
		data.finalNode,
		openFile,
		tail,
		turn
	]);
	const mentions = (0, react.useMemo)(() => owner === void 0 ? void 0 : fileMentions(owner, getFileTriggerProps), [
		fileMentions,
		owner,
		getFileTriggerProps
	]);
	const keepReplies = usePresentation((policy) => policy.foldedReplies === "all");
	const reasoningHidden = turnProcess !== void 0 && turnProcess.foldable && (keepReplies ? groupPart !== "reasoning" : turnProcess.spec.answerStep === data.step && turnProcess.spec.inlineReasoning) && !turnProcess.open;
	const revealProcess = (0, react.useCallback)(() => {
		turnProcess?.setOpen(true);
	}, [turnProcess]);
	return (0, react_jsx_runtime.jsx)(AssistantMarkdown, {
		blocks: data.blocks,
		groupPart,
		useDisclosure,
		streaming: data.status === "running",
		textInteractionSource: data.status === "settled" && data.finalNode?.messageId !== void 0,
		interrupted: data.status === "interrupted",
		loadImage,
		reasoningHidden,
		useGroupAction,
		usePresentation,
		renderSlot,
		revealProcess,
		mentions,
		t
	});
});
