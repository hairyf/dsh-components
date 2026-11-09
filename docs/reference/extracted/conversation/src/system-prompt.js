// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/contract/system-prompt.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Apply a system event or positional replacement without retaining ordinary messages.
* Replacement positions inherit their start endpoint, not their chronological seq.
* Unknown older endpoint order withholds the prompt until prepend replay resolves it.
* @param previous - Interpretation at the preceding relevant event in the loaded window.
* @param event - System message or surface replacement already admitted by Session.
* @returns Immutable surviving system facts and the effective nonempty prompt.
*/
function inspectSystemPrompt(previous, event) {
	const op = isSurfaceEvent(event) ? event.surfaceOp : void 0;
	const firstSeq = previous?.firstSeq ?? event.seq;
	let nodes = previous?.nodes ?? [];
	let replacements = previous?.replacements ?? /* @__PURE__ */ new Map();
	const unknownEndpoint = (seq) => seq < firstSeq && !replacements.has(seq);
	const uncertain = previous?.uncertain === true || op !== void 0 && op !== "append" && (unknownEndpoint(op.startSeq) || unknownEndpoint(op.endSeq));
	if (uncertain) return {
		firstSeq,
		uncertain,
		nodes: [],
		replacements: /* @__PURE__ */ new Map(),
		effective: void 0,
		introduced: void 0
	};
	let position = event.seq;
	if (op !== void 0 && op !== "append") {
		position = replacements.get(op.startSeq) ?? op.startSeq;
		const end = replacements.get(op.endSeq) ?? op.endSeq;
		nodes = nodes.filter((item) => item.position < position || item.position > end);
		const retained = new Map([...replacements].filter(([, value]) => value < position || value > end));
		retained.set(event.seq, position);
		replacements = retained;
	}
	const introduced = event.type === "system/message" ? {
		seq: event.seq,
		time: event.time,
		turn: event.data.turn,
		step: event.data.step,
		text: event.data.message.content.flatMap((block) => block.type === "text" ? [block.text] : []).join(""),
		update: op === "append" && previous?.nodes.some((item) => item.node.text !== "") === true
	} : void 0;
	if (introduced !== void 0) nodes = [...nodes, {
		position,
		node: introduced
	}].sort((a, b) => a.position - b.position);
	const surviving = nodes.findLast((item) => item.node.text !== "")?.node;
	const effective = surviving === previous?.nodes.findLast((item) => item.node.text !== "")?.node ? previous?.effective : introduced !== void 0 && introduced === surviving ? introduced : {
		seq: event.seq,
		time: event.time,
		turn: surviving?.turn ?? 0,
		step: surviving?.step ?? 0,
		text: surviving?.text ?? "",
		update: false
	};
	return {
		firstSeq,
		uncertain,
		nodes,
		replacements,
		effective,
		introduced
	};
}
