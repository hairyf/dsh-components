// Extracted from @deepseek-ai/dsh-client-ui-settings-agent-loop (lib/client.js); region lib/types/client/agent-loop-card-controller.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** The agent-loop page's staged form over the `agent-loop` settings namespace. */
		/**
		* Namespace of the agent loop's user-owned settings. Spelled here rather than
		* imported: a client package must not depend on a Host package.
		*/
		const AGENT_LOOP_NS = "agent-loop";
		/** Bridges the `agent-loop` scope onto the page's staged form. */
		var AgentLoopCardController = class {
			form;
			store;
			/** @param scope - the bound settings scope for the `agent-loop` namespace. */
			constructor(scope) {
				this.form = new _deepseek_ai_dsh_client_ui_primitives.SettingsFormModel(scope, [(0, _deepseek_ai_dsh_client_ui_primitives.settingsNumberField)("maxParallelToolCalls")]);
				this.store = this.form.bind(() => this.projection());
			}
			projection() {
				return {
					...this.form.shell(),
					maxParallelToolCalls: this.form.field("maxParallelToolCalls")
				};
			}
			/**
			* Build the face the page's slot registration injects.
			* @returns the page's snapshot and its form actions.
			*/
			inject() {
				return {
					hooks: { agentLoopCard: this.store },
					...this.form.actions()
				};
			}
			/** Release accepted-value subscriptions. */
			dispose() {
				this.form.dispose();
			}
		};
