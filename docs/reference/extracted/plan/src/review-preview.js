// Extracted from @deepseek-ai/dsh-client-ui-plan (lib/client.js); region lib/types/client/review-preview.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Name one temporary review within its browser lifetime and Session.
		* @param sessionId - Session displaying the review.
		* @param requestKey - Browser-unique pending request identity.
		* @returns the address used to focus or reopen its preview.
		*/
		function reviewPreviewAddress(sessionId, requestKey) {
			return `dsh-resource://plan-review/${encodeURIComponent(sessionId)}/${encodeURIComponent(requestKey)}`;
		}
		/**
		* Recognize temporary plan navigation without interpreting it as logged history.
		* @param address - Saved or caller-supplied navigation address.
		* @returns whether the address identifies a temporary review preview.
		*/
		function isReviewPreviewAddress(address) {
			return /^dsh-resource:\/\/plan-review\/[^/?#]+\/[^/?#]+$/.test(address);
		}
