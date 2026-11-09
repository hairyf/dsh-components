// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/turn-rail-items.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* View-layer union of the host turn outline and the loaded rail items. The
		* conversation snapshot never carries projection values, so this merge is the
		* one place the rail's two sources meet: the `turnOutline` projection names
		* every turn of the session, and the loaded window supplies anchors and
		* richer previews for the turns it holds.
		*/
		const EMPTY_ITEMS$1 = [];
		/**
		* Structurally narrow one wire outline entry (projection values cross the
		* wire). `turn` and `seq` are the load-bearing fields — a mark cannot exist
		* or jump without them — so their damage drops the entry; the previews are
		* decorative, so a malformed one degrades to `''` and the turn stays
		* navigable by number.
		*/
		function outlineEntry(value) {
			if (typeof value !== "object" || value === null) return void 0;
			const entry = value;
			if (typeof entry.turn !== "number" || !Number.isSafeInteger(entry.turn) || entry.turn < 0) return void 0;
			if (typeof entry.seq !== "number" || !Number.isSafeInteger(entry.seq) || entry.seq < 0 || Object.is(entry.seq, -0)) return void 0;
			return {
				turn: entry.turn,
				seq: SessionSeq(entry.seq),
				prompt: typeof entry.prompt === "string" ? entry.prompt : "",
				response: typeof entry.response === "string" ? entry.response : ""
			};
		}
		/** Wire outline entries, or none when the projection is absent or malformed. */
		function outlineEntries(outline) {
			return Array.isArray(outline) ? outline : EMPTY_ITEMS$1;
		}
		/**
		* Merge the host outline with the loaded rail items into the full ladder.
		* A turn present in both sides keeps the loaded anchor, taking an outline
		* preview only where the window's own is empty (a mid-Turn window head, or a
		* turn whose loaded nodes carry no text); turns on one side only pass
		* through. Result ascends by turn.
		* @param loaded - loaded-window rail items (timeline order).
		* @param outline - `turnOutline` projection value, treated as wire data.
		* @returns every known turn, ascending; a stable empty array when none.
		*/
		function mergeTurnRailItems(loaded, outline) {
			const byTurn = /* @__PURE__ */ new Map();
			for (const raw of outlineEntries(outline)) {
				const entry = outlineEntry(raw);
				if (entry === void 0) continue;
				byTurn.set(entry.turn, {
					turn: entry.turn,
					prompt: entry.prompt,
					response: entry.response,
					anchor: {
						kind: "unloaded",
						seq: entry.seq
					}
				});
			}
			for (const item of loaded) {
				const preview = byTurn.get(item.turn);
				byTurn.set(item.turn, {
					turn: item.turn,
					prompt: item.prompt !== "" ? item.prompt : preview?.prompt ?? "",
					response: item.response !== "" ? item.response : preview?.response ?? "",
					anchor: {
						kind: "loaded",
						key: item.anchorKey
					}
				});
			}
			if (byTurn.size === 0) return EMPTY_ITEMS$1;
			return [...byTurn.values()].sort((left, right) => left.turn - right.turn);
		}
