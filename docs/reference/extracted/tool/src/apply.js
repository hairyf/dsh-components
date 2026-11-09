// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/apply.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Required services: Slots, live Session paths, and the Remote face carrying the Host home used for POSIX `~`. */
		const inject = [
			"slots",
			"remote",
			"sessions"
		];
		/**
		* Mount the whole-Tool renderers and built-in atomic Tool registrations.
		* @param ctx - Client root context.
		*/
		function apply(ctx) {
			const hostInfo = {
				getSnapshot: () => ctx.remote.$host,
				subscribe: (listener) => ctx.on("connection/reset", listener)
			};
			const fileInject = toolFileInject(ctx);
			const toolInject = (sessionId) => ({
				...fileInject(sessionId),
				hooks: { hostInfo }
			});
			ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
				name: "conversation.chat.node",
				key: "tool-call",
				locale: CONVERSATION_NS,
				children: { "tool.call.toolview": {
					kind: "keyed",
					scope: "session"
				} },
				inject: toolInject
			}, ToolCallTree));
			ctx.plugin(bashToolviewSample);
			ctx.plugin(readToolview);
			ctx.plugin(readImageToolview);
			ctx.plugin(fileMutationToolview);
			ctx.plugin(searchToolview);
			ctx.plugin(webToolview);
			ctx.plugin(todoToolview);
			ctx.plugin(detailsToolview);
			ctx.plugin(askQuestionToolview);
		}
