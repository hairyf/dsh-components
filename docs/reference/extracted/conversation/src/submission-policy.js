// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/input/submission-policy.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Composer submission policy. It owns the live busy-Enter preference and
		* resolves submission gestures into queue/steer delivery modes; Host and
		* Agent keep the actual delivery-window authority.
		*/
		/**
		* Resolve one submission gesture against the busy-Enter preference. Plain
		* Enter and the primary Send button share the `enter` gesture, so the button
		* delivers exactly what Enter would. Direct `steer` is intentionally
		* best-effort: AgentLoop turns a closed-window submission into the next waking
		* Queue item.
		* @param preferred - the live busy-Enter preference.
		* @param running - whether the addressed agent currently reports busy.
		* @param gesture - plain Enter (or the Send button) or the Cmd/Ctrl-accelerated chord.
		* @param steeringAvailable - whether this session transport supports steering.
		* @returns Queue outside steer-capable busy state; otherwise the preferred mode or its opposite.
		*/
		function resolveSubmitMode(preferred, running, gesture, steeringAvailable) {
			if (!running || !steeringAvailable) return "queue";
			if (gesture === "enter") return preferred;
			return preferred === "queue" ? "steer" : "queue";
		}
		/**
		* Busy-Enter preference shared by the composer bar inject face and its
		* Settings row: one live store the bar's submission gestures and Send label
		* read, backed by the Host user-settings document when one is composed.
		*/
		var ComposerSubmissionPolicy = class {
			/** Reactive preference source for the composer bar and the Settings row. */
			busyEnter = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(DEFAULT_BUSY_ENTER_BEHAVIOR);
			unsubscribe;
			host;
			/**
			* @param host Shared configuration form; omitted keeps the browser-local default.
			*/
			constructor(host) {
				this.host = host;
				if (host !== void 0) {
					this.unsubscribe = host.subscribe(() => {
						this.adopt(host);
					});
					this.adopt(host);
				}
			}
			/** Release the preference subscription. */
			dispose() {
				this.unsubscribe?.();
			}
			/**
			* Change the busy-state submission behavior; the live value publishes
			* before the durable write starts.
			* @param behavior - Queue or Steer.
			*/
			setBusyEnter(behavior) {
				if (this.busyEnter.getSnapshot() === behavior) return;
				this.busyEnter.set(behavior);
				this.host?.set(BUSY_ENTER_FIELD, behavior);
			}
			/**
			* Adopt the scope's accepted durable behavior without writing it back.
			* @param host - the constructor-narrowed scope driving this adoption.
			*/
			adopt(host) {
				const section = host.getSnapshot().value;
				if (section === void 0 || this.busyEnter.getSnapshot() === section.busyEnter) return;
				this.busyEnter.set(section.busyEnter);
			}
		};
