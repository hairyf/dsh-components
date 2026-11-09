// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/contract/snapshot.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

const EMPTY_LIST$1 = [];
const EMPTY_TIMELINE = {
	turnOrder: EMPTY_LIST$1,
	turns: /* @__PURE__ */ new Map()
};
const EMPTY_NODE_SOURCE = {
	getSnapshot: () => void 0,
	subscribe: () => () => {}
};
const EMPTY_BOTTOM_SOURCE = {
	getSnapshot: () => false,
	subscribe: () => () => {}
};
const EMPTY_NODE_PROCESS_SOURCE = {
	getSnapshot: () => void 0,
	subscribe: () => () => {}
};
const EMPTY_TURN_NODE_SOURCE = {
	getSnapshot: () => EMPTY_LIST$1,
	subscribe: () => () => {}
};
/** Empty Chat target used before a view builder is registered. */
const EMPTY_CHAT_SNAPSHOT = {
	order: EMPTY_LIST$1,
	nodes: {
		get: () => void 0,
		source: () => EMPTY_NODE_SOURCE,
		bottomSource: () => EMPTY_BOTTOM_SOURCE,
		turnDataSource: () => EMPTY_TURN_NODE_SOURCE,
		processSource: () => EMPTY_NODE_PROCESS_SOURCE,
		values: () => EMPTY_LIST$1
	},
	locations: {
		getTurn: () => EMPTY_LIST$1,
		getStep: () => EMPTY_LIST$1
	},
	navigation: { items: () => EMPTY_LIST$1 },
	timeline: EMPTY_TIMELINE,
	legacy: {
		nodes: EMPTY_LIST$1,
		turnTimings: /* @__PURE__ */ new Map(),
		turnEnds: /* @__PURE__ */ new Map(),
		partial: null,
		runningCalls: EMPTY_LIST$1
	}
};
