// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/use-chat-scroll.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Composes viewport operations, reading policy, and history navigation for Chat. */
/**
* Coordinate scroll policy after Chat content commits. Initial history must be ready
* before automatic scroll or resize handling can initialize reading state and fold motion.
* New submitted input supersedes pending reader sampling.
* @param input - current Chat content, scroll memory, and history operations.
* @returns element refs, visible reading state, and navigation callbacks.
*/
function useChatScroll(input) {
	const { ready, order, firstSeq, lastKey, lastIsUser, steeringId, submissionId, submissionSteers, running, deferCompletedTurns, loadedTurns, chatScroll, hasMore, loadingOlder, loadOlder, loadThrough, transcriptView } = input;
	const { viewport, listRef, columnRef } = useChatViewport();
	const { reading, state } = useChatReading(viewport, chatScroll, loadedTurns.at(-1)?.turn ?? null);
	const navigationInput = (0, react.useMemo)(() => ({
		firstSeq,
		loadingOlder,
		hasMore,
		loadOlder,
		loadThrough
	}), [
		firstSeq,
		loadingOlder,
		hasMore,
		loadOlder,
		loadThrough
	]);
	const { navigation, busyTurn } = useChatNavigation(viewport, reading, navigationInput);
	const content = (0, react.useRef)({
		input,
		applied: null,
		opened: false
	});
	const cancelPendingFollow = (0, react.useCallback)(() => {
		viewport.motion.cancelInput();
	}, [viewport]);
	const processContent = (0, react.useCallback)(() => {
		const current = content.current.input;
		if (!current.ready && !content.current.opened) return;
		const previous = content.current.applied;
		const steeringInput = current.steeringId !== null && current.steeringId !== previous?.steeringId && current.steeringId !== previous?.submissionId;
		const submissionInput = current.submissionId !== null && current.submissionId !== previous?.submissionId && current.submissionId !== previous?.steeringId;
		const ownInput = current.lastIsUser && current.lastKey !== previous?.lastKey || steeringInput || submissionInput;
		if (reading.pending && !ownInput) return;
		content.current.applied = current;
		if (current.ready && !content.current.opened) {
			content.current.opened = true;
			navigation.reset();
			reading.restore();
			return;
		}
		if (ownInput) {
			navigation.cancel();
			if (current.deferCompletedTurns && reading.followInputFold(true)) return;
			const steering = steeringInput || submissionInput && current.submissionSteers;
			reading.followTail(current.deferCompletedTurns && !steering ? "smooth" : "instant");
			return;
		}
		if (navigation.contentCommitted()) {
			navigation.reconcile();
			return;
		}
		if ((previous === null || current.ready !== previous.ready || current.firstSeq !== previous.firstSeq || current.lastKey !== previous.lastKey || current.order.length !== previous.order.length || current.running !== previous.running || current.steeringId !== previous.steeringId || current.submissionId !== previous.submissionId) && reading.followingTail) {
			navigation.cancel();
			if (current.deferCompletedTurns && reading.followInputFold(false)) return;
			reading.followTail();
		} else navigation.reconcile();
	}, [reading, navigation]);
	(0, react.useLayoutEffect)(() => {
		const disconnectViewport = viewport.connect({
			scroll: (event) => {
				if (!content.current.opened) return;
				if (!event.movedByReader && viewport.motion.foldActive()) return;
				reading.onScroll(event);
			},
			scrollEnd: (outer) => {
				reading.onScrollEnd(outer);
				navigation.readerSettled();
			},
			interact: () => {
				navigation.cancel();
			},
			intent: () => {
				cancelPendingFollow();
				reading.interruptFollow();
			},
			resize: () => {
				if (!content.current.opened) return;
				if (navigation.contentCommitted()) {
					navigation.reconcile();
					return;
				}
				if (!content.current.input.deferCompletedTurns || !viewport.motion.foldActive()) reading.onResize();
				navigation.reconcile();
			}
		});
		const disconnectReading = reading.connect((sample) => {
			navigation.readerSampled(sample);
			processContent();
		});
		return () => {
			disconnectViewport();
			disconnectReading();
			content.current.opened = false;
			content.current.applied = null;
		};
	}, [
		viewport,
		reading,
		navigation,
		processContent,
		cancelPendingFollow
	]);
	(0, react.useLayoutEffect)(() => {
		const previous = content.current.input;
		content.current.input = {
			ready,
			order,
			lastKey,
			lastIsUser,
			steeringId,
			submissionId,
			submissionSteers,
			running,
			loadedTurns,
			chatScroll,
			deferCompletedTurns,
			transcriptView,
			...navigationInput
		};
		if (!deferCompletedTurns) {
			cancelPendingFollow();
			reading.interruptFollow();
		}
		viewport.updateTurns(loadedTurns);
		const layoutChanged = previous.order !== order || previous.ready !== ready;
		if (layoutChanged) viewport.invalidate();
		viewport.reclaimBelow();
		processContent();
		if (layoutChanged && content.current.opened) reading.refreshActiveTurn();
	}, [
		viewport,
		reading,
		processContent,
		navigationInput,
		ready,
		order,
		lastKey,
		lastIsUser,
		steeringId,
		submissionId,
		submissionSteers,
		running,
		loadedTurns,
		chatScroll,
		deferCompletedTurns,
		transcriptView,
		cancelPendingFollow
	]);
	const previousView = (0, react.useRef)(transcriptView);
	(0, react.useLayoutEffect)(() => {
		if (previousView.current === transcriptView) return;
		previousView.current = transcriptView;
		cancelPendingFollow();
		reading.interruptFollow();
		return viewport.motion.onFoldIdle(() => {
			viewport.resetBelow();
			if (content.current.opened) reading.onResize();
		});
	}, [
		transcriptView,
		viewport,
		reading,
		cancelPendingFollow
	]);
	const returnToBottom = (0, react.useCallback)(() => {
		cancelPendingFollow();
		navigation.cancel();
		reading.followTail();
	}, [
		navigation,
		reading,
		cancelPendingFollow
	]);
	return {
		listRef,
		columnRef,
		...state,
		busyTurn,
		motion: viewport.motion,
		navigateToTurn: navigation.navigateToTurn,
		loadEarlier: navigation.loadEarlier,
		returnToBottom
	};
}
