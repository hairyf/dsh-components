// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/conversation/group-registry.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** One Group Definition per target; registration never instantiates its Builder. */
		var ConversationGroupRegistry = class extends ConversationDefinitionRegistry {
			views;
			/**
			* @param ctx - owning plugin context.
			* @param views - registered target Builder definitions.
			*/
			constructor(ctx, views) {
				super(ctx);
				this.views = views;
			}
			/**
			* Register grouping rules for an existing target.
			* @param definition - business State and grouping output for the declared target data.
			* @returns the effect-owned, idempotent registration disposer.
			*/
			register(definition) {
				if (!this.views.entries().some((view) => view.target === definition.target)) throw new Error(`conversation group target "${definition.target}" is not registered`);
				return this.registerDefinition(definition.target, definition, `conversation group target "${definition.target}" is already registered`, `uiConversation.groups.register(${JSON.stringify(definition.target)})`);
			}
			/**
			* Find the grouping rules registered for one target.
			* @param target - View target.
			* @returns its grouping Definition, when registered.
			*/
			forTarget(target) {
				return this.definitions.get(target);
			}
		};
