// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/stop-sequence.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** One short-lived first press, cleared before an accepted cancellation runs. */
var StopSequence = class {
	intervalMs;
	release;
	first;
	timer;
	/**
	* @param intervalMs - validated maximum time between independent presses.
	* @param release - releases observations retained by the pending first press.
	*/
	constructor(intervalMs, release) {
		this.intervalMs = intervalMs;
		this.release = release;
	}
	/** Clear the first press and its expiry timer. */
	reset() {
		this.first = void 0;
		clearTimeout(this.timer);
		this.timer = void 0;
		this.release();
	}
	/**
	* Accept one eligible, non-repeated Escape against freshly resolved current state.
	* @param target - live turn and actual focused input region.
	* @returns whether this press requested cancellation.
	*/
	press(target) {
		const first = this.first;
		this.reset();
		if (first !== void 0 && performance.now() <= first.deadline && first.target.sessionId === target.sessionId && first.target.turn === target.turn && first.target.generation === target.generation && first.target.region === target.region) {
			target.cancel();
			return true;
		}
		this.first = {
			target,
			deadline: performance.now() + this.intervalMs
		};
		this.timer = setTimeout(() => {
			this.reset();
		}, this.intervalMs + 1);
		return false;
	}
};
