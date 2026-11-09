// Extracted from @deepseek-ai/dsh-client-ui-settings-subagent (lib/client.js); region lib/types/client/subagent-limits-card-controller.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Staged delegation limits backed by the Host's subagent settings section. */
		function limitField(field, minimum) {
			const numeric = (0, _deepseek_ai_dsh_client_ui_primitives.settingsNumberField)(field);
			return {
				...numeric,
				parse: (text) => {
					const write = numeric.parse(text);
					if (write?.kind !== "set") return write;
					const value = write.value;
					return Number.isSafeInteger(value) && value >= minimum && !Object.is(value, -0) ? write : void 0;
				}
			};
		}
		/** Bind two independently resettable limits to one staged settings form. */
		var SubagentLimitsCardController = class {
			form;
			store;
			/** @param scope - The Host's `subagent` settings section. */
			constructor(scope) {
				this.form = new _deepseek_ai_dsh_client_ui_primitives.SettingsFormModel(scope, [limitField("maxDepth", 0), limitField("maxActiveSubagents", 1)]);
				this.store = this.form.bind(() => ({
					...this.form.shell(),
					maxDepth: this.form.field("maxDepth"),
					maxActiveSubagents: this.form.field("maxActiveSubagents")
				}));
			}
			/**
			* Bind the limits editor to the slot renderer.
			* @returns The limits snapshot and staged write actions.
			*/
			inject() {
				return {
					hooks: { subagentLimitsCard: this.store },
					...this.form.actions()
				};
			}
			/** Release accepted-value subscriptions. */
			dispose() {
				this.form.dispose();
			}
		};
