// Extracted from @deepseek-ai/dsh-client-ui-workspace (lib/client.js); region lib/types/client/session-actions/derived.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Project one observable into another, recomputing only when the source
* snapshot changes identity, so consumers that select from the projection
* (a Set lookup per row) never rebuild it per read.
* @param source - the observable to project.
* @param project - pure projection of one source snapshot.
* @returns the projected observable, subscribing through the source.
*/
function derive(source, project) {
	let seen;
	let value;
	return {
		getSnapshot: () => {
			const snapshot = source.getSnapshot();
			if (value === void 0 || snapshot !== seen) {
				seen = snapshot;
				value = project(snapshot);
			}
			return value;
		},
		subscribe: (listener) => source.subscribe(listener)
	};
}
