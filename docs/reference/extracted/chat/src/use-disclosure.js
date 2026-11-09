// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/use-disclosure.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Bind independent disclosure state to a Chat seat's reset source. */
/**
* Own one initially collapsed disclosure without an external subscription.
* @param version - reset generation; unchanged generations retain local open state.
* @returns the open state, an explicit setter, and a toggle action.
*/
function useDisclosure(version = 0) {
	const [expandedVersion, setExpandedVersion] = (0, react.useState)(null);
	return {
		expanded: expandedVersion === version,
		setExpanded: (0, react.useCallback)((open) => {
			setExpandedVersion(open ? version : null);
		}, [version]),
		toggle: (0, react.useCallback)(() => {
			setExpandedVersion((previous) => previous === version ? null : version);
		}, [version])
	};
}
/**
* Bind a Hook without subscribing until a component calls it.
* @param reset - stable source whose version advances when the seat is hidden by its Turn.
* @returns a Hook with independent open state for each invocation.
*/
function bindDisclosure(reset) {
	const subscribe = (listener) => reset.subscribe(listener);
	const getSnapshot = () => reset.getSnapshot();
	return function useBoundDisclosure() {
		return useDisclosure((0, react.useSyncExternalStore)(subscribe, getSnapshot));
	};
}
