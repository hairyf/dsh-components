// Extracted from @deepseek-ai/dsh-client-ui-attachment (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Slot registry required by the attachment presentation plugin. */
const inject = ["slots", "fileDrag"];
/**
* Register composer attachments and the shared gallery with its domain adapters.
* @param ctx - client plugin context with the Slot registry.
*/
function apply(ctx) {
	ctx.slots.registerFactory({
		name: "conversation.images.content",
		scope: "root",
		locale: "conversation",
		inject: () => ({ fileDrag: ctx.fileDrag.actions })
	}, MessageImagesContent);
	ctx.slots.inject("conversation.input.attachments", () => ctx.slots.register({
		name: "conversation.input.attachments",
		inject: () => ({ readFileDrag: ctx.fileDrag.read }),
		locale: "conversation"
	}, ComposerAttachments));
	ctx.slots.inject("conversation.chat.message.images", () => ctx.slots.register({
		name: "conversation.chat.message.images",
		priority: 100
	}, MessageImages));
	ctx.slots.inject("conversation.chat.user.images", () => ctx.slots.register({
		name: "conversation.chat.user.images",
		priority: 100
	}, MessageImages));
	ctx.slots.inject("conversation.trajectory.images", () => ctx.slots.register({
		name: "conversation.trajectory.images",
		priority: 100
	}, MessageImages));
	ctx.slots.inject("tool.call.images", () => ctx.slots.register({
		name: "tool.call.images",
		priority: 100
	}, MessageImages));
}
