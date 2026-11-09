// Extracted from @deepseek-ai/dsh-client-ui-open-in-app (lib/client.js); region lib/types/client/file-applications.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** File association reads shared by mounted controls using the same reader and target. */
const EMPTY = {
	apps: [],
	loading: true,
	failed: false
};
const readers = /* @__PURE__ */ new WeakMap();
/** Each mounted consumer retains the query; the last release cancels and discards it. */
function subscribe(query, target, listener) {
	let targets = readers.get(query);
	if (targets === void 0) {
		targets = /* @__PURE__ */ new Map();
		readers.set(query, targets);
	}
	let entry = targets.get(target);
	const initial = entry === void 0;
	if (entry === void 0) {
		const created = {
			state: (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(EMPTY),
			users: 0,
			controller: null,
			refresh: () => {
				created.controller?.abort();
				const controller = new AbortController();
				created.controller = controller;
				query(target, controller.signal).then((apps) => {
					if (!controller.signal.aborted) created.state.set({
						apps: apps ?? [],
						loading: false,
						failed: apps === null
					});
				});
			}
		};
		entry = created;
		targets.set(target, entry);
	}
	const retained = entry;
	retained.users += 1;
	const release = retained.state.subscribe(listener);
	if (initial) retained.refresh();
	return () => {
		release();
		retained.users -= 1;
		if (retained.users === 0) {
			retained.controller?.abort();
			targets.delete(target);
		}
	};
}
/**
* Share associations and refreshes across mounted controls for the same file and reader.
* @param target - path or authenticated route identifying the current file.
* @param query - stable reader scoped to the serving Host; failures resolve to null.
* @param enabled - whether a native desktop is available.
* @returns metadata, initial loading state, failure state, and a shared refresh callback.
*/
function useFileApplications(target, query, enabled) {
	const retain = (0, react.useCallback)((listener) => enabled ? subscribe(query, target, listener) : () => {}, [
		enabled,
		query,
		target
	]);
	const snapshot = (0, react.useCallback)(() => enabled ? readers.get(query)?.get(target)?.state.getSnapshot() ?? EMPTY : EMPTY, [
		enabled,
		query,
		target
	]);
	const state = (0, react.useSyncExternalStore)(retain, snapshot, snapshot);
	const refresh = (0, react.useCallback)(() => {
		readers.get(query)?.get(target)?.refresh();
	}, [query, target]);
	return {
		...state,
		refresh
	};
}
