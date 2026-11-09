// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/ChatFlow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Ordered Chat rows, local echoes, and running status share the flow slot's parent. */
/** Whether the echo is a local submission rather than a Host-pending steering item. */
function isLocalSubmission(item) {
	return "requestId" in item;
}
/** Whether the echo is a local submission that opens a new Turn. */
function isTranscriptEcho(item) {
	return isLocalSubmission(item) && item.placement === "transcript";
}
/** Render the flow without adding a DOM parent or changing keyed row positions. */
const ChatFlow = (0, react.memo)(function ChatFlow({ entries, pendingInputs, lastInputTurn, deferCollapse, useSession, useChat, useChatNode, useChatNodeBottom, useChatNodeProcess, useChatGroup, usePresentation, useConnectionState, useStore, actions, renderSlot, renderFactorySlot, t, useGroupAction, useGroupHeaderAction, cwd, openFile, inspectCall, forkAt, loadImage }) {
	const nodeStore = useChat((snapshot) => snapshot.nodes);
	const running = useSession((snapshot) => snapshot.running);
	const disconnected = useConnectionState((state) => state === "disconnected" || state === "connecting");
	const latestTurnAnchor = useChat((snapshot) => snapshot.navigation.items().at(-1)?.anchorKey);
	const runningStartTime = useChatNode(latestTurnAnchor ?? "", (node) => {
		const location = node?.location;
		return location?.kind === "turn" || location?.kind === "step" ? location.turn.status === "open" ? location.turn.start?.time : void 0 : void 0;
	});
	const latestTurnOpen = useChatNode(latestTurnAnchor ?? "", (node) => {
		const location = node?.location;
		return (location?.kind === "turn" || location?.kind === "step") && location.turn.status === "open";
	});
	const holding = !running && latestTurnOpen;
	const seatProps = {
		nodeStore,
		useChatNode,
		useChatNodeBottom,
		useChatNodeProcess,
		usePresentation,
		useStore,
		actions,
		renderSlot,
		t,
		useGroupAction,
		deferCollapse,
		cwd,
		openFile,
		inspectCall,
		forkAt,
		loadImage
	};
	const rows = entries.map((entry) => {
		switch (entry.kind) {
			case "node": return (0, react.createElement)(ChatNodeSeat, {
				...seatProps,
				key: chatRenderKey(entry),
				nodeKey: entry.key,
				...entry.groupPart === void 0 ? {} : { groupPart: entry.groupPart }
			});
			case "group": return (0, react.createElement)(ChatGroupSeat, {
				...seatProps,
				key: chatRenderKey(entry),
				groupKey: entry.key,
				useChatGroup,
				useGroupHeaderAction
			});
			default: return assertNever(entry);
		}
	});
	const firstTranscript = pendingInputs.findIndex(isTranscriptEcho);
	const leadingRows = [];
	const openingRows = [];
	const pendingRows = [];
	for (const [index, item] of pendingInputs.entries()) {
		const row = isLocalSubmission(item) ? (0, react_jsx_runtime.jsx)(PendingSubmissionBubble, {
			submission: item,
			loadImage,
			renderFactorySlot,
			t
		}, item.requestId) : (0, react_jsx_runtime.jsx)(PendingSteeringBubble, {
			content: item.content,
			loadImage,
			renderFactorySlot,
			t
		}, item.id);
		if (index <= firstTranscript) leadingRows.push(row);
		else if (isTranscriptEcho(item)) openingRows.push(row);
		else pendingRows.push(row);
	}
	const tail = entries.at(-1);
	const node = tail?.kind === "node" ? nodeStore.get(tail.key) : void 0;
	if (node?.kind === "turn-process" && node.location.kind === "turn" && node.location.turn.status === "open" && node.location.turn.turn !== lastInputTurn) rows.splice(rows.length - 1, 0, ...leadingRows.splice(0));
	return [
		...rows,
		...leadingRows,
		...openingRows,
		...running || holding ? [(0, react_jsx_runtime.jsx)(RunningStatus, {
			startTime: runningStartTime,
			paused: disconnected,
			holding,
			t
		}, "running")] : [],
		...pendingRows
	];
});
