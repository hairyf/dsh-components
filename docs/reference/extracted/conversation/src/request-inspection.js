// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/contract/request-inspection.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Canonicalize one request header against the system node in force and
* classify the model-visible prompt change.
* @param previous - Prompt from the preceding loaded request header, when available.
* @param event - Durable full request header to inspect.
* @param system - Effective nonempty system prompt after loaded surface replacements; empty when removed.
* An in-history update already presented its text at its own position, so the header reports no system change for it.
* @returns The canonical prompt and an initial/system/tool change when it can be established.
*/
function inspectRequestPrompt(previous, event, system) {
	const header = event.data.header;
	const rawTools = header.tools;
	const prompt = {
		config: header.config,
		system: system?.text ?? "",
		tools: Array.isArray(rawTools) ? rawTools : []
	};
	if (previous === void 0 && event.data.reason !== "initial") return { prompt };
	const systemChanged = previous !== void 0 && previous.system !== prompt.system && system?.update !== true;
	const toolsChanged = previous !== void 0 && JSON.stringify(previous.tools) !== JSON.stringify(prompt.tools);
	if (previous !== void 0 && !systemChanged && !toolsChanged) return { prompt };
	const origin = system !== void 0 && (previous === void 0 || systemChanged) ? system : event;
	return {
		prompt,
		change: {
			seq: origin.seq,
			time: origin.time,
			kind: previous === void 0 ? "initial" : systemChanged && toolsChanged ? "system-and-tools" : systemChanged ? "system" : "tools",
			...previous === void 0 ? {} : { previous }
		}
	};
}
