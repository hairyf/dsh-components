// Extracted from @deepseek-ai/dsh-client-ui-schedule (lib/client.js); region lib/types/client/task-tab-target.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Resolve the task one task tab shows.
*
* The Sidebar persists a tab's layout record but not the navigation parameters
* its opener passed, so a restored tab falls back to the binding this page kind
* last wrote for that layout id. The tab's body and its chip resolve the shown
* task the same way; the body additionally needs to know whether the current
* layout still carries parameters, because only a navigated tab reports a
* missing task.
* @module
*/
/**
* Resolve the task one task tab shows from its navigation or its stored binding.
* @param sessionId - the Session holding the tab.
* @param tab - the tab's layout fields and its last navigation.
* @param taskBindings - provider-owned binding store for restored task tabs.
* @returns the navigation, the recovered binding, and the task to show.
*/
function useTaskTabTarget(sessionId, tab, taskBindings) {
	const navigation = scheduleTaskParams(tab.navigation.params);
	const navigated = tab.navigation.params !== void 0;
	const recovered = (0, react.useMemo)(() => navigated ? void 0 : taskBindings.read(sessionId, {
		id: tab.id,
		kind: tab.kind,
		contentId: tab.contentId
	}), [
		taskBindings,
		sessionId,
		tab.id,
		tab.kind,
		tab.contentId,
		navigated,
		tab.navigation.revision
	]);
	(0, react.useEffect)(() => {
		if (!navigated) taskBindings.dropMismatched(sessionId, {
			id: tab.id,
			kind: tab.kind,
			contentId: tab.contentId
		});
	}, [
		taskBindings,
		sessionId,
		tab.id,
		tab.kind,
		tab.contentId,
		navigated,
		tab.navigation.revision
	]);
	return {
		navigated,
		navigation,
		recovered,
		params: navigation ?? recovered
	};
}
