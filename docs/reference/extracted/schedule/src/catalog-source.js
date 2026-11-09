// Extracted from @deepseek-ai/dsh-client-ui-schedule (lib/client.js); region lib/types/client/catalog-source.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Authoritative Schedule queries and deletion for Session and Host catalogs. */
/**
* Create a catalog whose Remote subscriptions follow its framework subscribers.
* Mutations retain visible rows until an authoritative list read succeeds, and
* each deletion resolves with its own outcome for the caller to report.
* @param deps - Remote calls and invalidation subscriptions.
* @returns observable catalog, component callbacks, and acknowledged-creation retention.
*/
function createCatalogSource(deps) {
	let snapshot = {
		records: [],
		status: "loading",
		deleting: [],
		settled: false,
		readRequest: 0,
		readSettled: 0
	};
	const listeners = /* @__PURE__ */ new Set();
	let disposers = [];
	let epoch = 0;
	let lifecycle = 0;
	const publish = (next) => {
		snapshot = next;
		for (const listener of listeners) listener();
	};
	const read = async (request, current) => {
		let result;
		try {
			result = await deps.list();
		} catch (_error) {
			if (current === epoch) publish({
				...snapshot,
				status: "error"
			});
			return;
		}
		if (current !== epoch) return;
		publish(result.ok ? {
			...snapshot,
			records: result.value,
			status: "ready",
			settled: true,
			readSettled: request
		} : {
			...snapshot,
			status: "error"
		});
	};
	let batching = false;
	let inFlight;
	let inFlightRequest = 0;
	const refresh = (supersede = false, since = 0) => {
		const request = snapshot.readRequest + 1;
		publish({
			...snapshot,
			status: "loading",
			readRequest: request
		});
		if (!supersede && batching && inFlight !== void 0 && inFlightRequest > since) return inFlight;
		if (!batching) {
			batching = true;
			Promise.resolve().then(() => {
				batching = false;
			});
		}
		const pending = read(request, ++epoch);
		inFlightRequest = request;
		inFlight = pending;
		pending.finally(() => {
			if (inFlight === pending) inFlight = void 0;
		});
		return pending;
	};
	const invalidate = () => {
		refresh(true);
	};
	const remove = async (id) => {
		if (snapshot.deleting.includes(id)) return "pending";
		const started = lifecycle;
		publish({
			...snapshot,
			deleting: [...snapshot.deleting, id]
		});
		let result;
		try {
			result = await deps.remove(id);
		} catch (_error) {
			if (started === lifecycle) publish({
				...snapshot,
				deleting: snapshot.deleting.filter((value) => value !== id)
			});
			return "failed";
		}
		if (started !== lifecycle) return result.ok ? "deleted" : "failed";
		publish({
			...snapshot,
			deleting: snapshot.deleting.filter((value) => value !== id)
		});
		if (result.ok) await refresh(true);
		return result.ok ? "deleted" : "failed";
	};
	return {
		hooks: { catalog: {
			getSnapshot: () => snapshot,
			subscribe(listener) {
				listeners.add(listener);
				if (listeners.size === 1) {
					lifecycle++;
					disposers = [deps.subscribeChanged(invalidate), deps.subscribeReset(invalidate)];
					invalidate();
				}
				return () => {
					listeners.delete(listener);
					if (listeners.size !== 0) return;
					for (const dispose of disposers) dispose();
					disposers = [];
					epoch++;
					lifecycle++;
					snapshot = {
						...snapshot,
						deleting: []
					};
				};
			}
		} },
		onDelete: remove,
		onRetry: (since = 0) => refresh(false, since),
		retainCreated: (record) => {
			epoch++;
			if (!snapshot.records.some((item) => item.id === record.id)) publish({
				...snapshot,
				records: [...snapshot.records, record]
			});
		}
	};
}
