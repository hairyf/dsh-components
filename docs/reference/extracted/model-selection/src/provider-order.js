// Extracted from @deepseek-ai/dsh-client-ui-model-selection (lib/client.js); region lib/types/client/provider-order.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Shared provider display order for the composer and command model pickers. */
/**
* Put the account and official providers first, preserving every other relative order.
* @param groups - Provider groups in catalog order.
* @returns a sorted copy; model order within each group is unchanged.
*/
function orderModelProviders(groups) {
	return groups.toSorted((left, right) => (left.id === "deepseek-account" ? 0 : left.id === "deepseek-official" ? 1 : 2) - (right.id === "deepseek-account" ? 0 : right.id === "deepseek-official" ? 1 : 2));
}
