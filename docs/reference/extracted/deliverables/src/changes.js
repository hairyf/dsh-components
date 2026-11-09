// Extracted from @deepseek-ai/dsh-client-ui-deliverables (lib/client.js); region lib/types/changes.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Authenticated GET route serving one announced change summary while its Session lives. */
		const CHANGED_FILES_PATH = "/api/changes.summary";
		/** Authenticated GET route serving one listed file's turn-start and turn-end comparison while its Session lives. */
		const CHANGES_DIFF_PATH = "/api/changes.diff";
		/** Authenticated POST route for opening a changed file on the Host desktop. */
		const CHANGES_OPEN_PATH = "/api/changes.open";
		/**
		* Browser-relative form of {@link CHANGED_FILES_PATH}; see
		* .agents/notes/implemented/architecture/2026-09-14-web-document-relative-app-routes.md.
		*/
		const CHANGED_FILES_ROUTE = CHANGED_FILES_PATH.slice(1);
		/** Browser-relative form of {@link CHANGES_DIFF_PATH}. */
		const CHANGES_DIFF_ROUTE = CHANGES_DIFF_PATH.slice(1);
		/** Browser-relative form of {@link CHANGES_OPEN_PATH}. */
		const CHANGES_OPEN_ROUTE = CHANGES_OPEN_PATH.slice(1);
		/** Resource-address prefix of a turn's review tab in the right Sidebar. */
		const CHANGES_REVIEW_ADDRESS = "dsh-resource://changes-review/session/";
		function isRecord$1(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		/**
		* Validate one changed-file record read from the summary route.
		* @param value - decoded JSON.
		* @returns whether the record carries a path, a display path, and line counts.
		*/
		function isChangedFile(value) {
			if (!isRecord$1(value)) return false;
			const { path, display, added, deleted, binary, oversized } = value;
			return typeof path === "string" && path.length > 0 && typeof display === "string" && display.length > 0 && Number.isSafeInteger(added) && Number.isSafeInteger(deleted) && (binary === void 0 || binary === true) && (oversized === void 0 || oversized === true);
		}
		/**
		* Validate a summary read from the summary route.
		* @param value - decoded JSON.
		* @returns whether the value identifies a turn, a complete file list, the total count, and the line totals.
		*/
		function isChangesSummary(value) {
			if (!isRecord$1(value)) return false;
			const { turn, files, total, added, deleted } = value;
			return Number.isSafeInteger(turn) && turn >= 1 && Number.isSafeInteger(total) && Number.isSafeInteger(added) && Number.isSafeInteger(deleted) && Array.isArray(files) && files.every(isChangedFile);
		}
		function isHunk(value) {
			if (!isRecord$1(value)) return false;
			const { oldStart, oldLines, newStart, newLines, lines } = value;
			return [
				oldStart,
				oldLines,
				newStart,
				newLines
			].every((field) => Number.isSafeInteger(field) && field >= 0) && Array.isArray(lines) && lines.every((line) => typeof line === "string" && /^[+ -]/.test(line));
		}
		/**
		* Validate a comparison read from the comparison route.
		* @param value - decoded JSON.
		* @returns whether the value is a text comparison with well-formed hunks, or a binary or oversized refusal.
		*/
		function isChangesDiff(value) {
			if (!isRecord$1(value)) return false;
			const { kind, path, display } = value;
			if (typeof path !== "string" || path.length === 0 || typeof display !== "string" || display.length === 0) return false;
			if (kind === "binary" || kind === "oversized") return true;
			if (kind !== "text") return false;
			const { before, after, hunks, coarse } = value;
			return typeof before === "boolean" && typeof after === "boolean" && typeof coarse === "boolean" && Array.isArray(hunks) && hunks.every(isHunk);
		}
		/**
		* Validate the `workspace/changes` event data read from a Session log.
		* @param value - decoded durable event data.
		* @returns whether the event names a turn.
		*/
		function isChangesEvent(value) {
			return isRecord$1(value) && Number.isSafeInteger(value.turn) && value.turn >= 1;
		}
		/**
		* Build authenticated coordinates for the summary one `workspace/changes` event announced.
		* @param sessionId - owning Session.
		* @param seq - event sequence.
		* @returns document-relative summary route.
		*/
		function changesSummaryUrl(sessionId, seq) {
			return `${CHANGED_FILES_ROUTE}?${new URLSearchParams({
				sessionId,
				seq: String(seq)
			})}`;
		}
		/**
		* Build authenticated coordinates for one listed file's comparison.
		* @param sessionId - owning Session.
		* @param seq - workspace/changes event sequence.
		* @param index - original index in the summary's files array.
		* @returns document-relative comparison route.
		*/
		function changesDiffUrl(sessionId, seq, index) {
			return `${CHANGES_DIFF_ROUTE}?${new URLSearchParams({
				sessionId,
				seq: String(seq),
				index: String(index)
			})}`;
		}
		/**
		* Build authenticated coordinates for a changed file's native open.
		* @param sessionId - owning Session.
		* @param seq - workspace/changes event sequence.
		* @param index - original index in the summary's files array.
		* @returns document-relative action route.
		*/
		function changedFileUrl(sessionId, seq, index) {
			return `${CHANGES_OPEN_ROUTE}?${new URLSearchParams({
				sessionId,
				seq: String(seq),
				index: String(index)
			})}`;
		}
		/**
		* The right-Sidebar address of one turn's review. The Session and the event
		* sequence identify the content; the turn rides along for the tab title.
		* @param coordinates - viewed Session, announcing event, and turn.
		* @returns a `dsh-resource://changes-review/session/…` address.
		*/
		function changesReviewAddress(coordinates) {
			const { sessionId, seq, turn } = coordinates;
			return `${CHANGES_REVIEW_ADDRESS}${encodeURIComponent(sessionId)}/${seq}/${turn}`;
		}
		/**
		* Read the coordinates back out of a review address.
		* @param address - a resource address.
		* @returns the coordinates, or undefined for any other address.
		*/
		function parseChangesReviewAddress(address) {
			if (!address.startsWith("dsh-resource://changes-review/session/")) return void 0;
			const parts = address.slice(38).split("/");
			if (parts.length !== 3) return void 0;
			const [sessionId, seq, turn] = parts;
			if (sessionId === "" || !/^\d+$/.test(seq) || !/^[1-9]\d*$/.test(turn)) return void 0;
			try {
				return {
					sessionId: decodeURIComponent(sessionId),
					seq: Number(seq),
					turn: Number(turn)
				};
			} catch {
				return;
			}
		}
