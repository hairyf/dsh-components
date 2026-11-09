// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/toolviews/read-row.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Lets users expand a completed read result and open its reported path at the
* line the call started from.
*/
function ReadRow(props) {
	const { block, cwd, home } = props;
	const { getTriggerProps } = props.useContextMenu();
	return readFamilyRow(props, {
		read: readCardModel(block, cwd, home),
		filePathLine: readCallLine(block)
	}, getTriggerProps);
}
/** Registers the read tool's conversation row. */
const readToolview = {
	name: "read-toolview",
	inject: ["slots", "sessions"],
	apply(ctx) {
		ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
			name: "tool.call.toolview",
			key: "read",
			locale: CONVERSATION_NS,
			inject: toolFileInject(ctx)
		}, ReadRow));
	}
};
