// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/searchable-hidden.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Apply searchable hidden state without unmounting a stable subtree.
* @param hidden - whether the subtree is currently hidden.
* @param reveal - callback for browser find's beforematch reveal.
* @param transition - optional caller-owned visibility operation; otherwise apply synchronously.
* @returns ref for the stable subtree root.
*/
function useSearchableHidden(hidden, reveal, transition) {
	const ref = (0, react.useRef)(null);
	(0, react.useLayoutEffect)(() => {
		const element = ref.current;
		if (element === null) return;
		if (hidden && element.contains(element.ownerDocument.activeElement)) {
			reveal();
			return;
		}
		const commit = () => {
			if (hidden) element.setAttribute("hidden", "until-found");
			else element.removeAttribute("hidden");
		};
		if (transition === void 0) commit();
		else transition(element, hidden, commit);
	}, [
		hidden,
		reveal,
		transition
	]);
	(0, react.useEffect)(() => {
		const element = ref.current;
		if (element === null) return;
		element.addEventListener("beforematch", reveal);
		return () => {
			element.removeEventListener("beforematch", reveal);
		};
	}, [reveal]);
	return ref;
}
