// Extracted from @deepseek-ai/dsh-client-ui-commands (lib/client.js); region lib/types/client/option-groups.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Group rows by their caller-owned group name, without sorting groups or rows.
* Ungrouped rows occupy one block at their first occurrence.
* @param options - Options in display order.
* @returns groups in first-occurrence order, with original option objects.
*/
function groupOptions(options) {
	const groups = /* @__PURE__ */ new Map();
	for (const option of options) {
		const name = option.group?.name;
		const existing = groups.get(name);
		if (existing !== void 0) existing.rows.push(option);
		else groups.set(name, {
			group: option.group,
			rows: [option]
		});
	}
	return [...groups.values()];
}
