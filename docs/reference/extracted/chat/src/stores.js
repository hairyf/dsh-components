// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/stores.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Per-Session Chat view store. */
/**
* Resolve the manual disclosure choice for one Turn.
* @param state - Chat store snapshot.
* @param turn - owning Turn.
* @returns the Turn's stored entry, when present.
*/
function storedTurnProcessEntry(state, turn) {
	return state.turnProcesses.find((entry) => entry.turn === turn);
}
/**
* Whether a foldable Turn's process is open: the reader's choice for the current answer generation
* wins; otherwise the latest completed Turn stays open until the next input, and older Turns fold.
* @param state - Chat store snapshot.
* @param spec - the Turn's process specification.
* @param defaultOpen - whether this Turn is exempt from automatic folding.
* @returns the effective open state.
*/
function turnProcessOpen(state, spec, defaultOpen) {
	const stored = storedTurnProcessEntry(state, spec.turn);
	if (stored === void 0 || stored.answerStep !== (spec.answerStep ?? 0)) return defaultOpen;
	return stored.collapsed !== true;
}
/**
* Create the Chat view store handle.
* @returns a handle instantiated once per rendered Session scope.
*/
function createChatStore() {
	return (0, _deepseek_ai_dsh_client_store.defineStore)({
		init: () => ({ turnProcesses: [] }),
		actions: { setTurnProcessOpen: (draft, turn, answerStep, open) => {
			const index = draft.turnProcesses.findIndex((entry) => entry.turn === turn);
			const next = open ? {
				turn,
				answerStep
			} : {
				turn,
				answerStep,
				collapsed: true
			};
			if (index < 0) draft.turnProcesses.push(next);
			else draft.turnProcesses[index] = next;
		} }
	});
}
