// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/toolviews/read-image-row.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* read_image row: the read-family chrome with the durably committed image as the
		* row's collapsed-by-default card body, rendered through the `tool.call.images`
		* slot this entry declares.
		*/
		function ReadImageRow(props) {
			const { block, renderSlot, loadImage } = props;
			const { getTriggerProps } = props.useContextMenu();
			return readFamilyRow(props, {
				image: imageCardModel(block),
				renderSlot,
				loadImage
			}, getTriggerProps);
		}
		/**
		* The read_image row as a plain registrant plugin following the atomic Tool-view
		* declaration across independent activation and reload lifetimes. Declaring
		* `tool.call.images` as a child slot authorizes this entry's `renderSlot` to
		* dispatch the gallery.
		*/
		const readImageToolview = {
			name: "read-image-toolview",
			inject: ["slots", "sessions"],
			/**
			* Register the read_image row into the Tool-owned keyed view slot.
			* @param ctx - registrant context (disposal rides ctx.effect inside slots.register).
			*/
			apply(ctx) {
				ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
					name: "tool.call.toolview",
					key: "read_image",
					locale: CONVERSATION_NS,
					inject: toolFileInject(ctx),
					children: { "tool.call.images": {
						kind: "single",
						scope: "session"
					} }
				}, ReadImageRow));
			}
		};
