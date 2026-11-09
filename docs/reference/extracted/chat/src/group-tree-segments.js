// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/conversation-nodes/group-tree-segments.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		const NO_TURNS = [];
		/**
		* Loaded Turns split into consecutive segments at the Turns holding a Node at
		* one group-tree position, visible or hidden. The latest segment starts at the
		* last such Turn, or at the first loaded Turn when none is loaded. Node changes
		* update per-Turn counts without scanning the loaded Nodes; `settle` returns at
		* once while the start holds and otherwise reads loaded Turns only from the
		* earlier of the previous and new starts.
		*/
		var GroupTreeSegments = class {
			position;
			/** Opening Node count by owning Turn. */
			openings = /* @__PURE__ */ new Map();
			latestOpening;
			latestStart;
			/** @param position - group-tree position whose Nodes open a segment. */
			constructor(position) {
				this.position = position;
			}
			/**
			* Account one Node change.
			* @param previous - replaced Node; absent for an addition.
			* @param next - replacing Node; absent for a removal.
			*/
			track(previous, next) {
				const before = this.openingTurn(previous);
				const after = this.openingTurn(next);
				if (before === after) return;
				if (before !== void 0 && this.adjust(before, -1) === 0 && before === this.latestOpening) this.latestOpening = this.lastOpeningTurn();
				if (after !== void 0) {
					this.adjust(after, 1);
					if (this.latestOpening === void 0 || after > this.latestOpening) this.latestOpening = after;
				}
			}
			/**
			* Test latest-segment membership as of the last `settle`.
			* @param turn - owning Turn, when resolved.
			* @returns whether the Turn belongs to the latest segment.
			*/
			inLatest(turn) {
				return turn !== void 0 && this.latestStart !== void 0 && turn >= this.latestStart;
			}
			/**
			* Move the latest segment start for the currently loaded Turns.
			* @param turnOrder - loaded Turns in ascending timeline order.
			* @returns loaded Turns that entered or left the latest segment, in ascending order.
			*/
			settle(turnOrder) {
				const previous = this.latestStart;
				const start = this.latestOpening ?? turnOrder[0];
				if (start === previous) return NO_TURNS;
				this.latestStart = start;
				const bounded = previous !== void 0 && start !== void 0;
				const low = bounded ? Math.min(previous, start) : Number.NEGATIVE_INFINITY;
				const high = bounded ? Math.max(previous, start) : Number.POSITIVE_INFINITY;
				const changed = [];
				for (const turn of turnOrder.slice(turnOrder.findLastIndex((turn) => turn < low) + 1)) {
					if (turn >= high) break;
					changed.push(turn);
				}
				return changed;
			}
			openingTurn(node) {
				return node !== void 0 && isAtOrOutside(node, this.position) ? locationCoordinates(node.location).turn : void 0;
			}
			lastOpeningTurn() {
				let last;
				for (const turn of this.openings.keys()) if (last === void 0 || turn > last) last = turn;
				return last;
			}
			/** @returns the Turn's opening count after the change; zero removes the Turn. */
			adjust(turn, delta) {
				const next = (this.openings.get(turn) ?? 0) + delta;
				if (next > 0) this.openings.set(turn, next);
				else this.openings.delete(turn);
				return next;
			}
		};
