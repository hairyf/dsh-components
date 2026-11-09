// Extracted from @deepseek-ai/dsh-client-ui-deliverables (lib/client.js); region lib/types/client/review-definition.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** The tab kind this package owns. */
const CHANGES_REVIEW_KIND = "changes-review";
/** This implementation's identity in the tab system, and the key its body registers under. */
const CHANGES_REVIEW_ID = "@deepseek-ai/dsh-client-ui-deliverables";
/**
* The review type's registry definition.
* @param t - namespace-bound translate, read fresh on every title call.
* @returns the definition to register.
*/
function changesReviewDefinition(t) {
	return {
		id: CHANGES_REVIEW_ID,
		kind: CHANGES_REVIEW_KIND,
		patterns: ["dsh-resource://changes-review/**"],
		priority: "builtin",
		canOpen: (address) => parseChangesReviewAddress(address) !== void 0,
		title: (address) => {
			const turn = parseChangesReviewAddress(address)?.turn;
			return turn === void 0 ? address : t("review.title", { turn: String(turn) });
		}
	};
}
